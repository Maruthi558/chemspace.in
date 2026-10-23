/**
 * ChemSpace AI Automation Center — API Client Service
 * Connects the frontend interface to backend workflow engine endpoints:
 * - GET /api/automation/status
 * - GET /api/automation/templates
 * - POST /api/automation/plan
 * - POST /api/automation/execute
 * - GET /api/automation/jobs/:id
 * - POST /api/automation/jobs/:id/cancel
 */

const API_BASE = '/api/automation';

export async function fetchAutomationStatus() {
  try {
    const res = await fetch(`${API_BASE}/status`);
    if (!res.ok) throw new Error(`Status check failed: HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[AutomationService] Could not reach backend automation status:', err);
    return {
      status: 'offline',
      tools: [],
      bionemo_integrations: { configured: false, services: {} },
      ai_planner: { configured: false }
    };
  }
}

export async function fetchWorkflowTemplates() {
  try {
    const res = await fetch(`${API_BASE}/templates`);
    if (!res.ok) throw new Error(`Failed to load templates: HTTP ${res.status}`);
    const data = await res.json();
    return data.templates || [];
  } catch (err) {
    console.warn('[AutomationService] Using fallback local templates:', err);
    return [];
  }
}

export async function createWorkflowPlan(prompt, templateId = null) {
  const res = await fetch(`${API_BASE}/plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, template_id: templateId })
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Failed to create workflow plan (${res.status})`);
  }
  return await res.json();
}

export async function executeWorkflow(prompt = null, templateId = null, jobId = null) {
  const res = await fetch(`${API_BASE}/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, template_id: templateId, job_id: jobId })
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Failed to launch workflow (${res.status})`);
  }
  return await res.json();
}

export async function pollJobStatus(jobId) {
  const res = await fetch(`${API_BASE}/jobs/${encodeURIComponent(jobId)}`);
  if (!res.ok) {
    throw new Error(`Failed to poll job status (${res.status})`);
  }
  return await res.json();
}

export async function approveJob(jobId, approved = true) {
  const res = await fetch(`${API_BASE}/jobs/${encodeURIComponent(jobId)}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ approved })
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Approval request failed (${res.status})`);
  }
  return await res.json();
}

export async function cancelJob(jobId) {
  const res = await fetch(`${API_BASE}/jobs/${encodeURIComponent(jobId)}/cancel`, {
    method: 'POST'
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Cancellation failed (${res.status})`);
  }
  return await res.json();
}

export function streamJobStatus(jobId, onMessage, onError) {
  const source = new EventSource(`${API_BASE}/jobs/${encodeURIComponent(jobId)}/stream`);
  source.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
      if (['Completed', 'Failed', 'Cancelled', 'AwaitingApproval'].includes(data.status)) {
        source.close();
      }
    } catch (e) {
      console.warn('[AutomationService] SSE parse error:', e);
    }
  };
  source.onerror = (err) => {
    if (onError) onError(err);
    source.close();
  };
  return () => source.close();
}

export async function validateCompound(input) {
  const res = await fetch(`${API_BASE}/validate-compound`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input })
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Validation request failed (${res.status})`);
  }
  return await res.json();
}

export async function executeBatchWorkflow(compounds, templateId = 'lipinski_screening', receptorPdb = null) {
  const res = await fetch(`${API_BASE}/batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      compounds,
      template_id: templateId,
      receptor_pdb: receptorPdb
    })
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Batch execution failed (${res.status})`);
  }
  return await res.json();
}

// ==========================================
// Scientific Research & Computational Services (/api/research/*)
// ==========================================

const RESEARCH_API_BASE = '/api/research';

export async function calculateMolecularProperties(smiles) {
  const res = await fetch(`${RESEARCH_API_BASE}/molecular/properties`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ smiles })
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Property calculation failed (${res.status})`);
  }
  return await res.json();
}

export async function generateMolecularConformers(smiles, numConformers = 1) {
  const res = await fetch(`${RESEARCH_API_BASE}/molecular/conformers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ smiles, num_conformers: numConformers })
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Conformer generation failed (${res.status})`);
  }
  return await res.json();
}

export async function fetchStructureDetails(pdbId) {
  const res = await fetch(`${RESEARCH_API_BASE}/structure/${encodeURIComponent(pdbId)}`);
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Structure retrieval failed (${res.status})`);
  }
  return await res.json();
}

export async function executeMolecularDocking(smiles, targetPdbId = '6LU7', pocketCenter = null, boxSize = null) {
  const res = await fetch(`${RESEARCH_API_BASE}/docking`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      smiles,
      target_pdb_id: targetPdbId,
      pocket_center: pocketCenter,
      box_size: boxSize
    })
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Docking execution failed (${res.status})`);
  }
  return await res.json();
}

export async function predictAdmetProfile(smiles) {
  const res = await fetch(`${RESEARCH_API_BASE}/admet`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ smiles })
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `ADMET prediction failed (${res.status})`);
  }
  return await res.json();
}

export async function analyzeInteractions(ligandAtoms, ligandCoords, proteinCaCoords, residueNames = null) {
  const res = await fetch(`${RESEARCH_API_BASE}/interactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ligand_atoms: ligandAtoms,
      ligand_coords: ligandCoords,
      protein_ca_coords: proteinCaCoords,
      residue_names: residueNames
    })
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Interaction calculation failed (${res.status})`);
  }
  return await res.json();
}

export async function orchestrateResearchTask(objective, smiles, targetPdbId = '6LU7') {
  const res = await fetch(`${RESEARCH_API_BASE}/orchestrate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      objective,
      smiles,
      target_pdb_id: targetPdbId
    })
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Research orchestration failed (${res.status})`);
  }
  return await res.json();
}

export async function getResearchJobStatus(jobId) {
  const res = await fetch(`${RESEARCH_API_BASE}/jobs/${encodeURIComponent(jobId)}`);
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Research job polling failed (${res.status})`);
  }
  return await res.json();
}

export async function cancelResearchJob(jobId) {
  const res = await fetch(`${RESEARCH_API_BASE}/jobs/${encodeURIComponent(jobId)}/cancel`, {
    method: 'POST'
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Research cancellation failed (${res.status})`);
  }
  return await res.json();
}

export async function fetchScientificTools() {
  const res = await fetch(`${RESEARCH_API_BASE}/tools`);
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Failed to fetch tools (${res.status})`);
  }
  return await res.json();
}

export async function formulateResearchPlan(objective, smiles = null, targetPdbId = null, useGemini = true) {
  const res = await fetch(`${RESEARCH_API_BASE}/plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      objective,
      smiles,
      target_pdb_id: targetPdbId,
      use_gemini: useGemini
    })
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Planning failed (${res.status})`);
  }
  return await res.json();
}

export async function createResearchJob(objective, smiles = null, targetPdbId = null) {
  const res = await fetch(`${RESEARCH_API_BASE}/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      objective,
      smiles,
      target_pdb_id: targetPdbId
    })
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Job creation failed (${res.status})`);
  }
  return await res.json();
}

export async function startResearchJob(jobId) {
  const res = await fetch(`${RESEARCH_API_BASE}/jobs/${encodeURIComponent(jobId)}/start`, {
    method: 'POST'
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Job execution failed (${res.status})`);
  }
  return await res.json();
}

export async function resumeResearchJob(jobId) {
  const res = await fetch(`${RESEARCH_API_BASE}/jobs/${encodeURIComponent(jobId)}/resume`, {
    method: 'POST'
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Job resume failed (${res.status})`);
  }
  return await res.json();
}

export async function executeDirectTool(toolId, params = {}) {
  const res = await fetch(`${RESEARCH_API_BASE}/tools/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tool_id: toolId,
      params
    })
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Tool execution failed (${res.status})`);
  }
  return await res.json();
}

export async function fetchJobReport(jobId) {
  const res = await fetch(`${RESEARCH_API_BASE}/jobs/${encodeURIComponent(jobId)}/report`);
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Failed to fetch report (${res.status})`);
  }
  return await res.json();
}

export async function searchLiterature(query) {
  const res = await fetch(`${RESEARCH_API_BASE}/literature`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Literature search failed (${res.status})`);
  }
  return await res.json();
}

export async function approveResearchPlan(planId, objective, smiles, targetPdbId) {
  const res = await fetch(`${RESEARCH_API_BASE}/plan/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      plan_id: planId,
      approved: true,
      objective,
      smiles,
      target_pdb_id: targetPdbId
    })
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Plan approval failed (${res.status})`);
  }
  return await res.json();
}

export async function parseStructureFile(content, filename = 'structure.pdb', format = 'pdb') {
  const res = await fetch(`${RESEARCH_API_BASE}/structure/parse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, filename, format })
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Structure parsing failed (${res.status})`);
  }
  return await res.json();
}

export async function fetch2DDepictionSvg(smiles, width = 320, height = 220) {
  const res = await fetch(`${RESEARCH_API_BASE}/molecular/depict-2d`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ smiles, width, height })
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Depiction generation failed (${res.status})`);
  }
  return await res.json();
}

export async function calculateStructureRmsd(coords1, coords2) {
  const res = await fetch(`${RESEARCH_API_BASE}/structure/rmsd`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ coords1, coords2 })
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `RMSD calculation failed (${res.status})`);
  }
  return await res.json();
}

export async function runMolecularDocking({
  smiles,
  ligandContent = null,
  targetPdbId = '6LU7',
  receptorPdbContent = null,
  pocketCenter = null,
  boxSize = null,
  exhaustiveness = 8,
  numPoses = 3
}) {
  const res = await fetch(`${RESEARCH_API_BASE}/docking/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      smiles,
      ligand_content: ligandContent,
      target_pdb_id: targetPdbId,
      receptor_pdb_content: receptorPdbContent,
      pocket_center: pocketCenter,
      box_size: boxSize,
      exhaustiveness,
      num_poses: numPoses
    })
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Docking calculation failed (${res.status})`);
  }
  return await res.json();
}

export async function runAdmetPrediction(smiles) {
  const res = await fetch(`${RESEARCH_API_BASE}/admet/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ smiles })
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `ADMET prediction failed (${res.status})`);
  }
  return await res.json();
}

export async function runBindingAnalysis({
  ligandAtoms,
  ligandCoords,
  proteinCaCoords,
  residueNames = null
}) {
  const res = await fetch(`${RESEARCH_API_BASE}/interactions/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ligand_atoms: ligandAtoms,
      ligand_coords: ligandCoords,
      protein_ca_coords: proteinCaCoords,
      residue_names: residueNames
    })
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Binding interaction analysis failed (${res.status})`);
  }
  return await res.json();
}

export async function runDrugDiscoveryPipeline({
  objective,
  smiles,
  targetPdbId = '6LU7',
  pocketCenter = null,
  boxSize = null,
  exhaustiveness = 8
}) {
  const res = await fetch(`${RESEARCH_API_BASE}/pipeline/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      objective,
      smiles,
      target_pdb_id: targetPdbId,
      pocket_center: pocketCenter,
      box_size: boxSize,
      exhaustiveness
    })
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Drug discovery pipeline failed (${res.status})`);
  }
  return await res.json();
}





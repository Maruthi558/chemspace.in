import { API_BASE_URL, API_URL } from '../config/env';

/**
 * ChemSpace Mobile API Service Layer
 * ALL chemical computations, reaction predictions, and quantum properties
 * are performed exclusively via HTTP calls to the Python backend.
 * ZERO chemical math or heuristics are implemented on client.
 */

const DEFAULT_TIMEOUT = 12000; // 12 seconds

async function request(path, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeout || DEFAULT_TIMEOUT);

  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers || {})
  };

  const url = `${API_URL}${path}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg =
        data.detail ||
        data.message ||
        `Server returned error ${response.status}: ${response.statusText || 'Request failed'}`;
      throw new Error(errorMsg);
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    clearTimeout(timeoutId);

    let friendlyMessage = error.message;

    if (error.name === 'AbortError') {
      friendlyMessage = 'Request timed out. The backend is taking too long to compute.';
    } else if (
      error.message.includes('Network request failed') ||
      error.message.includes('Failed to fetch') ||
      error.message.includes('NetworkError')
    ) {
      friendlyMessage = `Cannot reach ChemSpace backend at ${API_BASE_URL}. Ensure your Python backend is running (python -m uvicorn main:app --port 8000) and your device/emulator has network access.`;
    }

    return {
      success: false,
      error: friendlyMessage,
      originalError: error
    };
  }
}

// ----------------- SYSTEM & TELEMETRY -----------------
export async function checkServerHealth() {
  return request('/health');
}

// ----------------- MOLECULE GRAPH & PROPERTIES -----------------
export async function resolveMolecule(query) {
  if (!query || !query.trim()) {
    return { success: false, error: 'Chemical name or formula is required.' };
  }
  return request(`/molecule/resolve?query=${encodeURIComponent(query.trim())}`);
}

export async function suggestMolecules(q) {
  if (!q || !q.trim()) {
    return { success: true, data: { suggestions: [] } };
  }
  return request(`/molecule/suggest?q=${encodeURIComponent(q.trim())}`);
}

export async function calculateMoleculeProperties(smiles) {
  if (!smiles || !smiles.trim()) {
    return { success: false, error: 'SMILES string is required.' };
  }
  return request('/molecule/properties', {
    method: 'POST',
    body: JSON.stringify({ smiles: smiles.trim(), generate_3d: true })
  });
}

export async function parseMolecule(smiles) {
  if (!smiles || !smiles.trim()) {
    return { success: false, error: 'SMILES string is required.' };
  }
  return request('/molecule/parse', {
    method: 'POST',
    body: JSON.stringify({ smiles: smiles.trim(), generate_3d: true })
  });
}

// ----------------- CHEMICAL REACTIONS & SYNTHESIS -----------------
export async function predictReaction({ reactants_smiles, reagents, temperature, solvent }) {
  if (!reactants_smiles || !reactants_smiles.trim()) {
    return { success: false, error: 'Reactants SMILES cannot be empty.' };
  }
  return request('/reaction/predict', {
    method: 'POST',
    body: JSON.stringify({
      reactants_smiles: reactants_smiles.trim(),
      reagents: reagents ? reagents.trim() : null,
      temperature: temperature || '25°C',
      solvent: solvent || 'DCM'
    })
  });
}

export async function predictRetrosynthesis({ target_smiles, max_steps = 3 }) {
  if (!target_smiles || !target_smiles.trim()) {
    return { success: false, error: 'Target SMILES cannot be empty.' };
  }
  return request('/reaction/retrosynthesis', {
    method: 'POST',
    body: JSON.stringify({
      target_smiles: target_smiles.trim(),
      max_steps
    })
  });
}

// ----------------- QUANTUM CHEMISTRY CALCULATIONS -----------------
export async function calculateQuantum({
  smiles,
  geometry_xyz,
  method = 'DFT (B3LYP)',
  basis_set = '6-31G(d)',
  solvent_model = 'Gas Phase'
}) {
  return request('/quantum/calculate', {
    method: 'POST',
    body: JSON.stringify({
      smiles: smiles ? smiles.trim() : null,
      geometry_xyz: geometry_xyz ? geometry_xyz.trim() : null,
      method,
      basis_set,
      solvent_model
    })
  });
}

export async function getQuantumEngines() {
  return request('/quantum/engines');
}

// ----------------- SPECTROSCOPY ANALYTICS -----------------
export async function predictSpectroscopy(smiles, modalities = ['ms', 'ir', 'nmr', 'uv']) {
  if (!smiles || !smiles.trim()) {
    return { success: false, error: 'SMILES string is required.' };
  }
  return request('/spectroscopy/predict', {
    method: 'POST',
    body: JSON.stringify({
      smiles: smiles.trim(),
      modalities
    })
  });
}

// ----------------- PUBCHEM VERIFIED KNOWLEDGE -----------------
export async function queryPubChem(query) {
  if (!query || !query.trim()) {
    return { success: false, error: 'Compound name is required.' };
  }
  return request(`/ai/pubchem?query=${encodeURIComponent(query.trim())}`);
}

// ----------------- USER WORKSPACE HISTORY -----------------
export async function saveWorkspaceItem(item, token = 'dev_mobile_user_token') {
  return request('/workspace/history', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(item)
  });
}

export async function getWorkspaceStats(token = 'dev_mobile_user_token') {
  return request('/workspace/stats', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

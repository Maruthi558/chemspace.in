import React, { useState } from 'react';
import {
  Folder,
  FolderOpen,
  File,
  FileCode,
  FileText,
  Database,
  Layers,
  Cpu,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Box,
  Atom,
  Pill,
  Activity,
  Upload,
  RefreshCw,
  Sliders,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';

/**
 * WorkspaceExplorer
 * Second independently collapsible panel beside the application sidebar.
 * Structured into 5 real scientific sections:
 * 1. Projects & Research Sessions
 * 2. Research Files & Structures
 * 3. Workflow Steps & Real Statuses
 * 4. Registered Chemistry Tools
 * 5. Generated Outputs & Artifacts
 */
export default function WorkspaceExplorer({
  // Sessions
  savedSessions = [],
  activeSessionId = null,
  onSelectSession,
  onDeleteSession,
  onNewSession,

  // Research Files
  targetPdbId = '6LU7',
  activeSmiles = '',
  targetMetadata = null,
  uploadedFiles = [],
  onSelectFile,
  activeSelectedFile = null,
  onUploadFileClick,

  // Workflow Steps
  workflowSteps = [],
  activeStepIndex = 0,
  isExecuting = false,
  onSelectStep,
  selectedStepId = null,

  // Tools
  scientificTools = [],
  onSelectTool,
  selectedToolId = null,

  // Outputs
  dockingResults = null,
  admetProfile = null,
  interactions = [],
  monographReport = null,
  onSelectArtifact,
  selectedArtifactId = null,

  // Layout & Collapse
  isCollapsed = false,
  onToggleCollapse,
  width = 280
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sectionOpen, setSectionOpen] = useState({
    projects: true,
    files: true,
    steps: true,
    tools: true,
    outputs: true
  });

  const toggleSection = (key) => {
    setSectionOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Build real research files list from genuine inputs
  const researchFiles = [
    {
      id: 'target-receptor-pdb',
      name: `${targetPdbId || 'Receptor'}.pdb`,
      type: 'pdb',
      category: 'Macromolecule Target',
      size: targetMetadata?.resolution ? `${targetMetadata.resolution} Å` : 'Crystallographic',
      source: targetMetadata?.organism || 'RCSB Protein Data Bank',
      status: 'verified'
    },
    {
      id: 'ligand-smiles-sdf',
      name: 'ligand_conformer.sdf',
      type: 'sdf',
      category: 'Small Molecule Ligand',
      size: activeSmiles ? `${activeSmiles.length} chars` : '0 KB',
      source: activeSmiles ? 'Validated SMILES Input' : 'Not Loaded',
      status: activeSmiles ? 'ready' : 'empty'
    },
    ...uploadedFiles.map((f, i) => ({
      id: `uploaded-${i}`,
      name: f.name,
      type: f.name.split('.').pop()?.toLowerCase() || 'mol',
      category: 'Uploaded Structure',
      size: `${(f.size / 1024).toFixed(1)} KB`,
      source: 'User Upload',
      status: 'verified',
      rawFile: f
    }))
  ];

  // Build real generated output artifacts
  const outputArtifacts = [];
  if (dockingResults?.poses && dockingResults.poses.length > 0) {
    outputArtifacts.push({
      id: 'docking-pdbqt',
      name: 'docked_poses.pdbqt',
      type: 'pdbqt',
      category: 'Docking Poses',
      detail: `${dockingResults.poses.length} poses (Top: ${dockingResults.top_binding_energy ?? '-'} kcal/mol)`,
      engine: dockingResults.docking_engine || 'AutoDock Vina Forcefield'
    });
    outputArtifacts.push({
      id: 'docking-best-pdb',
      name: 'pose_1_best.pdb',
      type: 'pdb',
      category: 'Top Docked Conformer',
      detail: `ΔG = ${dockingResults.top_binding_energy ?? '-'} kcal/mol, Ki = ${dockingResults.estimated_ki ?? '-'}`,
      engine: 'Cartesian PDB'
    });
  }
  if (interactions && interactions.length > 0) {
    outputArtifacts.push({
      id: 'interactions-csv',
      name: 'binding_contacts.csv',
      type: 'csv',
      category: 'Non-Covalent Contacts',
      detail: `${interactions.length} contacts (H-Bonds, Salt Bridges, Hydrophobic)`,
      engine: 'Spatial Vector Engine'
    });
  }
  if (admetProfile && admetProfile.success) {
    outputArtifacts.push({
      id: 'admet-json',
      name: 'admet_profile.json',
      type: 'json',
      category: 'Consensus Pharmacokinetics',
      detail: `Absorption, Distribution, Metabolism, Toxicity (${admetProfile.model_version || 'v3.2'})`,
      engine: 'Consensus QSAR'
    });
  }
  if (monographReport) {
    outputArtifacts.push({
      id: 'monograph-md',
      name: 'research_monograph.md',
      type: 'md',
      category: 'Structured Scientific Report',
      detail: 'Complete audit trail, parameters, & discussion',
      engine: 'Report Generator'
    });
  }

  // Filter based on search query
  const query = searchQuery.trim().toLowerCase();
  const filteredTools = scientificTools.filter((t) =>
    !query || t.name.toLowerCase().includes(query) || t.category?.toLowerCase().includes(query)
  );

  if (isCollapsed) {
    return (
      <aside
        aria-label="File Explorer Collapsed"
        className="w-12 h-full flex flex-col items-center py-3 bg-[var(--sci-bg-panel)] border-r border-[var(--sci-border)] select-none shrink-0"
      >
        <button
          type="button"
          onClick={onToggleCollapse}
          className="p-2 rounded-lg text-[var(--sci-text-secondary)] hover:text-[var(--sci-text-primary)] hover:bg-[var(--sci-bg-card)] transition-colors"
          title="Expand File & Tool Explorer"
          aria-label="Expand Explorer"
        >
          <PanelLeftOpen className="w-4 h-4 text-[var(--sci-accent)]" />
        </button>

        <div className="flex-1 flex flex-col items-center gap-4 mt-6 text-[var(--sci-text-secondary)]">
          <button
            type="button"
            onClick={onToggleCollapse}
            className="p-1.5 rounded hover:text-[var(--sci-text-primary)] hover:bg-[var(--sci-bg-card)]"
            title="Projects"
          >
            <Folder className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onToggleCollapse}
            className="p-1.5 rounded hover:text-[var(--sci-text-primary)] hover:bg-[var(--sci-bg-card)]"
            title="Research Files"
          >
            <FileCode className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onToggleCollapse}
            className="p-1.5 rounded hover:text-[var(--sci-text-primary)] hover:bg-[var(--sci-bg-card)]"
            title="Workflow Steps"
          >
            <Layers className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onToggleCollapse}
            className="p-1.5 rounded hover:text-[var(--sci-text-primary)] hover:bg-[var(--sci-bg-card)]"
            title="Chemistry Tools"
          >
            <Cpu className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onToggleCollapse}
            className="p-1.5 rounded hover:text-[var(--sci-text-primary)] hover:bg-[var(--sci-bg-card)] relative"
            title="Output Artifacts"
          >
            <Box className="w-4 h-4" />
            {outputArtifacts.length > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full" />
            )}
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside
      aria-label="Research File, Project and Tool Explorer"
      style={{ width: `${width}px` }}
      className="h-full flex flex-col bg-[var(--sci-bg-panel)] border-r border-[var(--sci-border)] text-xs select-none shrink-0 overflow-hidden"
    >
      {/* Explorer Top Header */}
      <header className="px-3 py-2.5 border-b border-[var(--sci-border)] flex items-center justify-between shrink-0 bg-[var(--sci-bg-card)]">
        <div className="flex items-center gap-2">
          <FolderOpen className="w-4 h-4 text-[var(--sci-accent)]" />
          <span className="font-bold text-[var(--sci-text-primary)] tracking-wide uppercase text-[11px] font-mono">
            Explorer
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onNewSession}
            className="p-1 rounded hover:bg-[var(--sci-bg-main)] text-[var(--sci-text-secondary)] hover:text-[var(--sci-text-primary)] transition"
            title="New Research Task"
            aria-label="New Research Task"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
          </button>

          <button
            type="button"
            onClick={onUploadFileClick}
            className="p-1 rounded hover:bg-[var(--sci-bg-main)] text-[var(--sci-text-secondary)] hover:text-[var(--sci-text-primary)] transition"
            title="Upload Structure File"
            aria-label="Upload Structure File"
          >
            <Upload className="w-3.5 h-3.5 text-sky-400" />
          </button>

          <button
            type="button"
            onClick={onToggleCollapse}
            className="p-1 rounded hover:bg-[var(--sci-bg-main)] text-[var(--sci-text-secondary)] hover:text-[var(--sci-text-primary)] transition"
            title="Collapse Explorer"
            aria-label="Collapse Explorer"
          >
            <PanelLeftClose className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Explorer Filter / Search Input */}
      <div className="p-2 border-b border-[var(--sci-border)] shrink-0">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 absolute left-2 text-[var(--sci-text-secondary)] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter files & tools..."
            className="w-full pl-7 pr-2 py-1 text-xs rounded bg-[var(--sci-bg-main)] border border-[var(--sci-border)] text-[var(--sci-text-primary)] placeholder-[var(--sci-text-secondary)] focus:outline-none focus:border-[var(--sci-accent)] font-mono"
          />
        </div>
      </div>

      {/* Explorer Accordion Sections Container */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-1.5 space-y-2">
        {/* 1. PROJECTS & SESSIONS */}
        <section className="rounded border border-[var(--sci-border-subtle)] bg-[var(--sci-bg-card)]/40 overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('projects')}
            className="w-full px-2.5 py-1.5 flex items-center justify-between text-[11px] font-semibold text-[var(--sci-text-primary)] hover:bg-[var(--sci-bg-card)] transition font-mono uppercase tracking-wider"
          >
            <div className="flex items-center gap-1.5">
              {sectionOpen.projects ? <ChevronDown className="w-3 h-3 text-[var(--sci-text-secondary)]" /> : <ChevronRight className="w-3 h-3 text-[var(--sci-text-secondary)]" />}
              <Database className="w-3.5 h-3.5 text-amber-400" />
              <span>Projects ({savedSessions.length})</span>
            </div>
            <span className="text-[10px] text-[var(--sci-text-secondary)] font-normal">Active</span>
          </button>

          {sectionOpen.projects && (
            <div className="p-1 space-y-0.5 border-t border-[var(--sci-border-subtle)]">
              {savedSessions.length === 0 ? (
                <div className="px-3 py-2 text-[11px] text-[var(--sci-text-secondary)] italic">
                  No saved sessions. Run a research task to persist state.
                </div>
              ) : (
                savedSessions.map((session) => {
                  const isActive = activeSessionId === session.id;
                  return (
                    <div
                      key={session.id}
                      onClick={() => onSelectSession && onSelectSession(session)}
                      className={`group flex items-center justify-between px-2 py-1.5 rounded cursor-pointer transition ${
                        isActive
                          ? 'bg-[var(--sci-accent)]/15 text-[var(--sci-text-primary)] border border-[var(--sci-accent)]/30 font-medium'
                          : 'text-[var(--sci-text-secondary)] hover:text-[var(--sci-text-primary)] hover:bg-[var(--sci-bg-card)]'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-cyan-400 animate-pulse' : 'bg-slate-500'}`} />
                        <span className="truncate text-[11px]" title={session.title}>
                          {session.title || 'Untitled Session'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                        {onDeleteSession && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteSession(session.id);
                            }}
                            className="p-1 rounded text-rose-400 hover:bg-rose-500/20"
                            title="Delete Session"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </section>

        {/* 2. RESEARCH FILES */}
        <section className="rounded border border-[var(--sci-border-subtle)] bg-[var(--sci-bg-card)]/40 overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('files')}
            className="w-full px-2.5 py-1.5 flex items-center justify-between text-[11px] font-semibold text-[var(--sci-text-primary)] hover:bg-[var(--sci-bg-card)] transition font-mono uppercase tracking-wider"
          >
            <div className="flex items-center gap-1.5">
              {sectionOpen.files ? <ChevronDown className="w-3 h-3 text-[var(--sci-text-secondary)]" /> : <ChevronRight className="w-3 h-3 text-[var(--sci-text-secondary)]" />}
              <FileCode className="w-3.5 h-3.5 text-cyan-400" />
              <span>Research Files ({researchFiles.length})</span>
            </div>
            <span className="text-[10px] text-[var(--sci-text-secondary)] font-normal">3D/2D</span>
          </button>

          {sectionOpen.files && (
            <div className="p-1 space-y-0.5 border-t border-[var(--sci-border-subtle)] font-mono">
              {researchFiles.map((file) => {
                const isSelected = activeSelectedFile === file.id;
                return (
                  <div
                    key={file.id}
                    onClick={() => onSelectFile && onSelectFile(file)}
                    className={`flex items-center justify-between px-2 py-1.5 rounded cursor-pointer transition ${
                      isSelected
                        ? 'bg-[var(--sci-accent)]/15 text-cyan-300 border border-[var(--sci-accent)]/30'
                        : 'text-[var(--sci-text-secondary)] hover:text-[var(--sci-text-primary)] hover:bg-[var(--sci-bg-card)]'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <File className="w-3.5 h-3.5 text-[var(--sci-accent)] shrink-0" />
                      <div className="truncate">
                        <div className="text-[11px] font-medium text-[var(--sci-text-primary)] truncate">
                          {file.name}
                        </div>
                        <div className="text-[9.5px] text-[var(--sci-text-secondary)] font-sans">
                          {file.category} • {file.size}
                        </div>
                      </div>
                    </div>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-[var(--sci-bg-main)] border border-[var(--sci-border)] text-slate-400 uppercase">
                      {file.type}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* 3. WORKFLOW STEPS */}
        <section className="rounded border border-[var(--sci-border-subtle)] bg-[var(--sci-bg-card)]/40 overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('steps')}
            className="w-full px-2.5 py-1.5 flex items-center justify-between text-[11px] font-semibold text-[var(--sci-text-primary)] hover:bg-[var(--sci-bg-card)] transition font-mono uppercase tracking-wider"
          >
            <div className="flex items-center gap-1.5">
              {sectionOpen.steps ? <ChevronDown className="w-3 h-3 text-[var(--sci-text-secondary)]" /> : <ChevronRight className="w-3 h-3 text-[var(--sci-text-secondary)]" />}
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              <span>Workflow Steps ({workflowSteps.length})</span>
            </div>
            {isExecuting && (
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-bold animate-pulse">
                Running
              </span>
            )}
          </button>

          {sectionOpen.steps && (
            <div className="p-1 space-y-1 border-t border-[var(--sci-border-subtle)]">
              {workflowSteps.length === 0 ? (
                <div className="px-3 py-2 text-[11px] text-[var(--sci-text-secondary)] italic">
                  No active workflow steps.
                </div>
              ) : (
                workflowSteps.map((step, idx) => {
                  const isSelected = selectedStepId === step.id;
                  const isRunning = isExecuting && activeStepIndex === idx;
                  const isCompleted = step.status === 'completed' || (!isExecuting && activeStepIndex > idx);
                  const isFailed = step.status === 'failed';

                  return (
                    <div
                      key={step.id || idx}
                      onClick={() => onSelectStep && onSelectStep(step, idx)}
                      className={`flex items-center justify-between px-2 py-1.5 rounded cursor-pointer transition ${
                        isSelected
                          ? 'bg-[var(--sci-accent)]/15 text-[var(--sci-text-primary)] border border-[var(--sci-accent)]/30'
                          : 'text-[var(--sci-text-secondary)] hover:text-[var(--sci-text-primary)] hover:bg-[var(--sci-bg-card)]'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {isCompleted ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : isRunning ? (
                          <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin shrink-0" />
                        ) : isFailed ? (
                          <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        )}
                        <div className="truncate">
                          <div className="text-[11px] font-medium text-[var(--sci-text-primary)] truncate">
                            {idx + 1}. {step.name}
                          </div>
                          <div className="text-[9.5px] text-[var(--sci-text-secondary)] font-mono truncate">
                            {step.tool || step.tool_id || 'Internal Kernel'}
                          </div>
                        </div>
                      </div>

                      {step.duration && (
                        <span className="text-[9px] font-mono text-[var(--sci-text-secondary)] shrink-0">
                          {step.duration}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </section>

        {/* 4. CHEMISTRY TOOLS */}
        <section className="rounded border border-[var(--sci-border-subtle)] bg-[var(--sci-bg-card)]/40 overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('tools')}
            className="w-full px-2.5 py-1.5 flex items-center justify-between text-[11px] font-semibold text-[var(--sci-text-primary)] hover:bg-[var(--sci-bg-card)] transition font-mono uppercase tracking-wider"
          >
            <div className="flex items-center gap-1.5">
              {sectionOpen.tools ? <ChevronDown className="w-3 h-3 text-[var(--sci-text-secondary)]" /> : <ChevronRight className="w-3 h-3 text-[var(--sci-text-secondary)]" />}
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span>Chemistry Tools ({filteredTools.length})</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono">Verified</span>
          </button>

          {sectionOpen.tools && (
            <div className="p-1 space-y-0.5 border-t border-[var(--sci-border-subtle)]">
              {filteredTools.map((tool) => {
                const isSelected = selectedToolId === tool.id;
                return (
                  <div
                    key={tool.id}
                    onClick={() => onSelectTool && onSelectTool(tool)}
                    className={`flex items-center justify-between px-2 py-1.5 rounded cursor-pointer transition ${
                      isSelected
                        ? 'bg-[var(--sci-accent)]/15 text-[var(--sci-text-primary)] border border-[var(--sci-accent)]/30 font-medium'
                        : 'text-[var(--sci-text-secondary)] hover:text-[var(--sci-text-primary)] hover:bg-[var(--sci-bg-card)]'
                    }`}
                  >
                    <div className="truncate">
                      <div className="text-[11px] font-medium text-[var(--sci-text-primary)] truncate">
                        {tool.name}
                      </div>
                      <div className="text-[9.5px] text-[var(--sci-text-secondary)] font-mono">
                        {tool.provider || tool.category} • v{tool.version || '1.0'}
                      </div>
                    </div>
                    <span className="text-[8.5px] px-1.5 py-0.2 rounded bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-mono shrink-0">
                      {tool.hardware_requirements || 'CPU'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* 5. OUTPUTS & ARTIFACTS */}
        <section className="rounded border border-[var(--sci-border-subtle)] bg-[var(--sci-bg-card)]/40 overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('outputs')}
            className="w-full px-2.5 py-1.5 flex items-center justify-between text-[11px] font-semibold text-[var(--sci-text-primary)] hover:bg-[var(--sci-bg-card)] transition font-mono uppercase tracking-wider"
          >
            <div className="flex items-center gap-1.5">
              {sectionOpen.outputs ? <ChevronDown className="w-3 h-3 text-[var(--sci-text-secondary)]" /> : <ChevronRight className="w-3 h-3 text-[var(--sci-text-secondary)]" />}
              <Box className="w-3.5 h-3.5 text-rose-400" />
              <span>Artifacts ({outputArtifacts.length})</span>
            </div>
            {outputArtifacts.length > 0 && (
              <span className="text-[10px] text-emerald-400 font-bold">Ready</span>
            )}
          </button>

          {sectionOpen.outputs && (
            <div className="p-1 space-y-0.5 border-t border-[var(--sci-border-subtle)] font-mono">
              {outputArtifacts.length === 0 ? (
                <div className="px-3 py-2 text-[11px] text-[var(--sci-text-secondary)] italic">
                  No output artifacts yet. Launch a pipeline or docking job to generate real PDB, PDBQT, and CSV data.
                </div>
              ) : (
                outputArtifacts.map((art) => {
                  const isSelected = selectedArtifactId === art.id;
                  return (
                    <div
                      key={art.id}
                      onClick={() => onSelectArtifact && onSelectArtifact(art)}
                      className={`flex items-center justify-between px-2 py-1.5 rounded cursor-pointer transition ${
                        isSelected
                          ? 'bg-[var(--sci-accent)]/15 text-[var(--sci-text-primary)] border border-[var(--sci-accent)]/30'
                          : 'text-[var(--sci-text-secondary)] hover:text-[var(--sci-text-primary)] hover:bg-[var(--sci-bg-card)]'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <div className="truncate">
                          <div className="text-[11px] font-medium text-[var(--sci-text-primary)] truncate">
                            {art.name}
                          </div>
                          <div className="text-[9.5px] text-[var(--sci-text-secondary)] font-sans truncate">
                            {art.detail}
                          </div>
                        </div>
                      </div>
                      <span className="text-[8.5px] px-1 py-0.2 rounded bg-sky-500/10 border border-sky-500/25 text-sky-400 uppercase shrink-0">
                        {art.type}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </section>
      </div>

      {/* Explorer Bottom Status Indicator */}
      <footer className="px-3 py-2 border-t border-[var(--sci-border)] bg-[var(--sci-bg-card)] shrink-0 flex items-center justify-between text-[10px] font-mono text-[var(--sci-text-secondary)]">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
          <span>Local Kernel: Active</span>
        </span>
        <span>RDKit + Vina Ready</span>
      </footer>
    </aside>
  );
}

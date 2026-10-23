import React, { useState } from 'react';
import {
  Layers,
  Play,
  Upload,
  Download,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  FileText,
  Eye,
  Sliders,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { executeBatchWorkflow } from '../../services/automationService';

const DEFAULT_BATCH_INPUT = `Aspirin
Caffeine
CC(=O)[O-].[Na+]
c1ccccc1
CN(C)C(=N)N=C(N)N.Cl
CC(=O)(=O)=O
Paracetamol`;

export default function BatchProcessingWorkspace({
  onSelectMoleculeForViewer,
  isExecuting = false
}) {
  const [batchText, setBatchText] = useState(DEFAULT_BATCH_INPUT);
  const [selectedTemplate, setSelectedTemplate] = useState('lipinski_screening');
  const [isRunningBatch, setIsRunningBatch] = useState(false);
  const [batchResult, setBatchResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'completed', 'failed'

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        setBatchText(content);
      }
    };
    reader.readAsText(file);
  };

  const handleRunBatch = async () => {
    if (!batchText.trim()) {
      setErrorMessage('Please provide one or more chemical compounds or SMILES.');
      return;
    }

    setIsRunningBatch(true);
    setErrorMessage('');
    try {
      const res = await executeBatchWorkflow(batchText, selectedTemplate);
      setBatchResult(res);
    } catch (err) {
      setErrorMessage(err.message || 'Batch execution failed.');
    } finally {
      setIsRunningBatch(false);
    }
  };

  const handleDownloadJSON = () => {
    if (!batchResult) return;
    const blob = new Blob([JSON.stringify(batchResult, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chemspace_batch_results_${batchResult.batch_id || 'run'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadCSV = () => {
    if (!batchResult?.results) return;
    const headers = ['Index', 'Input', 'Status', 'Formula', 'MolWeight', 'QED', 'LogP', 'Error', 'Preparation'];
    const rows = batchResult.results.map((r, i) => [
      i + 1,
      `"${r.raw_input.replace(/"/g, '""')}"`,
      r.status,
      r.properties?.formula || '',
      r.properties?.molecular_weight || '',
      r.properties?.qed || '',
      r.properties?.logp || '',
      `"${(r.error || '').replace(/"/g, '""')}"`,
      `"${(r.preparation_applied ? r.prepared_formula : '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chemspace_batch_${batchResult.batch_id || 'run'}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredResults = (batchResult?.results || []).filter(item => {
    if (filterStatus === 'completed') return item.status === 'Completed';
    if (filterStatus === 'failed') return item.status === 'Failed';
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Controls & Input Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Input Pane (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold font-mono uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-orange-400" />
              <span>Batch Molecular Library Input</span>
            </label>
            <div className="flex items-center gap-2">
              <label className="text-[11px] font-mono px-2.5 py-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-orange-500/40 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition cursor-pointer flex items-center gap-1.5 shadow-xs">
                <Upload className="w-3 h-3 text-orange-400" />
                <span>Upload (.smi / .sdf / .txt)</span>
                <input
                  type="file"
                  accept=".txt,.smi,.smiles,.sdf,.mol"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <textarea
            value={batchText}
            onChange={(e) => setBatchText(e.target.value)}
            rows={8}
            placeholder="Paste SMILES, chemical names, or multi-record SDF block ($$$$ separated)..."
            className="w-full p-3.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-subtle)] focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 text-xs font-mono text-[var(--text-primary)] leading-relaxed resize-y"
          />

          <p className="text-[11px] text-[var(--text-muted)] font-mono">
            Accepts multi-line SMILES, chemical names (resolved automatically), comma-delimited strings, or multi-record MDL SDF format.
          </p>
        </div>

        {/* Right Configuration & Execution Pane (5 cols) */}
        <div className="lg:col-span-5 p-4 md:p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] space-y-4">
          <div>
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-orange-400" />
              <span>Batch Workflow Strategy</span>
            </h3>
            <p className="text-[11px] text-[var(--text-secondary)] mt-1">
              Select an automated pipeline to run across every compound in the library with complete fault isolation.
            </p>
          </div>

          {/* Workflow Template Selector */}
          <div className="space-y-2 text-xs font-mono">
            {[
              { id: 'lipinski_screening', name: 'Lipinski & Physicochemical Screening', desc: 'Computes exact Hill formula, IUPAC mass, LogP, TPSA, and drug-likeness.' },
              { id: 'conformer_generation', name: '3D VSEPR Conformer Generation', desc: 'Solves 3D Cartesian coordinates with VSEPR steric force field.' },
              { id: 'admet_profiling', name: 'ADMET & Synthetic Accessibility', desc: 'Predicts QED scores, synthetic accessibility (SAS), and RO5 filters.' }
            ].map(tpl => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => setSelectedTemplate(tpl.id)}
                className={`w-full p-2.5 rounded-xl border text-left transition cursor-pointer ${
                  selectedTemplate === tpl.id
                    ? 'bg-orange-500/15 border-orange-500/40 text-orange-400 font-semibold shadow-xs'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-inner)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <div className="text-xs font-bold">{tpl.name}</div>
                <div className="text-[10px] text-[var(--text-muted)] mt-0.5">{tpl.desc}</div>
              </button>
            ))}
          </div>

          {/* Execution Button */}
          <button
            type="button"
            onClick={handleRunBatch}
            disabled={isRunningBatch || !batchText.trim()}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-mono text-xs font-bold hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
          >
            {isRunningBatch ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Processing Batch Library...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Execute Batch Pipeline</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Batch Results Overview Card */}
      {batchResult && (
        <div className="p-4 md:p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3">
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                <span>Batch Execution Summary</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Batch ID: {batchResult.batch_id}
                </span>
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5 font-mono">
                Strategy: {batchResult.template_applied} | Elapsed: {batchResult.elapsed_seconds}s
              </p>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs">
              <button
                type="button"
                onClick={handleDownloadCSV}
                className="px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] hover:bg-[var(--bg-hover)] transition flex items-center gap-1.5 cursor-pointer text-[var(--text-primary)]"
              >
                <Download className="w-3.5 h-3.5 text-orange-400" />
                <span>Export CSV</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadJSON}
                className="px-3 py-1.5 rounded-lg bg-orange-500 text-slate-950 font-bold hover:bg-orange-400 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>
            </div>
          </div>

          {/* Metrics Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono">
            <div className="p-3 rounded-xl bg-[var(--bg-inner)] border border-[var(--border-subtle)]">
              <span className="text-[10px] text-[var(--text-muted)] block">TOTAL SUBMITTED</span>
              <span className="text-base font-bold text-[var(--text-primary)]">{batchResult.total_compounds}</span>
            </div>
            <div className="p-3 rounded-xl bg-[var(--bg-inner)] border border-emerald-500/30">
              <span className="text-[10px] text-emerald-400 block">COMPLETED</span>
              <span className="text-base font-bold text-emerald-400">{batchResult.completed}</span>
            </div>
            <div className="p-3 rounded-xl bg-[var(--bg-inner)] border border-rose-500/30">
              <span className="text-[10px] text-rose-400 block">FAILED (ISOLATED)</span>
              <span className="text-base font-bold text-rose-400">{batchResult.failed}</span>
            </div>
            <div className="p-3 rounded-xl bg-[var(--bg-inner)] border border-sky-500/30">
              <span className="text-[10px] text-sky-400 block">SUCCESS RATE</span>
              <span className="text-base font-bold text-sky-300">
                {batchResult.total_compounds > 0
                  ? Math.round((batchResult.completed / batchResult.total_compounds) * 100)
                  : 0}%
              </span>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-2 pt-1 font-mono text-xs">
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Filter:</span>
            {['all', 'completed', 'failed'].map(f => (
              <button
                key={f}
                type="button"
                onClick={() => setFilterStatus(f)}
                className={`px-2.5 py-1 rounded-lg capitalize transition cursor-pointer ${
                  filterStatus === f
                    ? 'bg-orange-500/20 text-orange-400 font-bold border border-orange-500/40'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Results Table */}
          <div className="overflow-x-auto rounded-xl border border-[var(--border-subtle)]">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-[var(--bg-inner)] text-[var(--text-muted)] text-[10px] uppercase tracking-wider border-b border-[var(--border-subtle)]">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Input Structure</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Formula / MW</th>
                  <th className="p-3">Smart Preparation</th>
                  <th className="p-3">Key Descriptors</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)] text-[11px]">
                {filteredResults.map((item, idx) => {
                  const isDone = item.status === 'Completed';
                  const isFail = item.status === 'Failed';

                  return (
                    <tr
                      key={item.compound_index || idx}
                      className="hover:bg-[var(--bg-inner)]/50 transition"
                    >
                      <td className="p-3 text-[var(--text-muted)] font-bold">
                        {item.compound_index}
                      </td>
                      <td className="p-3 font-semibold text-[var(--text-primary)] max-w-[200px] truncate" title={item.raw_input}>
                        {item.raw_input}
                      </td>
                      <td className="p-3">
                        {isDone ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3" /> Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 text-[10px] font-bold">
                            <XCircle className="w-3 h-3" /> Failed
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        {item.properties ? (
                          <div>
                            <span className="font-bold text-[var(--text-primary)]">{item.properties.formula}</span>
                            <span className="text-[10px] text-[var(--text-muted)] block">{item.properties.molecular_weight} Da</span>
                          </div>
                        ) : (
                          <span className="text-[var(--text-muted)]">—</span>
                        )}
                      </td>
                      <td className="p-3">
                        {item.preparation_applied ? (
                          <span className="text-sky-400 text-[10px] bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/30">
                            Desalted Parent ({item.prepared_formula})
                          </span>
                        ) : isDone ? (
                          <span className="text-[var(--text-muted)] text-[10px]">Unmodified Parent</span>
                        ) : (
                          <span className="text-rose-400 text-[10px]">{item.error || 'Syntax / Graph Error'}</span>
                        )}
                      </td>
                      <td className="p-3">
                        {item.properties ? (
                          <div className="space-x-2 text-[10px]">
                            <span>QED: <strong className="text-emerald-400">{item.properties.qed}</strong></span>
                            <span>LogP: <strong className="text-[var(--text-secondary)]">{item.properties.logp}</strong></span>
                          </div>
                        ) : (
                          <span className="text-[var(--text-muted)]">—</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        {item.three_d_conformers && onSelectMoleculeForViewer && (
                          <button
                            type="button"
                            onClick={() => onSelectMoleculeForViewer(item)}
                            className="px-2.5 py-1 rounded-lg bg-orange-500/15 text-orange-400 border border-orange-500/30 hover:bg-orange-500/25 transition cursor-pointer text-[10px] font-bold flex items-center gap-1 ml-auto"
                            title="Load structure into 3D Workspace"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View 3D</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

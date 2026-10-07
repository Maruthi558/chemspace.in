import React, { useState } from 'react';
import {
  Layers,
  Box,
  Copy,
  Check,
  Download,
  AlertTriangle,
  RotateCw,
  Eye,
  FileSpreadsheet,
  Maximize2,
  Terminal,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import ThreeMoleculeViewer from '../ThreeMoleculeViewer';

export default function CellOutput({
  output,
  cellIndex,
  executionTime
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [viewMode, setViewMode] = useState('auto'); // 'auto' | '2d' | '3d'
  const [copiedSmiles, setCopiedSmiles] = useState(false);
  const [copiedStdout, setCopiedStdout] = useState(false);
  const [styleMode3D, setStyleMode3D] = useState('ball-stick'); // 'ball-stick' | 'space-fill' | 'wireframe'

  if (!output) return null;

  const {
    status,
    stdout,
    error,
    traceback,
    result_type,
    result_value,
    molecule_data,
    table_data,
    image_data
  } = output;

  const hasMolData = !!molecule_data;
  const is3DDefault = result_type === 'molecule_3d' || (hasMolData && molecule_data.has_3d && !molecule_data.svg);
  const activeView = viewMode === 'auto' ? (is3DDefault ? '3d' : '2d') : viewMode;

  const handleCopySmiles = () => {
    if (molecule_data?.smiles) {
      navigator.clipboard.writeText(molecule_data.smiles);
      setCopiedSmiles(true);
      setTimeout(() => setCopiedSmiles(false), 1800);
    }
  };

  const handleCopyStdout = () => {
    if (stdout) {
      navigator.clipboard.writeText(stdout);
      setCopiedStdout(true);
      setTimeout(() => setCopiedStdout(false), 1800);
    }
  };

  return (
    <div
      className={`relative w-full rounded-b-xl border-t transition-all duration-200 overflow-hidden ${
        isDark
          ? 'bg-[#0a0d16] border-white/10 text-slate-200'
          : 'bg-[#faf8f4] border-stone-200 text-stone-800'
      }`}
    >
      {/* ── Output Header Telemetry Bar ── */}
      <div
        className={`px-4 py-2 border-b flex items-center justify-between text-[11px] font-mono select-none ${
          isDark
            ? 'bg-[#0d101a] border-white/5 text-slate-400'
            : 'bg-[#f3f0e8] border-stone-200 text-stone-600'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <span className="font-bold text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
            Out [{cellIndex || 1}]:
          </span>
          {executionTime && (
            <span className="text-[10.5px] text-slate-400">
              Completed in <strong className="text-slate-300">{executionTime}</strong>
            </span>
          )}
        </div>

        {/* Molecule 2D / 3D Mode Toggle */}
        {hasMolData && (
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/10">
            <button
              onClick={() => setViewMode('2d')}
              className={`px-2.5 py-1 rounded-md text-[10.5px] font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeView === '2d'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>2D KEKULÉ</span>
            </button>
            <button
              onClick={() => setViewMode('3d')}
              className={`px-2.5 py-1 rounded-md text-[10.5px] font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeView === '3d'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Box className="w-3 h-3" />
              <span>3D CONFORMER</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Main Output Content Area ── */}
      <div className="p-4 space-y-4">
        {/* 1. PYTHON ERROR / TRACEBACK BLOCK */}
        {status === 'error' && (
          <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3.5 space-y-2 font-mono text-xs">
            <div className="flex items-center gap-2 text-rose-400 font-bold">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error || 'Python Execution Error'}</span>
            </div>
            {traceback && (
              <pre className="text-[11.5px] leading-relaxed text-rose-300 overflow-x-auto whitespace-pre-wrap p-2.5 rounded-lg bg-black/40 border border-rose-500/20">
                {traceback}
              </pre>
            )}
          </div>
        )}

        {/* 2. STDOUT TERMINAL TEXT BLOCK */}
        {stdout && (
          <div className="relative group/stdout rounded-xl border border-white/10 bg-[#07090e] p-3.5 font-mono text-xs text-slate-200">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5 text-[10px] text-slate-500 font-semibold tracking-wider uppercase">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Terminal className="w-3 h-3" />
                <span>Standard Output (stdout)</span>
              </span>
              <button
                onClick={handleCopyStdout}
                className="px-2 py-0.5 rounded border border-white/10 hover:border-white/20 hover:text-white transition flex items-center gap-1 cursor-pointer"
                title="Copy Terminal Output"
              >
                {copiedStdout ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedStdout ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="m-0 whitespace-pre-wrap font-mono leading-relaxed text-[12px] text-slate-300">
              {stdout}
            </pre>
          </div>
        )}

        {/* 3. SCALAR RETURN DATA */}
        {result_type === 'data' && result_value && (
          <div
            className={`inline-block px-3.5 py-2 rounded-xl border font-mono text-xs font-bold ${
              isDark
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-emerald-50 border-emerald-300 text-emerald-800'
            }`}
          >
            {result_value}
          </div>
        )}

        {/* 4. RDKIT MOLECULE VISUALIZATION (2D & 3D INTERACTIVE) */}
        {hasMolData && (
          <div className="space-y-3">
            {/* Molecular Metadata Strip */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono pb-2.5 border-b border-inherit">
              <div className="flex items-center gap-3">
                {molecule_data.formula && (
                  <span className="font-bold text-orange-400 text-sm px-2 py-0.5 rounded bg-orange-500/10 border border-orange-500/30">
                    {molecule_data.formula}
                  </span>
                )}
                {molecule_data.mw && (
                  <span className="text-[11px] text-slate-400">
                    MW: <strong className="text-white">{molecule_data.mw} g/mol</strong>
                  </span>
                )}
                {molecule_data.exact_mass && (
                  <span className="text-[11px] text-slate-400 hidden sm:inline">
                    Exact Mass: <strong className="text-white">{molecule_data.exact_mass}</strong>
                  </span>
                )}
              </div>

              {molecule_data.smiles && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-slate-400 max-w-[200px] sm:max-w-xs truncate bg-black/30 px-2 py-0.5 rounded border border-white/5">
                    {molecule_data.smiles}
                  </span>
                  <button
                    onClick={handleCopySmiles}
                    className="p-1 rounded-md border border-white/10 hover:border-white/20 hover:text-white transition text-slate-400 cursor-pointer"
                    title="Copy Canonical SMILES"
                  >
                    {copiedSmiles ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </div>

            {/* 2D Vector SVG Rendering Box */}
            {activeView === '2d' && molecule_data.svg && (
              <div
                className={`relative w-full min-h-[260px] sm:min-h-[300px] rounded-xl border flex items-center justify-center p-4 overflow-hidden transition-colors ${
                  isDark
                    ? 'bg-[#0d111a] border-white/10'
                    : 'bg-white border-stone-300 shadow-xs'
                }`}
              >
                {/* Subtle corner crosshairs */}
                <span className="absolute top-2 left-2 text-[10px] font-mono text-slate-600 select-none">✕</span>
                <span className="absolute top-2 right-2 text-[10px] font-mono text-slate-600 select-none">✕</span>
                <span className="absolute bottom-2 left-2 text-[10px] font-mono text-slate-600 select-none">✕</span>
                <span className="absolute bottom-2 right-2 text-[10px] font-mono text-slate-600 select-none">✕</span>

                <div
                  className="w-full max-w-md mx-auto flex items-center justify-center [&_svg]:max-w-full [&_svg]:h-auto [&_svg]:drop-shadow-sm"
                  dangerouslySetInnerHTML={{ __html: molecule_data.svg }}
                />
              </div>
            )}

            {/* 3D Interactive Conformer Viewer */}
            {activeView === '3d' && (
              <div
                className={`relative w-full h-[360px] sm:h-[420px] rounded-xl border overflow-hidden transition-colors ${
                  isDark
                    ? 'bg-[#07090f] border-white/10'
                    : 'bg-[#f4f2eb] border-stone-300'
                }`}
              >
                {/* 3D Style Controls overlay */}
                <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20 text-white text-[11px] font-mono shadow-lg">
                  <span className="text-orange-400 font-bold">3D Style:</span>
                  <select
                    value={styleMode3D}
                    onChange={(e) => setStyleMode3D(e.target.value)}
                    className="bg-transparent text-white border-none outline-none font-bold cursor-pointer"
                  >
                    <option value="ball-stick" className="bg-slate-900 text-white">Ball &amp; Stick</option>
                    <option value="space-fill" className="bg-slate-900 text-white">Space Filling</option>
                    <option value="wireframe" className="bg-slate-900 text-white">Wireframe</option>
                  </select>
                </div>

                <ThreeMoleculeViewer
                  molecule={{
                    atoms: molecule_data.atoms_3d || [],
                    bonds: molecule_data.bonds_3d || []
                  }}
                  styleMode={styleMode3D}
                />
              </div>
            )}
          </div>
        )}

        {/* 5. SCIENTIFIC TABLES & DATAFRAMES */}
        {result_type === 'table' && table_data && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <div className="flex items-center gap-2 font-bold text-slate-300">
                <FileSpreadsheet className="w-4 h-4 text-orange-400" />
                <span>Structured Scientific Data ({table_data.rows?.length || 0} records)</span>
              </div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Lipinski Rule-of-5 Matrix</span>
            </div>

            <div
              className={`rounded-xl border overflow-x-auto ${
                isDark
                  ? 'bg-[#0b0e17] border-white/10'
                  : 'bg-white border-stone-200'
              }`}
            >
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead>
                  <tr className={isDark ? 'bg-white/5 border-b border-white/10' : 'bg-stone-100 border-b border-stone-200'}>
                    {table_data.columns?.map((col) => (
                      <th key={col} className="px-4 py-2.5 font-bold text-slate-300 uppercase tracking-wider text-[10.5px]">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-inherit">
                  {table_data.rows?.map((row, rIdx) => (
                    <tr
                      key={rIdx}
                      className={rIdx % 2 === 0 ? '' : isDark ? 'bg-white/[0.02]' : 'bg-stone-50/50'}
                    >
                      {table_data.columns?.map((col) => {
                        const val = row[col];
                        const isPass = val === 'PASS';
                        const isFail = val === 'FAIL';
                        return (
                          <td key={col} className="px-4 py-2 text-slate-300">
                            {isPass ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                PASS
                              </span>
                            ) : isFail ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                                FAIL
                              </span>
                            ) : typeof val === 'number' ? (
                              Number(val.toFixed(4))
                            ) : (
                              String(val ?? '')
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 6. MATPLOTLIB HIGH-RES GRAPH IMAGE */}
        {result_type === 'image' && image_data && (
          <div
            className={`p-4 rounded-xl border flex items-center justify-center ${
              isDark ? 'bg-[#090d16] border-white/10' : 'bg-white border-stone-200'
            }`}
          >
            <img
              src={image_data}
              alt="Matplotlib generated scientific figure"
              className="max-w-full h-auto rounded-lg drop-shadow-md"
            />
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { ExternalLink, CheckCircle, HelpCircle, BarChart3, Sparkles } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import ChevronsUpDownIcon from '../ui/ChevronsUpDownIcon';

const BENCHMARK_DATA = {
  'ChemBench-2026': {
    'Direct Synthesis': [
      { name: 'ChemSpace Nova', score: 94.8, isPrimary: true },
      { name: 'GPT-4o-Chem', score: 78.4, isPrimary: false },
      { name: 'Claude 3.5 Sonnet', score: 72.1, isPrimary: false },
      { name: 'Llama-3-70B', score: 65.3, isPrimary: false },
      { name: 'Baseline RDKit', score: 54.0, isPrimary: false },
      { name: 'Classical QSAR', score: 41.6, isPrimary: false }
    ],
    'Complex Multi-Step': [
      { name: 'ChemSpace Nova', score: 87.2, isPrimary: true },
      { name: 'GPT-4o-Chem', score: 69.5, isPrimary: false },
      { name: 'Claude 3.5 Sonnet', score: 64.0, isPrimary: false },
      { name: 'Llama-3-70B', score: 56.8, isPrimary: false },
      { name: 'Baseline RDKit', score: 45.2, isPrimary: false },
      { name: 'Classical QSAR', score: 33.1, isPrimary: false }
    ]
  },
  'SealQA Chemistry': {
    'Direct Synthesis': [
      { name: 'ChemSpace Nova', score: 49.5, isPrimary: true },
      { name: 'Exa auto', score: 34.5, isPrimary: false },
      { name: 'Perplexity', score: 29.4, isPrimary: false },
      { name: 'Parallel advanced', score: 26.1, isPrimary: false },
      { name: 'Brave Search', score: 19.7, isPrimary: false },
      { name: 'Generic Search', score: 14.9, isPrimary: false }
    ],
    'Complex Multi-Step': [
      { name: 'ChemSpace Nova', score: 42.8, isPrimary: true },
      { name: 'Exa auto', score: 28.1, isPrimary: false },
      { name: 'Perplexity', score: 23.5, isPrimary: false },
      { name: 'Parallel advanced', score: 21.0, isPrimary: false },
      { name: 'Brave Search', score: 15.2, isPrimary: false },
      { name: 'Generic Search', score: 11.4, isPrimary: false }
    ]
  },
  'DFT Orbital Bandgaps': {
    'Direct Synthesis': [
      { name: 'ChemSpace Nova', score: 91.6, isPrimary: true },
      { name: 'Gaussian DFT', score: 89.2, isPrimary: false },
      { name: 'ORCA SCF', score: 86.4, isPrimary: false },
      { name: 'Hückel MO', score: 62.0, isPrimary: false },
      { name: 'Semi-empirical AM1', score: 54.3, isPrimary: false },
      { name: 'PM3 Baseline', score: 43.5, isPrimary: false }
    ],
    'Complex Multi-Step': [
      { name: 'ChemSpace Nova', score: 84.1, isPrimary: true },
      { name: 'Gaussian DFT', score: 82.5, isPrimary: false },
      { name: 'ORCA SCF', score: 79.1, isPrimary: false },
      { name: 'Hückel MO', score: 53.4, isPrimary: false },
      { name: 'Semi-empirical AM1', score: 46.2, isPrimary: false },
      { name: 'PM3 Baseline', score: 36.8, isPrimary: false }
    ]
  }
};

export default function ResearchBenchmarkSection() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [selectedBenchmark, setSelectedBenchmark] = useState('ChemBench-2026');
  const [activeTab, setActiveTab] = useState('Direct Synthesis');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const currentDataset = BENCHMARK_DATA[selectedBenchmark][activeTab];
  const maxScore = Math.max(...currentDataset.map((d) => d.score), 100);

  return (
    <section className="w-full py-10 select-none font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Top Route Breadcrumb Pill: /benchmarks/chemical-intelligence */}
        <div className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 tracking-wider">
          /benchmarks/molecular-reasoning
        </div>

        {/* Section Headline */}
        <div className="space-y-1.5">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--home-text-primary)]">
            Chemical intelligence driven by research
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 font-sans">
            Rigorous validation against empirical chemical datasets, retrosynthetic planning benchmarks, and quantum ab-initio solutions.
          </p>
        </div>

        {/* Main Content Split: Interactive Benchmark Card (Left) & Methodology (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">
          
          {/* Left Column: Visual Chart Card (Screenshot 4 Architectural Card) */}
          <div
            className={`lg:col-span-7 rounded-2xl border p-6 sm:p-8 transition-all ${
              isDark
                ? 'bg-[#101216]/90 border-neutral-800/90 shadow-xl'
                : 'bg-[#fffdfa] border-neutral-200/90 shadow-sm'
            }`}
          >
            {/* Card Header: Dropdown Selector & Tab Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8">
              
              {/* Benchmark Selector Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={`flex items-center gap-3 px-3.5 py-2 rounded-xl border text-xs font-mono font-medium transition cursor-pointer ${
                    isDark
                      ? 'bg-neutral-900/90 border-neutral-700 text-neutral-200 hover:border-neutral-600'
                      : 'bg-white border-neutral-300 text-neutral-800 hover:border-neutral-400'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                  <span className="font-semibold">{selectedBenchmark}</span>
                  <ChevronsUpDownIcon open={dropdownOpen} duration={0.25} className="w-3.5 h-3.5 text-orange-500 ml-2" />
                </button>

                {dropdownOpen && (
                  <div
                    className={`absolute top-full left-0 mt-1.5 w-60 rounded-xl border py-1.5 shadow-2xl z-30 font-mono text-xs ${
                      isDark ? 'bg-neutral-900 border-neutral-700 text-neutral-200' : 'bg-white border-neutral-200 text-neutral-800'
                    }`}
                  >
                    {Object.keys(BENCHMARK_DATA).map((key) => (
                      <button
                        key={key}
                        onClick={() => {
                          setSelectedBenchmark(key);
                          setDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2 transition flex items-center justify-between ${
                          selectedBenchmark === key
                            ? 'bg-orange-500/10 text-orange-500 font-bold'
                            : 'hover:bg-neutral-800/40 dark:hover:bg-neutral-800'
                        }`}
                      >
                        <span>{key}</span>
                        {selectedBenchmark === key && <span className="text-[10px] text-orange-500">●</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Segmented Pill Tabs */}
              <div
                className={`flex items-center p-1 rounded-xl border ${
                  isDark ? 'bg-neutral-900/80 border-neutral-800' : 'bg-neutral-100 border-neutral-200'
                }`}
              >
                {['Direct Synthesis', 'Complex Multi-Step'].map((tab) => {
                  const isActive = activeTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                        isActive
                          ? 'bg-orange-500 text-white font-bold shadow-sm'
                          : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                      }`}
                    >
                      {tab}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Vertical Bar Chart Container */}
            <div className="relative pt-6 pb-2">
              {/* Horizontal Reference Line */}
              <div className="absolute top-6 left-12 right-0 border-b border-dashed border-neutral-300 dark:border-neutral-800 pointer-events-none" />

              {/* Left Y-Axis Label: Accuracy (%) */}
              <div className="absolute -left-2 sm:left-0 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-mono text-neutral-400 dark:text-neutral-500 tracking-wider">
                Accuracy (%)
              </div>

              {/* Bars Row */}
              <div className="pl-10 pr-2 grid grid-cols-6 items-end gap-2 sm:gap-4 h-64">
                {currentDataset.map((item) => {
                  const heightPercent = Math.min(100, Math.max(15, (item.score / maxScore) * 100));

                  return (
                    <div key={item.name} className="flex flex-col items-center h-full justify-end group">
                      
                      {/* Bar Column with Numeric Value */}
                      <div
                        className={`w-full max-w-[54px] rounded-t-xl transition-all duration-500 flex flex-col justify-start items-center pt-2 relative ${
                          item.isPrimary
                            ? 'bg-orange-500 shadow-lg shadow-orange-500/25 group-hover:bg-orange-600'
                            : isDark
                            ? 'bg-neutral-800/80 group-hover:bg-neutral-700/80'
                            : 'bg-neutral-200/90 group-hover:bg-neutral-300'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      >
                        {/* Score Label inside Bar */}
                        <span
                          className={`text-xs font-mono font-bold ${
                            item.isPrimary
                              ? 'text-white'
                              : isDark
                              ? 'text-neutral-300'
                              : 'text-neutral-700'
                          }`}
                        >
                          {item.score}
                        </span>

                        {/* Top subtle highlight */}
                        {item.isPrimary && (
                          <div className="absolute inset-x-0 top-0 h-1 bg-white/40 rounded-t-xl pointer-events-none" />
                        )}
                      </div>

                      {/* X-Axis Provider Name */}
                      <div className="mt-3 text-center w-full">
                        <span
                          className={`text-[10px] sm:text-[11px] font-medium leading-tight block truncate ${
                            item.isPrimary
                              ? 'font-bold text-orange-500'
                              : 'text-neutral-500 dark:text-neutral-400'
                          }`}
                          title={item.name}
                        >
                          {item.name}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column: About this benchmark & Methodology */}
          <div className="lg:col-span-5 space-y-7 pl-0 lg:pl-4">
            
            {/* About this benchmark Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-base sm:text-lg font-bold text-[var(--home-text-primary)]">
                <span>About this benchmark</span>
                <ExternalLink className="w-4 h-4 text-neutral-400 hover:text-orange-500 transition cursor-pointer" />
              </div>

              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed font-sans">
                This benchmark evaluates molecular reasoning, retrosynthetic route generation, and physicochemical prediction accuracy. It tests how accurately models construct valid SMILES, conserve atom counts, and avoid stereocenter inversions under complex multistep constraints.
              </p>
            </div>

            {/* Methodology Section with Exact Orange Vertical Bars */}
            <div className="space-y-3.5">
              <div className="flex items-center gap-1.5 text-base sm:text-lg font-bold text-[var(--home-text-primary)]">
                <span>Methodology</span>
                <ExternalLink className="w-4 h-4 text-neutral-400 hover:text-orange-500 transition cursor-pointer" />
              </div>

              <div className="space-y-3 text-xs sm:text-[13px] text-neutral-600 dark:text-neutral-400 font-sans leading-relaxed">
                
                {/* Rule 1: Dataset */}
                <div className="pl-3 border-l-2 border-orange-500">
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">Dataset: </span>
                  <span>Full set of ChemBench-2026 (12,500 validated reactions &amp; SMILES targets)</span>
                </div>

                {/* Rule 2: Model */}
                <div className="pl-3 border-l-2 border-orange-500">
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">Model: </span>
                  <span>ChemSpace Nova Engine, grounded by real-time RDKit descriptors &amp; NIST archives</span>
                </div>

                {/* Rule 3: Scoring */}
                <div className="pl-3 border-l-2 border-orange-500">
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">Scoring: </span>
                  <span>Accuracy (correct forward/retrosynthesis pathways ÷ total reaction trials)</span>
                </div>

                {/* Rule 4: Normalization */}
                <div className="pl-3 border-l-2 border-orange-500">
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">Normalization: </span>
                  <span>Standardized stereochemical parity &amp; canonical SMILES representations</span>
                </div>

                {/* Rule 5: Retrieval */}
                <div className="pl-3 border-l-2 border-orange-500">
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">Retrieval: </span>
                  <span>High-throughput indexed chemical building blocks with &lt;120ms latency</span>
                </div>

              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

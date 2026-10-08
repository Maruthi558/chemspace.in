import React, { useState } from 'react';
import {
  Sparkles,
  Star,
  Quote,
  ShieldCheck,
  CheckCircle2,
  Atom,
  Radio,
  Cpu,
  FlaskConical,
  ExternalLink,
  LayoutGrid,
  Repeat
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { GlowCard, GlowCardGrid } from '../ui/GlowCardGrid';

export const REVIEWS_ROW_1 = [
  {
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
    authorName: 'Dr. Elena Rostova',
    authorTagline: 'Lead Spectroscopist · Max Planck Institute',
    quote: 'The automated FTIR and 13C-NMR peak multiplet deconvolution in ChemSpace matches our Bruker 800MHz spectrometer outputs with sub-0.5% RMS error. Exceptional work.',
    domain: 'FTIR & NMR Spectra',
    rating: 5,
    verified: true
  },
  {
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
    authorName: 'Prof. Marcus Vance',
    authorTagline: 'Computational Chemistry Chair · MIT',
    quote: 'ChemSpace brings high-level RDKit descriptors, Lipinski Ro5 compliance, and MMFF94 conformer optimization directly to the browser. It is now standard across our graduate research labs.',
    domain: 'RDKit & Lipinski Ro5',
    rating: 5,
    verified: true
  },
  {
    authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&q=80',
    authorName: 'Dr. Priya Narang',
    authorTagline: 'Senior Director · AstraZeneca AI Discovery',
    quote: 'The quantum HOMO-LUMO bandgap visualization and DFT orbital shaders provide intuitive insight into molecular reactivity before we commit to high-cost wet-lab synthesis.',
    domain: 'Quantum DFT Shaders',
    rating: 5,
    verified: true
  },
  {
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
    authorName: 'Dr. Arthur Sterling',
    authorTagline: 'Principal Scientist · Scripps Research',
    quote: 'Being able to sketch complex polycyclic scaffolds in ChemDraw CAD and immediately execute Python RDKit workflows without server latency is a huge leap forward.',
    domain: 'ChemDraw 2D/3D CAD',
    rating: 5,
    verified: true
  },
  {
    authorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=160&q=80',
    authorName: 'Dr. Sophie Lin',
    authorTagline: 'Molecular Modeler · Stanford Bio-X',
    quote: 'The 3D WebGL crystal lattice engine and real-time SMILES parser make structural bio-chemistry teaching and publication-grade figures completely seamless.',
    domain: 'Crystal Lattice & PDB',
    rating: 5,
    verified: true
  },
  {
    authorAvatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=160&q=80',
    authorName: 'David Chen, PhD',
    authorTagline: 'Staff AI Chemist · Broad Institute',
    quote: 'ChemSpace DeepChem AI molecular reasoning combined with NIST spectroscopy lookup gives us instant verified reference spectra for unknown intermediate verification.',
    domain: 'NIST Spectroscopy',
    rating: 5,
    verified: true
  }
];

export const REVIEWS_ROW_2 = [
  {
    authorAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=160&q=80',
    authorName: 'Dr. Julian Thorne',
    authorTagline: 'Synthesis Lead · Oxford Chemistry',
    quote: 'IBM RXN retrosynthesis integration and reaction yield prediction have shortened our precursor pathway discovery time from days down to seconds.',
    domain: 'IBM RXN Retrosynthesis',
    rating: 5,
    verified: true
  },
  {
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&q=80',
    authorName: 'Claire Beaumont',
    authorTagline: 'Chromatography Specialist · ETH Zürich',
    quote: 'The HPLC retention time and retention factor (Rf) simulator matches reverse-phase column calibrations with phenomenal precision.',
    domain: 'HPLC Chromatography',
    rating: 5,
    verified: true
  },
  {
    authorAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=160&q=80',
    authorName: 'Dr. Hiroshi Tanaka',
    authorTagline: 'Senior Computational Chemist · Tokyo Tech',
    quote: 'Clean architectural CAD layout, dark mode aesthetic, and zero-compromise scientific accuracy. ChemSpace has redefined modern web chemistry tools.',
    domain: 'Scientific UI/UX',
    rating: 5,
    verified: true
  },
  {
    authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
    authorName: 'Guillermo R.',
    authorTagline: 'Venture & Open-Science Contributor',
    quote: 'The CAD blueprint interface and instant RDKit Python WASM execution are completely on another level compared to legacy desktop software.',
    domain: 'Architecture CAD',
    rating: 5,
    verified: true
  },
  {
    authorAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=160&q=80',
    authorName: 'Dr. Kenneth Cole',
    authorTagline: 'Medicinal Chemist · Novartis Discovery',
    quote: 'Our team uses the molecular property calculator and 3D conformer viewer daily for screening lead compound bioavailability.',
    domain: 'Medicinal Chemistry',
    rating: 5,
    verified: true
  },
  {
    authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&q=80',
    authorName: 'Prof. Amara Osei',
    authorTagline: 'Biochemistry Research Fellow · Cambridge',
    quote: 'The spectroscopy analysis tools along with live ChemSpace DeepChem intelligence make this an indispensable workbench for our research cohort.',
    domain: 'AI Chemical Analysis',
    rating: 5,
    verified: true
  }
];

function ReviewCard({ item }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div
      className={`w-[350px] sm:w-[380px] p-5 rounded-2xl border transition-all duration-200 select-none shrink-0 flex flex-col justify-between space-y-4 ${
        isDark
          ? 'bg-[#10131e]/90 border-neutral-800 text-neutral-200 hover:border-orange-500/40 hover:bg-[#131726]'
          : 'bg-white border-neutral-200 text-neutral-800 hover:border-orange-500/40 shadow-xs hover:shadow-md'
      }`}
    >
      {/* Top: Star rating & Research domain badge */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 text-orange-400">
          {[...Array(item.rating)].map((_, i) => (
            <Star key={i} className="w-3.5 h-3.5 fill-current" />
          ))}
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-bold uppercase tracking-wider">
          {item.domain}
        </span>
      </div>

      {/* Center: Quote */}
      <p className="text-xs sm:text-[13px] leading-relaxed font-sans text-neutral-300 dark:text-neutral-300 line-clamp-3">
        "{item.quote}"
      </p>

      {/* Bottom: Author avatar, name, tagline & verified badge */}
      <div className="flex items-center gap-3 pt-2 border-t border-inherit">
        <div className="relative">
          <img
            src={item.authorAvatar}
            alt={item.authorName}
            className="w-10 h-10 rounded-full object-cover border border-orange-500/40 p-0.5 bg-neutral-900"
            loading="lazy"
          />
          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[8px] font-bold border border-neutral-900">
            ✓
          </div>
        </div>
        <div className="truncate">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold font-sans text-neutral-100 dark:text-neutral-100 truncate">
              {item.authorName}
            </span>
          </div>
          <span className="text-[10.5px] font-mono text-neutral-400 dark:text-neutral-400 truncate block">
            {item.authorTagline}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ScientificCommunityReviewsSection() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [viewMode, setViewMode] = useState('glow'); // 'glow' | 'marquee'

  // Double the items for seamless infinite loop
  const list1 = [...REVIEWS_ROW_1, ...REVIEWS_ROW_1];
  const list2 = [...REVIEWS_ROW_2, ...REVIEWS_ROW_2];

  const EMOJI_LIST = ['🧪', '🔬', '⚡', '⚛️', '🧬', '💎'];

  return (
    <section className={`relative w-full py-16 px-4 sm:px-8 border-t border-inherit overflow-hidden ${
      isDark ? 'bg-[#090b10]' : 'bg-[#fafafa]'
    }`}>
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 max-w-5xl">
          <div className="space-y-2 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400 text-xs font-mono font-bold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Peer Endorsements &amp; Spectroscopy Benchmarks</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-neutral-900 dark:text-white">
              Trusted by Chemists &amp; Researchers Worldwide
            </h2>
            <p className="text-xs sm:text-sm font-mono tracking-[0.14em] uppercase text-neutral-500 dark:text-neutral-400">
              FROM ACCREDITED SPECTROSCOPY LABORATORIES, PHARMACEUTICAL R&amp;D &amp; COMPUTATIONAL PIONEERS
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle Button */}
            <div className="flex items-center p-1 rounded-xl border border-neutral-700/50 bg-neutral-900/60 text-xs font-mono">
              <button
                onClick={() => setViewMode('glow')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  viewMode === 'glow' ? 'bg-orange-500 text-white font-bold shadow-xs' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Glow Grid</span>
              </button>
              <button
                onClick={() => setViewMode('marquee')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  viewMode === 'marquee' ? 'bg-orange-500 text-white font-bold shadow-xs' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Repeat className="w-3.5 h-3.5" />
                <span>Marquee</span>
              </button>
            </div>

            <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-neutral-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verified</span>
            </div>
          </div>
        </div>

        {/* View 1: Interactive GlowCardGrid with Dynamic Pointer Tracking */}
        {viewMode === 'glow' ? (
          <GlowCardGrid>
            {REVIEWS_ROW_1.map((item, idx) => (
              <GlowCard
                key={item.authorName}
                name={item.authorName}
                handle={`@${item.authorName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`}
                avatar={item.authorAvatar}
                emoji={EMOJI_LIST[idx % EMOJI_LIST.length]}
                role={item.authorTagline}
                quote={item.quote}
                rating={item.rating}
              />
            ))}
          </GlowCardGrid>
        ) : (
          /* View 2: Dual Continuous Infinite Marquee Ribbons with Edge Fade Masks */
          <div className="relative w-full overflow-hidden space-y-5">
            {/* Left and Right Smooth Gradient Masks */}
            <div
              className="absolute left-0 inset-y-0 w-24 sm:w-36 pointer-events-none z-10"
              style={{
                background: isDark
                  ? 'linear-gradient(to right, #090b10 10%, transparent 100%)'
                  : 'linear-gradient(to right, #fafafa 10%, transparent 100%)'
              }}
            />
            <div
              className="absolute right-0 inset-y-0 w-24 sm:w-36 pointer-events-none z-10"
              style={{
                background: isDark
                  ? 'linear-gradient(to left, #090b10 10%, transparent 100%)'
                  : 'linear-gradient(to left, #fafafa 10%, transparent 100%)'
              }}
            />

            {/* Row 1: Scrolling Left */}
            <div className="overflow-hidden flex">
              <div className="animate-marquee-left flex gap-4">
                {list1.map((item, idx) => (
                  <ReviewCard key={`r1-${idx}`} item={item} />
                ))}
              </div>
            </div>

            {/* Row 2: Scrolling Right */}
            <div className="overflow-hidden flex">
              <div className="animate-marquee-right flex gap-4">
                {list2.map((item, idx) => (
                  <ReviewCard key={`r2-${idx}`} item={item} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bottom Metric Badges */}
        <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-inherit">
          <div className="p-4 rounded-xl border border-inherit bg-black/5 dark:bg-white/5 space-y-1">
            <div className="text-2xl font-black text-orange-400 font-mono">110M+</div>
            <div className="text-[11px] font-mono text-neutral-400 uppercase">Compounds &amp; Spectra Indexed</div>
          </div>
          <div className="p-4 rounded-xl border border-inherit bg-black/5 dark:bg-white/5 space-y-1">
            <div className="text-2xl font-black text-emerald-400 font-mono">99.4%</div>
            <div className="text-[11px] font-mono text-neutral-400 uppercase">FTIR Multiplet Accuracy</div>
          </div>
          <div className="p-4 rounded-xl border border-inherit bg-black/5 dark:bg-white/5 space-y-1">
            <div className="text-2xl font-black text-blue-400 font-mono">1,400+</div>
            <div className="text-[11px] font-mono text-neutral-400 uppercase">Institutions &amp; Labs Active</div>
          </div>
          <div className="p-4 rounded-xl border border-inherit bg-black/5 dark:bg-white/5 space-y-1">
            <div className="text-2xl font-black text-purple-400 font-mono">&lt; 15ms</div>
            <div className="text-[11px] font-mono text-neutral-400 uppercase">RDKit Conformer Latency</div>
          </div>
        </div>

      </div>
    </section>
  );
}

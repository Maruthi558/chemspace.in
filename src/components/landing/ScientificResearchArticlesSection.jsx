import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Sparkles, Filter, Newspaper } from 'lucide-react';
import { ArticleItem } from '../ui/ArticleItem';
import Button from '../ui/button';

export const SCIENTIFIC_ARTICLES = [
  {
    id: '1',
    title: 'Quantum-Mechanical Prediction of Reaction Transition States via DFT B3LYP/6-31G(d)',
    coverUrl: '/assets/analytical_workbench.jpg',
    createdAt: '2026-09-28',
    category: 'Quantum Chemistry',
    readTime: '6 min read',
    summary: 'Evaluating barrier heights and orbital symmetry conservation across pericyclic rearrangements using density functional solvers in browser WebAssembly.',
    author: 'ChemSpace Quantum Lab',
    link: '/quantum-library'
  },
  {
    id: '2',
    title: 'Automated 800MHz 1H & 13C-NMR Spin Multiplet Deconvolution in Modern Web Architectures',
    coverUrl: '/assets/spectroscopy_lab.jpg',
    createdAt: '2026-08-15',
    category: 'Spectroscopy',
    readTime: '5 min read',
    summary: 'Coupling constant J-coupling resolution, Karplus equation correlation, and empirical shift matrices for polycyclic natural products.',
    author: 'Analytical Spectroscopy Division',
    link: '/spectroscopy'
  },
  {
    id: '3',
    title: 'High-Throughput In Silico Screening of Lipinski Ro5 Drug Likeness for Novel Therapeutics',
    coverUrl: '/assets/lab_hero.jpg',
    createdAt: '2026-07-22',
    category: 'Cheminformatics',
    readTime: '4 min read',
    summary: 'Integrating RDKit topological polar surface area (TPSA), Wildman-Crippen LogP, and rotatable bond filters for rapid lead compound bioavailability ranking.',
    author: 'Computational Drug Discovery',
    link: '/rdkit-lab'
  },
  {
    id: '4',
    title: 'Retrosynthetic Disconnection Strategies for Complex Polycyclic Alkaloids via IBM RXN',
    coverUrl: '/assets/synthesis_lab.jpg',
    createdAt: '2026-06-30',
    category: 'Organic Synthesis',
    readTime: '7 min read',
    summary: 'Algorithmic tree search comparing forward yield estimates against commercial building block availability for multi-step total synthesis.',
    author: 'Synthetic Planning Group',
    link: '/ibm-rxn'
  },
  {
    id: '5',
    title: 'Accelerated MMFF94 Conformer Energy Minimization Using Parallel WebGL Shaders',
    coverUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-05-19',
    category: 'Molecular CAD',
    readTime: '5 min read',
    summary: 'How client-side 3D force field minimization achieves sub-10ms convergence directly inside modern browser viewports.',
    author: 'CAD Architecture Team',
    link: '/chemdraw'
  },
  {
    id: '6',
    title: 'AI-Driven Chemical Space Exploration: Bridging LLM Reasoning with NIST Spectral Databases',
    coverUrl: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-04-12',
    category: 'AI Chemistry',
    readTime: '6 min read',
    summary: 'Pairing generative chemical intelligence with deterministic SMILES validation and NIST reference spectral peak matching.',
    author: 'ChemSpace AI Core',
    link: '/workspace'
  }
];

export default function ScientificResearchArticlesSection() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Quantum Chemistry', 'Spectroscopy', 'Cheminformatics', 'Organic Synthesis', 'Molecular CAD'];

  const filteredArticles = activeCategory === 'All'
    ? SCIENTIFIC_ARTICLES
    : SCIENTIFIC_ARTICLES.filter(a => a.category === activeCategory);

  return (
    <section className="space-y-8">
      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[var(--home-border)] pb-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400 text-xs font-mono font-bold tracking-wider uppercase">
            <Newspaper className="w-3.5 h-3.5" />
            <span>Scientific Publications &amp; Research Blog</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-[var(--home-text-primary)]">
            Latest Chemical Discoveries &amp; Insights
          </h2>
          <p className="text-xs sm:text-sm text-[var(--home-text-secondary)] max-w-2xl font-sans">
            Peer-reviewed articles, algorithmic breakdowns, and experimental methods from the ChemSpace research collective.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all shrink-0 cursor-pointer ${
                activeCategory === cat
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'inner-box hover:border-orange-500/50 text-[var(--home-text-secondary)] hover:text-[var(--home-text-primary)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 3-Column Responsive Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredArticles.map((article) => (
          <div
            key={article.id}
            onClick={() => navigate(article.link)}
            className="cursor-pointer block h-full"
          >
            <ArticleItem
              title={article.title}
              coverUrl={article.coverUrl}
              createdAt={article.createdAt}
              category={article.category}
              readTime={article.readTime}
              summary={article.summary}
              author={article.author}
            />
          </div>
        ))}
      </div>

      {/* View All & Explore CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
        <Button
          onClick={() => navigate('/scientists')}
          variant="secondary"
          size="lg"
          className="w-full sm:w-auto gap-2 text-xs uppercase tracking-wider font-bold"
        >
          <span>Explore 200 Years of Pioneers</span>
          <ArrowRight className="w-4 h-4" />
        </Button>

        <Button
          onClick={() => navigate('/workspace')}
          variant="orange"
          size="lg"
          className="w-full sm:w-auto gap-2 text-xs uppercase tracking-wider font-bold"
        >
          <span>Launch Research Lab</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </section>
  );
}

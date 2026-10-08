import React, { useState } from 'react';
import { GlowCard, GlowCardGrid } from '../ui/GlowCardGrid';
import { Sparkles, Heart, ThumbsUp, CheckCircle, MessageSquarePlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const INITIAL_REVIEWS = [
  {
    name: 'Dr. Elena Rostova',
    handle: '@elena_spectroscopy',
    emoji: '🧪',
    role: 'Lead Spectroscopist · Max Planck',
    quote: 'The real-time FTIR and 13C-NMR multiplet deconvolution matches our 800MHz spectrometer outputs perfectly.',
    rating: 5
  },
  {
    name: 'Prof. Marcus Vance',
    handle: '@vance_mit_chem',
    emoji: '🔬',
    role: 'Computational Chemistry Chair · MIT',
    quote: 'Bringing high-throughput RDKit descriptors, Lipinski Ro5 compliance, and MMFF94 conformers directly to the browser is game-changing.',
    rating: 5
  },
  {
    name: 'Dr. Priya Narang',
    handle: '@priya_astrazeneca',
    emoji: '⚡',
    role: 'Senior Director · AstraZeneca Discovery',
    quote: 'The quantum HOMO-LUMO bandgap calculation and DFT orbital shaders provide remarkable insight into molecular reactivity.',
    rating: 5
  },
  {
    name: 'Dr. Arthur Sterling',
    handle: '@sterling_scripps',
    emoji: '⚛️',
    role: 'Principal Scientist · Scripps Research',
    quote: 'Sketching complex polycyclic scaffolds in ChemDraw CAD and immediately computing descriptors has accelerated our synthesis pipeline.',
    rating: 5
  },
  {
    name: 'Dr. Sophie Lin',
    handle: '@sophie_stanford',
    emoji: '🧬',
    role: 'Molecular Modeler · Stanford Bio-X',
    quote: 'The 3D WebGL crystal lattice engine and instant SMILES parser make structural chemistry research and publications effortless.',
    rating: 5
  },
  {
    name: 'David Chen, PhD',
    handle: '@david_broad_inst',
    emoji: '💎',
    role: 'Staff AI Chemist · Broad Institute',
    quote: 'ChemSpace DeepChem AI molecular reasoning paired with NIST spectral archives gives verified answers in seconds.',
    rating: 5
  }
];

export default function ScientistReviewsGlowSection({ showSubmit = true }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [userRating, setUserRating] = useState(5);
  const [selectedEmoji, setSelectedEmoji] = useState('🧪');
  const [userFeedback, setUserFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const EMOJI_OPTIONS = ['🧪', '🔬', '⚡', '⚛️', '🧬', '💎', '🚀', '🎯', '👨‍🔬', '👩‍🔬'];

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!userFeedback.trim()) return;

    const newReview = {
      name: user?.name || user?.email?.split('@')[0] || 'Authenticated Scientist',
      handle: user?.email ? `@${user.email.split('@')[0]}` : '@verified_chemist',
      emoji: selectedEmoji,
      role: 'Active Researcher · ChemSpace Cloud',
      quote: userFeedback.trim(),
      rating: userRating
    };

    setReviews([newReview, ...reviews]);
    setUserFeedback('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="w-full space-y-6 select-none font-sans">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400 text-xs font-mono font-bold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Scientist Community Reviews &amp; Glowing Feedback</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
            Researcher Endorsements &amp; Live Experience
          </h2>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-muted)]">
          <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
          <span>Interactive Pointer Glow Mesh</span>
        </div>
      </div>

      {/* Interactive Glowing Card Grid */}
      <GlowCardGrid>
        {reviews.slice(0, 6).map((card, idx) => (
          <GlowCard
            key={`${card.handle}-${idx}`}
            name={card.name}
            handle={card.handle}
            emoji={card.emoji}
            role={card.role}
            quote={card.quote}
            rating={card.rating}
          />
        ))}
      </GlowCardGrid>

      {/* Optional Logged-in Customer Feedback Submission Box */}
      {showSubmit && (
        <div className="p-5 sm:p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquarePlus className="w-4 h-4 text-orange-500" />
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                Share Your Chemical Research Experience
              </h3>
            </div>
            {submitted && (
              <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-500 font-bold">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Thank you! Your glowing review has been posted.</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmitReview} className="space-y-3">
            {/* Emoji Selector Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono text-[var(--text-secondary)]">Choose Reaction Emoji:</span>
              <div className="flex items-center gap-1.5">
                {EMOJI_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setSelectedEmoji(emoji)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-base transition cursor-pointer ${
                      selectedEmoji === emoji
                        ? 'bg-orange-500/20 border-2 border-orange-500 scale-110 shadow-sm'
                        : 'bg-[var(--bg-inner)] border border-[var(--border-subtle)] hover:bg-orange-500/10'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Input & Submit */}
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={userFeedback}
                onChange={(e) => setUserFeedback(e.target.value)}
                placeholder="How has ChemSpace supported your spectroscopy, CAD drafting, or DFT modeling today?..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-input)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-orange-500 transition"
              />

              <button
                type="submit"
                disabled={!userFeedback.trim()}
                className="btn-orange px-5 py-2.5 rounded-xl text-xs font-bold font-mono flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>Post Glowing Review</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  Send,
  Mail,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  AlertTriangle,
  History,
  ShieldCheck,
  UserCheck,
  Shuffle
} from 'lucide-react';
import {
  DEFAULT_GATEWAY_EMAIL,
  FEEDBACK_GRADES,
  PROBLEM_PATHWAYS,
  submitScientistFeedback,
  getSavedFeedbackHistory,
  generateFeedbackMailto,
  generateGmailComposeUrl,
  generateRandomGatewayEmail,
  generateRandomScientistEmail
} from '../../services/feedbackService';
import ScientistAvatar, { MaleScientistLogo, FemaleScientistLogo, inferScientistGender } from '../common/ScientistLogo';
import { useAuth } from '../../context/AuthContext';

export default function ScientistFeedbackModal({ isOpen, onClose, initialPathway = 'customer_problem' }) {
  const { user } = useAuth();

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [pathway, setPathway] = useState(initialPathway);
  const [problemTitle, setProblemTitle] = useState('');
  const [description, setDescription] = useState('');
  const [customerName, setCustomerName] = useState(user?.name || user?.username || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [targetEmail, setTargetEmail] = useState(DEFAULT_GATEWAY_EMAIL);
  const [scientistType, setScientistType] = useState(user?.scientistType || inferScientistGender(user?.name || user?.email || ''));
  const [priority, setPriority] = useState('normal');

  const [submitting, setSubmitting] = useState(false);
  const [submittedReceipt, setSubmittedReceipt] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [viewHistory, setViewHistory] = useState(false);
  const [historyItems, setHistoryItems] = useState([]);

  // Auto-detect gender when name or email changes if not explicitly set
  useEffect(() => {
    if (user) {
      if (!customerName) setCustomerName(user.name || user.username || '');
      if (!customerEmail) setCustomerEmail(user.email || '');
      if (user.scientistType) {
        setScientistType(user.scientistType);
      } else {
        setScientistType(inferScientistGender(user.name || user.email || ''));
      }
    }
  }, [user]);

  // Load history when opening history view
  useEffect(() => {
    if (viewHistory) {
      setHistoryItems(getSavedFeedbackHistory());
    }
  }, [viewHistory]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentGrade = FEEDBACK_GRADES[hoverRating || rating] || FEEDBACK_GRADES[5];
  const activeDestination = targetEmail.trim() || DEFAULT_GATEWAY_EMAIL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setErrorMessage('Please provide details or description of the problem/feedback.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      const res = await submitScientistFeedback({
        rating,
        problemTitle: problemTitle.trim() || 'Scientific Platform Feedback',
        description: description.trim(),
        customerEmail: customerEmail.trim(),
        customerName: customerName.trim() || 'Anonymous Scientist',
        scientistType,
        pathway,
        priority,
        targetEmail: activeDestination
      });

      setSubmittedReceipt(res);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to submit feedback. You can use direct email.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setSubmittedReceipt(null);
    setDescription('');
    setProblemTitle('');
    setRating(5);
    setErrorMessage('');
    setViewHistory(false);
  };

  const currentFeedbackData = {
    rating,
    problemTitle,
    description,
    customerEmail,
    customerName,
    scientistType,
    pathway,
    priority,
    targetEmail: activeDestination
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-modal-title"
    >
      <div
        className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-2xl overflow-hidden text-[var(--text-primary)] font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <header className="px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-header)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <ScientistAvatar
              gender={scientistType}
              size="md"
              showBadge={true}
              className="drop-shadow-sm"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 id="feedback-modal-title" className="text-base font-bold tracking-tight">
                  ChemSpace Feedback &amp; Problem Gateway
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-orange-500/15 border border-orange-500/30 text-orange-400">
                  DISPATCH GATEWAY
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] font-mono flex items-center gap-1.5 flex-wrap">
                <span>Forwarding to destination:</span>
                <span className="text-orange-400 font-semibold">{activeDestination}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setViewHistory(!viewHistory)}
              className={`p-2 rounded-xl border border-[var(--border-subtle)] text-xs font-mono transition flex items-center gap-1.5 cursor-pointer ${
                viewHistory ? 'bg-orange-500/20 text-orange-400 border-orange-500/40' : 'hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]'
              }`}
              title="View past dispatched receipts"
            >
              <History className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Receipts</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl border border-[var(--border-subtle)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-center transition cursor-pointer"
              aria-label="Close feedback modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Historical Receipts View */}
          {viewHistory ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-orange-400">
                  Dispatched Feedback Archive
                </h3>
                <span className="text-[11px] font-mono text-[var(--text-muted)]">
                  {historyItems.length} records cached
                </span>
              </div>

              {historyItems.length === 0 ? (
                <div className="p-10 text-center rounded-2xl border border-dashed border-[var(--border-subtle)] space-y-2">
                  <Mail className="w-8 h-8 text-[var(--text-muted)] mx-auto opacity-50" />
                  <p className="text-xs font-mono text-[var(--text-secondary)]">No past feedback receipts on this machine.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {historyItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-inner)] space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[var(--text-primary)]">{item.problem_title}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${FEEDBACK_GRADES[item.rating]?.badge || 'bg-slate-500/20'}`}>
                            {item.grade} ({item.rating}★)
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-[var(--text-muted)]">
                          {new Date(item.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--text-secondary)] whitespace-pre-wrap">
                        {item.description}
                      </p>
                      <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)] text-[10px] font-mono text-[var(--text-muted)] flex-wrap gap-2">
                        <span>From: {item.customer_name} ({item.customer_email || 'No email'})</span>
                        <span className="text-emerald-400 font-bold">✓ Dispatched to {item.dispatchedTo || item.target_email || DEFAULT_GATEWAY_EMAIL}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : submittedReceipt ? (
            /* Success Receipt Screen */
            <div className="text-center py-8 space-y-5">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xl font-bold text-[var(--text-primary)]">
                  Feedback Successfully Dispatched!
                </h3>
                <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto">
                  Your feedback and evaluation grade have been routed to the gateway destination:{' '}
                  <span className="text-orange-400 font-semibold">{submittedReceipt.targetEmail}</span>.
                </p>
              </div>

              {/* Receipt Summary Card */}
              <div className="max-w-md mx-auto p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-inner)] text-left space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
                  <span className="text-[var(--text-muted)]">Receipt Reference:</span>
                  <span className="text-cyan-400 font-bold">{submittedReceipt.feedbackId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">Evaluation Grade:</span>
                  <span className="text-emerald-400 font-bold">{submittedReceipt.grade}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">Destination Gateway:</span>
                  <span className="text-orange-400 font-semibold">{submittedReceipt.targetEmail}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">Scientist Identity:</span>
                  <span className="text-[var(--text-primary)]">
                    {scientistType === 'female' ? '👩‍🔬 Female Scientist Devotion' : '👨‍🔬 Male Scientist'}
                  </span>
                </div>
              </div>

              {/* Instant Gmail & Mail Client Backup Options */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <a
                  href={submittedReceipt.gmailUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-orange-500/40 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 text-xs font-mono font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Open in Gmail (Pre-filled)</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>

                <button
                  type="button"
                  onClick={handleResetForm}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] hover:bg-[var(--bg-hover)] text-xs font-mono transition cursor-pointer"
                >
                  Submit Another Feedback
                </button>
              </div>
            </div>
          ) : (
            /* Active Feedback Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMessage && (
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* GATEWAY DESTINATION CONFIGURATION */}
              <div className="p-3.5 rounded-2xl border border-orange-500/30 bg-orange-500/5 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="text-xs font-mono uppercase font-bold text-orange-400 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-orange-400" />
                    <span>Gateway Destination Email:</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setTargetEmail(generateRandomGatewayEmail())}
                    className="px-2.5 py-1 rounded-lg bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/40 text-[11px] font-mono text-orange-300 transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                    title="Generate a random destination gateway email"
                  >
                    <Shuffle className="w-3 h-3" />
                    <span>🎲 Random Email</span>
                  </button>
                </div>
                <input
                  type="email"
                  value={targetEmail}
                  onChange={(e) => setTargetEmail(e.target.value)}
                  placeholder="Enter any destination email (e.g. sunday-research@chemspace.org)"
                  className="w-full px-3.5 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-input)] text-xs text-[var(--text-primary)] font-mono focus:outline-none focus:border-orange-500"
                />
                <p className="text-[10px] font-mono text-[var(--text-muted)]">
                  Feedback, problem report, and evaluation grade will be transmitted to this given email.
                </p>
              </div>

              {/* 1. Star Rating & Grade Pathway Indicator */}
              <div className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-inner)] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase font-bold text-[var(--text-secondary)]">
                    1. Scientific Rating &amp; Grade Pathway
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${currentGrade.badge}`}>
                    {currentGrade.grade} • {currentGrade.label}
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  {[1, 2, 3, 4, 5].map((starVal) => {
                    const isFilled = (hoverRating || rating) >= starVal;
                    return (
                      <button
                        key={starVal}
                        type="button"
                        onClick={() => setRating(starVal)}
                        onMouseEnter={() => setHoverRating(starVal)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 rounded-lg hover:scale-110 active:scale-95 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                        title={`${starVal} Star - ${FEEDBACK_GRADES[starVal].grade}`}
                      >
                        <Star
                          className={`w-7 h-7 transition-colors ${
                            isFilled
                              ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                              : 'text-[var(--text-muted)] opacity-40 hover:opacity-70'
                          }`}
                        />
                      </button>
                    );
                  })}
                  <span className="text-xs font-mono text-[var(--text-muted)] pl-2">
                    {rating} of 5 Stars
                  </span>
                </div>
              </div>

              {/* 2. Problem Pathway / Category */}
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase font-bold text-[var(--text-secondary)] block">
                  2. Choose Problem / Category Pathway
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {PROBLEM_PATHWAYS.map((p) => {
                    const isSelected = pathway === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPathway(p.id)}
                        className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition cursor-pointer ${
                          isSelected
                            ? 'bg-orange-500/15 border-orange-500 text-[var(--text-primary)] font-semibold shadow-xs'
                            : 'bg-[var(--bg-inner)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                        }`}
                      >
                        <span className="text-base">{p.icon}</span>
                        <span className="truncate">{p.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Scientist Identity Selection (Male Scientist vs Female Scientist Logo) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono uppercase font-bold text-[var(--text-secondary)] block">
                    3. Scientist Identity &amp; Logo Badge
                  </label>
                  <span className="text-[10px] font-mono text-[var(--text-muted)]">
                    Select your official persona
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Male Scientist Persona Option */}
                  <button
                    type="button"
                    onClick={() => setScientistType('male')}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition cursor-pointer ${
                      scientistType === 'male'
                        ? 'bg-cyan-500/15 border-cyan-400 text-cyan-200 ring-1 ring-cyan-400/40'
                        : 'bg-[var(--bg-inner)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                    }`}
                  >
                    <MaleScientistLogo size={38} />
                    <div className="min-w-0">
                      <div className="text-xs font-bold font-mono text-[var(--text-primary)] flex items-center gap-1.5">
                        <span>Male Scientist</span>
                        {scientistType === 'male' && <span className="text-cyan-400 font-bold">✓ Active</span>}
                      </div>
                      <p className="text-[10px] text-[var(--text-muted)] truncate">
                        ChemSpace Fellow • Blue &amp; Cobalt Emblem
                      </p>
                    </div>
                  </button>

                  {/* Female Scientist Persona Option */}
                  <button
                    type="button"
                    onClick={() => setScientistType('female')}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition cursor-pointer ${
                      scientistType === 'female'
                        ? 'bg-emerald-500/15 border-emerald-400 text-emerald-200 ring-1 ring-emerald-400/40'
                        : 'bg-[var(--bg-inner)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                    }`}
                  >
                    <FemaleScientistLogo size={38} />
                    <div className="min-w-0">
                      <div className="text-xs font-bold font-mono text-[var(--text-primary)] flex items-center gap-1.5">
                        <span>Female Scientist Devotion</span>
                        {scientistType === 'female' && <span className="text-emerald-400 font-bold">✓ Active</span>}
                      </div>
                      <p className="text-[10px] text-[var(--text-muted)] truncate">
                        Curie &amp; Franklin Tribute • Emerald &amp; Violet Emblem
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* 4. Customer Problem Headline & Description */}
              <div className="space-y-3">
                <label className="text-xs font-mono uppercase font-bold text-[var(--text-secondary)] block">
                  4. Problem Headline &amp; Scientific Description
                </label>

                <input
                  type="text"
                  value={problemTitle}
                  onChange={(e) => setProblemTitle(e.target.value)}
                  placeholder="Summary / Headline of problem (e.g. Molecular viewer rendering issue on PROTAC)"
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-input)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-orange-500 transition"
                />

                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe whatever customer problems, calculation discrepancies, or recommendations you have encountered..."
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-input)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-orange-500 transition leading-relaxed resize-y min-h-[90px]"
                />
              </div>

              {/* 5. Contact Details for Reply & Random Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[11px] font-mono font-bold text-[var(--text-muted)] block mb-1">
                    Your Name / Scientist Title
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Dr. Alex / Chemist"
                    className="w-full px-3.5 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-input)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-mono font-bold text-[var(--text-muted)]">
                      Your Email (for reply)
                    </label>
                    <button
                      type="button"
                      onClick={() => setCustomerEmail(generateRandomScientistEmail())}
                      className="text-[10px] font-mono text-orange-400 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Shuffle className="w-2.5 h-2.5" />
                      <span>🎲 Random Email</span>
                    </button>
                  </div>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="scientist@organization.org"
                    className="w-full px-3.5 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-input)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Submission Footer */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[var(--border-subtle)]">
                <div className="text-[10px] font-mono text-[var(--text-muted)] flex items-center gap-1.5 truncate">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">Encrypted Transmission to {activeDestination}</span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {/* Direct Native Mail Link */}
                  <a
                    href={generateFeedbackMailto(currentFeedbackData)}
                    className="px-3.5 py-2.5 rounded-xl border border-[var(--border-subtle)] hover:bg-[var(--bg-hover)] text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition flex items-center gap-1.5 cursor-pointer"
                    title="Send via default email client"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Mail Client</span>
                  </a>

                  {/* Primary Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting || !description.trim()}
                    className="flex-1 sm:flex-none btn-orange px-5 py-2.5 rounded-xl text-xs font-bold font-mono flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md active:scale-95 transition"
                  >
                    {submitting ? (
                      <span>Dispatching...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Send to Gateway</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

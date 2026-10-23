import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AlertCircle, Mail, Lock, User, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/auth/AuthLayout';
import SocialAuthButtons from '../components/auth/SocialAuthButtons';
import { MaleScientistLogo, FemaleScientistLogo, inferScientistGender } from '../components/common/ScientistLogo';
import { saveScientistProfile } from '../services/firebase';

/**
 * Auth Page — ChemSpace Scientific Authentication & Scientist Onboarding
 * Supports:
 * 1. Email Sign-In with dedicated Male Scientist & Female Scientist logo personas
 * 2. Automatic gender/persona detection from scientist names & emails
 * 3. OAuth providers: Google, Microsoft, Apple
 */
export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    isAuthenticated,
    signInWithGoogle,
    signInWithMicrosoft,
    signInWithApple
  } = useAuth();

  // Redirect destination
  const fromDestination = location.state?.from?.pathname || '/dashboard';

  // If already authenticated with an active session, redirect immediately
  useEffect(() => {
    if (isAuthenticated) {
      navigate(fromDestination, { replace: true });
    }
  }, [isAuthenticated, navigate, fromDestination]);

  // Form State
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [scientistType, setScientistType] = useState('male');
  const [userManuallySelectedGender, setUserManuallySelectedGender] = useState(false);
  const [authMode, setAuthMode] = useState('email'); // 'email' | 'social'

  // Loading & Error States
  const [loadingProvider, setLoadingProvider] = useState(null);
  const [submittingEmail, setSubmittingEmail] = useState(false);
  const [error, setError] = useState('');

  // Auto-detect Scientist Logo persona as user types email or name
  useEffect(() => {
    if (!userManuallySelectedGender && (email || name)) {
      const detected = inferScientistGender(`${name} ${email}`);
      setScientistType(detected);
    }
  }, [email, name, userManuallySelectedGender]);

  /**
   * Handle Email Login / Direct Scientist Workstation Access
   */
  async function handleEmailSignIn(e) {
    e.preventDefault();
    setError('');

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid research email address (e.g. scientist@chemspace.org).');
      return;
    }

    setSubmittingEmail(true);

    try {
      const scientistName = name.trim() || email.split('@')[0];
      const assignedScientistType = scientistType || inferScientistGender(`${scientistName} ${email}`);

      // Create and persist scientist profile with chosen logo persona
      const profileData = {
        name: scientistName,
        email: email.trim(),
        title: assignedScientistType === 'female' ? 'Lead Biochemist & Modeling Director' : 'Principal Research Chemist',
        workplace: 'ChemSpace Advanced Institute of Chemical Sciences',
        scientistType: assignedScientistType,
        verified: true
      };

      saveScientistProfile(profileData);

      // Trigger cross-component auth update
      window.dispatchEvent(new Event('chemspace-auth-changed'));

      // Redirect to research dashboard
      navigate(fromDestination, { replace: true });
    } catch (err) {
      setError(err.message || 'Could not complete sign in. Please try again.');
    } finally {
      setSubmittingEmail(false);
    }
  }

  /**
   * Unified real-time OAuth provider sign-in handler.
   */
  async function handleProviderSignIn(providerName, authFn) {
    setError('');
    setLoadingProvider(providerName);

    try {
      const res = await authFn({
        workplace: 'ChemSpace Research Institute',
        role: scientistType === 'female' ? 'Lead Biochemist' : 'Lead Research Chemist',
        scientistType
      });

      if (res) {
        navigate(fromDestination, { replace: true });
      }
    } catch (err) {
      console.warn(`[ChemSpace Auth] ${providerName} notice:`, err.code || err.message);

      if (
        err.code === 'auth/popup-closed-by-user' ||
        err.code === 'auth/cancelled-popup-request' ||
        err.message?.includes('closed-by-user')
      ) {
        setError('');
      } else if (
        err.message &&
        (err.message.includes('not yet enabled') ||
          err.message.includes('configuration not found') ||
          err.code === 'auth/operation-not-allowed')
      ) {
        const titleCaseProvider = providerName.charAt(0).toUpperCase() + providerName.slice(1);
        setError(`${titleCaseProvider} sign-in is currently undergoing verification for this workspace.`);
      } else {
        setError(err.message || `Sign in with ${providerName} could not be completed.`);
      }
    } finally {
      setLoadingProvider(null);
    }
  }

  return (
    <AuthLayout
      title="Welcome to ChemSpace"
      subtitle="Sign in to access your molecular computing &amp; AI workstation"
    >
      {/* Contextual Error Message Banner */}
      {error && (
        <div
          className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2.5 animate-in fade-in duration-150"
          role="alert"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="leading-relaxed font-medium">{error}</p>
        </div>
      )}

      {/* Auth Mode Toggle Pills */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-inner)] text-xs font-mono mb-4">
        <button
          type="button"
          onClick={() => setAuthMode('email')}
          className={`flex-1 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
            authMode === 'email'
              ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Email &amp; Identity</span>
        </button>

        <button
          type="button"
          onClick={() => setAuthMode('social')}
          className={`flex-1 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
            authMode === 'social'
              ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>OAuth Single-Sign-On</span>
        </button>
      </div>

      {authMode === 'email' ? (
        /* Email Sign-In & Scientist Identity Selection */
        <form onSubmit={handleEmailSignIn} className="space-y-4">
          {/* Scientist Persona & Logo Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                Select Scientist Identity &amp; Logo
              </label>
              <span className="text-[10px] font-mono text-[var(--text-muted)]">
                {userManuallySelectedGender ? 'Manual Choice' : 'Auto-detected'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Male Scientist Persona */}
              <button
                type="button"
                onClick={() => {
                  setScientistType('male');
                  setUserManuallySelectedGender(true);
                }}
                className={`p-3 rounded-2xl border text-left flex flex-col items-center justify-center gap-2 transition cursor-pointer ${
                  scientistType === 'male'
                    ? 'bg-cyan-500/15 border-cyan-400 text-cyan-200 ring-2 ring-cyan-400/30 shadow-md'
                    : 'bg-[var(--bg-inner)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)]'
                }`}
              >
                <MaleScientistLogo size={42} />
                <div className="text-center">
                  <div className="text-xs font-bold font-mono text-[var(--text-primary)]">
                    Male Scientist
                  </div>
                  <div className="text-[9px] text-[var(--text-muted)] font-mono">
                    Cobalt / Cyan Emblem
                  </div>
                </div>
              </button>

              {/* Female Scientist Persona */}
              <button
                type="button"
                onClick={() => {
                  setScientistType('female');
                  setUserManuallySelectedGender(true);
                }}
                className={`p-3 rounded-2xl border text-left flex flex-col items-center justify-center gap-2 transition cursor-pointer ${
                  scientistType === 'female'
                    ? 'bg-emerald-500/15 border-emerald-400 text-emerald-200 ring-2 ring-emerald-400/30 shadow-md'
                    : 'bg-[var(--bg-inner)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)]'
                }`}
              >
                <FemaleScientistLogo size={42} />
                <div className="text-center">
                  <div className="text-xs font-bold font-mono text-[var(--text-primary)]">
                    Female Scientist
                  </div>
                  <div className="text-[9px] text-[var(--text-muted)] font-mono">
                    Curie &amp; Franklin Devotion
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Email Input */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono font-bold text-[var(--text-secondary)] block">
              Workstation Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="scientist@chemspace.org"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-input)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-orange-500 transition font-mono"
              />
            </div>
          </div>

          {/* Scientist Name Input */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono font-bold text-[var(--text-secondary)] block">
              Scientist Name (Optional)
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr. Alex / Dr. Elena"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-input)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-orange-500 transition font-mono"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submittingEmail}
            className="w-full btn-orange h-11 rounded-2xl text-xs font-bold font-mono flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-orange-500/20 active:scale-[0.985] transition"
          >
            {submittingEmail ? (
              <span>Authenticating Workstation...</span>
            ) : (
              <>
                <span>Sign In as {scientistType === 'female' ? 'Female Scientist' : 'Male Scientist'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Quick Pre-fill helper for demo scientist */}
          <div className="pt-1 text-center">
            <button
              type="button"
              onClick={() => {
                setEmail('alex.scientist@chemspace.org');
                setName('Dr. Alex Scientist');
                setScientistType('male');
              }}
              className="text-[10px] font-mono text-[var(--text-muted)] hover:text-orange-400 transition cursor-pointer underline decoration-dotted"
            >
              Quick Demo Login as alex.scientist@chemspace.org
            </button>
          </div>
        </form>
      ) : (
        /* The 3 OAuth Authentication Methods */
        <div className="space-y-4">
          <SocialAuthButtons
            onGoogleSignIn={() => handleProviderSignIn('google', signInWithGoogle)}
            onMicrosoftSignIn={() => handleProviderSignIn('microsoft', signInWithMicrosoft)}
            onAppleSignIn={() => handleProviderSignIn('apple', signInWithApple)}
            loadingProvider={loadingProvider}
          />
        </div>
      )}
    </AuthLayout>
  );
}

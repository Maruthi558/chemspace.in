import React, { useState, useEffect, useRef } from 'react';
import { Search, Atom, Check, AlertCircle, Loader2, X, ChevronRight, Sparkles } from 'lucide-react';
import { resolveMolecule, getMoleculeSuggestions } from '../../services/moleculeResolver';

/**
 * Universal Molecule Name + SMILES Input Component
 * Automatically resolves both chemical names and SMILES into canonical structures.
 */
export default function MoleculeSearchInput({
  initialValue = '',
  onResolve,
  placeholder = 'Enter molecule name or SMILES (e.g. Ethanol or CCO)...',
  label = 'Molecule Name or SMILES',
  buttonText = 'Analyze Molecule',
  autoResolveOnMount = false,
  className = '',
  size = 'md' // 'sm' | 'md' | 'lg'
}) {
  const [query, setQuery] = useState(initialValue);
  const [isResolving, setIsResolving] = useState(false);
  const [resolvedMolecule, setResolvedMolecule] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [ambiguousMatches, setAmbiguousMatches] = useState(null);

  const containerRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Auto-resolve initial value if requested
  useEffect(() => {
    if (autoResolveOnMount && initialValue && initialValue.trim()) {
      handleExecuteResolve(initialValue.trim());
    }
  }, []);

  // Update input if initialValue changes externally
  useEffect(() => {
    if (initialValue && initialValue !== query && !resolvedMolecule) {
      setQuery(initialValue);
    }
  }, [initialValue]);

  // Click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced autocomplete suggestions
  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setErrorMessage(null);
    setAmbiguousMatches(null);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (val.trim().length >= 2) {
      debounceTimerRef.current = setTimeout(async () => {
        try {
          const list = await getMoleculeSuggestions(val.trim());
          setSuggestions(list);
          setShowSuggestions(list.length > 0);
        } catch {
          setSuggestions([]);
        }
      }, 150);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Perform chemical resolution
  const handleExecuteResolve = async (overrideQuery) => {
    const target = (overrideQuery !== undefined ? overrideQuery : query).trim();
    if (!target) {
      setErrorMessage('Please enter a molecule name or SMILES string.');
      return;
    }

    setShowSuggestions(false);
    setIsResolving(true);
    setErrorMessage(null);
    setAmbiguousMatches(null);

    try {
      const result = await resolveMolecule(target);

      if (!result || result.success === false) {
        setErrorMessage(
          result?.error || 'Molecule not found. Please check the name or enter a valid SMILES string.'
        );
        setIsResolving(false);
        return;
      }

      // Check if chemical query has ambiguous isomers
      if (result.ambiguous && Array.isArray(result.matches) && result.matches.length > 0) {
        setAmbiguousMatches(result.matches);
        setIsResolving(false);
        return;
      }

      // Successful resolution
      setResolvedMolecule(result);
      if (onResolve) {
        onResolve(result);
      }
    } catch (err) {
      setErrorMessage('Molecule resolution failed. Please verify the name or SMILES representation.');
    } finally {
      setIsResolving(false);
    }
  };

  // Select an isomer when disambiguation is required
  const handleSelectIsomer = (match) => {
    setQuery(match.name);
    setAmbiguousMatches(null);
    handleExecuteResolve(match.smiles);
  };

  // Select an autocomplete suggestion
  const handleSelectSuggestion = (s) => {
    setQuery(s.name);
    setShowSuggestions(false);
    handleExecuteResolve(s.name);
  };

  const handleClear = () => {
    setQuery('');
    setResolvedMolecule(null);
    setErrorMessage(null);
    setAmbiguousMatches(null);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div ref={containerRef} className={`relative flex flex-col gap-2 w-full ${className}`}>
      {/* Label and subtle hint */}
      {label && (
        <div className="flex items-center justify-between text-xs">
          <label className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
            <Atom className="w-3.5 h-3.5 text-[var(--accent-orange)]" />
            <span>{label}</span>
          </label>
          <span className="text-[10px] text-[var(--text-muted)] font-mono">
            Example: <strong className="text-[var(--text-primary)]">Ethanol</strong> or <strong className="text-[var(--text-primary)]">CCO</strong>
          </span>
        </div>
      )}

      {/* Main Search Bar & Action Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
        <div className="relative flex-1">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none">
            {isResolving ? (
              <Loader2 className="w-4 h-4 animate-spin text-[var(--accent-orange)]" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </div>

          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => {
              if (suggestions.length > 0) setShowSuggestions(true);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleExecuteResolve();
              }
            }}
            placeholder={placeholder}
            className={`w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] focus:border-[var(--accent-orange)] text-[var(--text-primary)] font-mono rounded-2xl pl-10 pr-9 transition-all outline-none shadow-sm ${
              size === 'sm' ? 'py-2 text-xs' : size === 'lg' ? 'py-3.5 text-sm' : 'py-2.5 text-xs'
            }`}
          />

          {query && (
            <button
              onClick={handleClear}
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] p-0.5 rounded-full transition"
              title="Clear input"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => handleExecuteResolve()}
          disabled={isResolving || !query.trim()}
          className="btn-horizontal btn-orange text-xs font-bold shrink-0 shadow-lg px-5 py-2.5 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isResolving ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
              <span>Resolving...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>{buttonText}</span>
            </>
          )}
        </button>
      </div>

      {/* Autocomplete Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-[var(--bg-card)]/95 backdrop-blur-md border border-[var(--border-subtle)] rounded-2xl shadow-2xl overflow-hidden max-h-56 overflow-y-auto">
          <div className="p-2 border-b border-[var(--border-subtle)] flex items-center justify-between text-[10px] text-[var(--text-muted)] font-mono uppercase tracking-wider">
            <span>Matching Compounds</span>
            <span>Click to select</span>
          </div>
          <div className="p-1 space-y-0.5">
            {suggestions.map((s, idx) => (
              <button
                key={`${s.name}-${idx}`}
                type="button"
                onClick={() => handleSelectSuggestion(s)}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-[var(--bg-card-hover)] flex items-center justify-between gap-3 text-xs transition"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-bold text-[var(--text-primary)] truncate">{s.name}</span>
                  {s.formula && (
                    <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      {s.formula}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-[10px] font-mono text-[var(--text-muted)] shrink-0">
                  <span className="truncate max-w-[120px]">{s.smiles}</span>
                  <ChevronRight className="w-3 h-3 opacity-60" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Disambiguation Modal / Selection Interface when multiple isomers exist */}
      {ambiguousMatches && ambiguousMatches.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs flex flex-col gap-2.5 animate-fadeIn">
          <div className="flex items-start gap-2 text-amber-500">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Multiple Matches Found for "{query}"</strong>
              <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                Chemical names can be ambiguous. Please select the intended structural isomer:
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {ambiguousMatches.map((match, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectIsomer(match)}
                className="text-left p-2.5 rounded-xl inner-box hover:border-[var(--accent-orange)] bg-[var(--bg-canvas)]/80 flex flex-col gap-1 transition"
              >
                <span className="font-bold text-[var(--text-primary)] text-xs">{match.name}</span>
                <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)]">
                  <span>{match.formula}</span>
                  <code>{match.smiles}</code>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error Message Alert */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-500 flex items-center gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Resolved Confirmation Strip */}
      {resolvedMolecule && !errorMessage && !ambiguousMatches && (
        <div className="p-2.5 px-3 rounded-xl inner-box border border-emerald-500/20 bg-emerald-500/5 text-[11px] font-mono flex flex-wrap items-center justify-between gap-2 animate-fadeIn">
          <div className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span className="text-[var(--text-muted)]">Resolved:</span>
            <strong className="text-[var(--text-primary)] font-sans">{resolvedMolecule.name}</strong>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[var(--text-muted)]">
              SMILES: <code className="text-emerald-500 font-bold">{resolvedMolecule.smiles}</code>
            </span>
            {resolvedMolecule.formula && (
              <span className="text-[var(--text-muted)] hidden xs:inline">
                Formula: <strong className="text-[var(--text-primary)]">{resolvedMolecule.formula}</strong>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

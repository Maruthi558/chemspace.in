/**
 * ChemSpace Real-Time Work & Memory Persistence Service
 * 
 * Ensures that whenever a user types, configures, drafts, or computes in any tool:
 * 1. Their work is continuously and safely persisted to local storage.
 * 2. Navigating between tools, leaving input boxes, or refreshing the page preserves
 *    their exact progress so they resume right where they left off.
 * 3. User workspaces do not reset back to default initial templates unexpectedly.
 */

import { useState, useEffect, useRef } from 'react';

/**
 * Safely load persisted state with fallback
 */
export function loadPersistedWork(key, fallback) {
  if (typeof window === 'undefined' || !window.localStorage) {
    return fallback;
  }
  try {
    const item = window.localStorage.getItem(key);
    if (item === null || item === undefined) {
      return fallback;
    }
    return JSON.parse(item);
  } catch (err) {
    console.warn(`[WorkPersistence] Notice loading ${key}:`, err);
    return fallback;
  }
}

/**
 * Safely save state to persistent storage
 */
export function savePersistedWork(key, data) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn(`[WorkPersistence] Notice saving ${key}:`, err);
  }
}

/**
 * Remove specific persisted work entry
 */
export function clearPersistedWork(key) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.removeItem(key);
  } catch (err) {
    console.warn(`[WorkPersistence] Notice clearing ${key}:`, err);
  }
}

/**
 * React Hook for automatically persisting component state to local storage
 * 
 * @param {string} key Unique storage key (e.g. 'chemspace_chemdraw_graph')
 * @param {*} initialValue Default value if no saved work exists
 * @returns {[*, Function, Function]} [state, setState, resetWork]
 */
export function usePersistedWork(key, initialValue) {
  const [state, setState] = useState(() => loadPersistedWork(key, initialValue));
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    savePersistedWork(key, state);
  }, [key, state]);

  const resetWork = (overrideValue = initialValue) => {
    clearPersistedWork(key);
    setState(overrideValue);
  };

  return [state, setState, resetWork];
}

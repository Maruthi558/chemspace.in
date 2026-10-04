/**
 * ChemSpace Unified Molecule Resolver Service
 * 
 * Supports both Molecule Name and SMILES inputs everywhere.
 * Resolves inputs into a canonical, normalized molecular representation
 * with server-side caching, RDKit 2D vector diagrams, and client-side fallbacks.
 */

import { request } from './api';
import {
  KNOWN_CHEMICAL_DATABASE,
  resolveChemicalNameToSmiles,
  identifyMoleculeFromSmiles,
  validateSmilesSyntax,
  isSmilesString
} from './chemicalResolver';
import { parseSmilesTo2D, computeHillFormula, computeMolecularWeight } from './chemicalGraph';

// Fast client-side session memory cache
const CLIENT_CACHE = new Map();

/**
 * Resolves any molecule input (Name or SMILES) into a verified, canonical structure
 * 
 * @param {string} query - Raw input (e.g. "Ethanol", "CCO", "Aspirin", "c1ccccc1")
 * @returns {Promise<{
 *   success: boolean,
 *   ambiguous?: boolean,
 *   matches?: Array<{name: string, smiles: string, formula: string, mw: string}>,
 *   smiles?: string,
 *   name?: string,
 *   iupac?: string,
 *   formula?: string,
 *   mw?: number,
 *   svg_2d?: string,
 *   input_type?: 'name' | 'smiles',
 *   source?: string,
 *   error?: string
 * }>}
 */
export async function resolveMolecule(query) {
  if (!query || typeof query !== 'string') {
    return {
      success: false,
      error: 'Please enter a molecule name or SMILES string.'
    };
  }

  const cleanQuery = query.trim();
  if (cleanQuery.length === 0) {
    return {
      success: false,
      error: 'Please enter a molecule name or SMILES string.'
    };
  }

  const cacheKey = cleanQuery.toLowerCase();
  if (CLIENT_CACHE.has(cacheKey)) {
    return CLIENT_CACHE.get(cacheKey);
  }

  // 1. Attempt primary backend resolution via FastAPI
  try {
    const res = await request(`/molecule/resolve?query=${encodeURIComponent(cleanQuery)}`, {
      method: 'GET'
    });

    if (res && res.success !== undefined) {
      if (res.success) {
        CLIENT_CACHE.set(cacheKey, res);
      }
      return res;
    }
  } catch (err) {
    // Backend offline or unreachable, fall through to client-side resolver
    console.warn('[ChemSpace Resolver] Backend query failed, using client engine fallback:', err.message);
  }

  // 2. High-Fidelity Client-side Fallback
  return fallbackClientResolve(cleanQuery, cacheKey);
}

/**
 * Client-side resolution fallback using curated dictionary and graph engine
 */
async function fallbackClientResolve(cleanQuery, cacheKey) {
  const lower = cleanQuery.toLowerCase();

  // Check known ambiguous terms
  const ambiguousMap = {
    xylene: [
      { name: 'o-Xylene (1,2-Dimethylbenzene)', smiles: 'Cc1ccccc1C', formula: 'C8H10', mw: '106.17' },
      { name: 'm-Xylene (1,3-Dimethylbenzene)', smiles: 'Cc1cccc(C)c1', formula: 'C8H10', mw: '106.17' },
      { name: 'p-Xylene (1,4-Dimethylbenzene)', smiles: 'Cc1ccc(C)cc1', formula: 'C8H10', mw: '106.17' }
    ],
    butanol: [
      { name: '1-Butanol (n-Butanol)', smiles: 'CCCCO', formula: 'C4H10O', mw: '74.12' },
      { name: '2-Butanol (sec-Butanol)', smiles: 'CCC(C)O', formula: 'C4H10O', mw: '74.12' },
      { name: 'Isobutanol (2-Methylpropan-1-ol)', smiles: 'CC(C)CO', formula: 'C4H10O', mw: '74.12' },
      { name: 'tert-Butanol (2-Methylpropan-2-ol)', smiles: 'CC(C)(C)O', formula: 'C4H10O', mw: '74.12' }
    ],
    propanol: [
      { name: '1-Propanol (n-Propanol)', smiles: 'CCCO', formula: 'C3H8O', mw: '60.10' },
      { name: '2-Propanol (Isopropanol / IPA)', smiles: 'CC(O)C', formula: 'C3H8O', mw: '60.10' }
    ],
    cresol: [
      { name: 'o-Cresol (2-Methylphenol)', smiles: 'Cc1ccccc1O', formula: 'C7H8O', mw: '108.14' },
      { name: 'm-Cresol (3-Methylphenol)', smiles: 'Cc1cccc(O)c1', formula: 'C7H8O', mw: '108.14' },
      { name: 'p-Cresol (4-Methylphenol)', smiles: 'Cc1ccc(O)cc1', formula: 'C7H8O', mw: '108.14' }
    ]
  };

  if (ambiguousMap[lower]) {
    const ambigRes = {
      success: true,
      ambiguous: true,
      query: cleanQuery,
      message: `Multiple structural isomers found for '${cleanQuery}'. Please select the intended molecule:`,
      matches: ambiguousMap[lower]
    };
    CLIENT_CACHE.set(cacheKey, ambigRes);
    return ambigRes;
  }

  // Check if it's already a valid SMILES
  if (isSmilesString(cleanQuery)) {
    const ident = await identifyMoleculeFromSmiles(cleanQuery);
    if (ident && ident.success) {
      const res = {
        success: true,
        ambiguous: false,
        input_type: 'smiles',
        query: cleanQuery,
        name: ident.name || cleanQuery,
        iupac: ident.iupac || '',
        smiles: cleanQuery,
        formula: ident.formula || '',
        mw: ident.mw || 0,
        source: 'ChemSpace Client Graph'
      };
      CLIENT_CACHE.set(cacheKey, res);
      return res;
    }
  }

  // Attempt chemical name resolution
  const nameRes = await resolveChemicalNameToSmiles(cleanQuery);
  if (nameRes && nameRes.success && nameRes.smiles) {
    const res = {
      success: true,
      ambiguous: false,
      input_type: 'name',
      query: cleanQuery,
      name: nameRes.name || cleanQuery,
      iupac: nameRes.iupac || '',
      smiles: nameRes.smiles,
      formula: nameRes.formula || '',
      mw: nameRes.mw || 0,
      source: nameRes.source || 'ChemSpace Verified Registry'
    };
    CLIENT_CACHE.set(cacheKey, res);
    return res;
  }

  // Determine appropriate scientific error message
  if (validateSmilesSyntax(cleanQuery) === false && /[=#\(\)1-9@]/.test(cleanQuery)) {
    return {
      success: false,
      ambiguous: false,
      query: cleanQuery,
      input_type: 'smiles',
      error: 'Invalid SMILES. Please check the structure or enter the molecule name.'
    };
  }

  return {
    success: false,
    ambiguous: false,
    query: cleanQuery,
    input_type: 'name',
    error: `Molecule not found for '${cleanQuery}'. Please check the name or enter a valid SMILES string.`
  };
}

/**
 * Autocomplete suggestions for chemical names and formulas
 */
export async function getMoleculeSuggestions(query) {
  if (!query || query.trim().length < 1) return [];

  const q = query.trim().toLowerCase();

  // Try backend first
  try {
    const res = await request(`/molecule/suggest?q=${encodeURIComponent(q)}`, {
      method: 'GET'
    });
    if (res && Array.isArray(res.suggestions) && res.suggestions.length > 0) {
      return res.suggestions;
    }
  } catch (err) {
    // Backend offline, fallback to local database
  }

  // Client-side fallback from KNOWN_CHEMICAL_DATABASE
  const suggestions = [];
  const seen = new Set();

  for (const [key, entry] of Object.entries(KNOWN_CHEMICAL_DATABASE)) {
    const name = entry.name;
    const lowerName = name.toLowerCase();

    if (key.startsWith(q) || lowerName.startsWith(q) || entry.smiles?.toLowerCase().startsWith(q)) {
      if (!seen.has(name)) {
        suggestions.push({
          name: entry.name,
          smiles: entry.smiles,
          formula: entry.formula,
          mw: entry.mw
        });
        seen.add(name);
        if (suggestions.length >= 8) break;
      }
    }
  }

  return suggestions;
}

/**
 * ChemSpace DeepChem LLM & Scientific Reasoning Service
 * Integrates high-performance generative chemical intelligence, reaction planning, and molecular analysis.
 */

const DEFAULT_AI_KEY = '';

export const AI_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite',
  'gemini-3.8-flash',
  'gemini-flash-latest'
];

export const CHEMSPACE_SYSTEM_INSTRUCTION = `You are ChemSpace AI (DeepChem LLM), the proprietary, advanced scientific intelligence and molecular computation engine built for the ChemSpace laboratory platform.
Your capabilities include:
1. Explaining organic, inorganic, physical, and biochemistry concepts rigorously and concisely.
2. Generating canonical SMILES strings, IUPAC nomenclature, and molecular formula breakdowns.
3. Interpreting spectroscopy data (FTIR vibrational frequencies, 1H/13C NMR chemical shifts, UV-Vis absorbance).
4. Retrosynthetic reaction planning, reagents, catalysts, and mechanisms (SN1, SN2, EAS, aldol, peptide coupling).
5. Computational chemistry, DFT wavefunctions, HOMO-LUMO bandgaps, and thermodynamic stability calculations.
6. Assisting researchers, students, and computational chemists with accurate problem solving.

Formatting guidelines:
- Present chemical formulas with proper sub/superscripts where applicable or standard notation (e.g., C9H8O4, H2SO4, ΔE = 4.12 eV).
- Use clean GitHub-flavored markdown, bullet points, and code blocks for SMILES, reaction schemes, and Python/RDKit code.
- Be friendly, authoritative, precise, and scientifically reliable. Always identify as ChemSpace AI.`;

export function getGeminiApiKey() {
  const envKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) ||
                 (typeof import.meta !== 'undefined' && import.meta.env?.GEMINI_API_KEY) ||
                 (typeof localStorage !== 'undefined' && (localStorage.getItem('chemspace_ai_key') || localStorage.getItem('chemspace_gemini_key') || localStorage.getItem('gemini_api_key')));
  return envKey || DEFAULT_AI_KEY;
}

/**
 * Stream real-time tokens from ChemSpace DeepChem LLM engine via Server-Sent Events (SSE)
 */
export async function* streamGeminiChat(query, { history = [], systemPrompt = CHEMSPACE_SYSTEM_INSTRUCTION, signal = null } = {}) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('ChemSpace Intelligence Engine is currently running in local offline mode.');
  }

  // Format conversation history
  const contents = [];
  
  if (Array.isArray(history) && history.length > 0) {
    for (const msg of history.slice(-6)) {
      if (!msg.content) continue;
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      });
    }
  }

  contents.push({
    role: 'user',
    parts: [{ text: query }]
  });

  const payload = {
    contents,
    systemInstruction: {
      parts: [{ text: systemPrompt }]
    },
    generationConfig: {
      temperature: 0.35,
      maxOutputTokens: 2048,
      topP: 0.95
    }
  };

  let lastError = null;

  for (const model of AI_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${apiKey}&alt=sse`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`[ChemSpaceAI] Engine candidate ${model} status ${response.status}:`, errorText);
        lastError = new Error(`Engine candidate status ${response.status}`);
        continue;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done || (signal && signal.aborted)) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const clean = line.trim();
          if (clean.startsWith('data:')) {
            const dataStr = clean.slice(5).trim();
            if (!dataStr || dataStr === '[DONE]') continue;
            try {
              const parsed = JSON.parse(dataStr);
              const textChunk = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
              if (textChunk) {
                accumulatedText += textChunk;
                yield {
                  delta: textChunk,
                  text: accumulatedText,
                  model: 'ChemSpace DeepChem-3.8',
                  provider: 'ChemSpace Intelligence (DeepChem LLM)',
                  isDone: false
                };
              }
            } catch (jsonErr) {
              // Ignore partial JSON chunks
            }
          }
        }
      }

      if (accumulatedText) {
        yield {
          delta: '',
          text: accumulatedText,
          model: 'ChemSpace DeepChem-3.8',
          provider: 'ChemSpace Intelligence (DeepChem LLM)',
          isDone: true
        };
        return;
      }
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      lastError = err;
    }
  }

  throw lastError || new Error('ChemSpace Intelligence Engine fallback triggered.');
}

/**
 * Standard single-shot request to ChemSpace DeepChem LLM engine
 */
export async function callGeminiChat(query, { history = [], systemPrompt = CHEMSPACE_SYSTEM_INSTRUCTION, signal = null } = {}) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('ChemSpace Intelligence Engine is running in local offline mode.');
  }

  const contents = [];
  if (Array.isArray(history) && history.length > 0) {
    for (const msg of history.slice(-6)) {
      if (!msg.content) continue;
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      });
    }
  }

  contents.push({
    role: 'user',
    parts: [{ text: query }]
  });

  const payload = {
    contents,
    systemInstruction: {
      parts: [{ text: systemPrompt }]
    },
    generationConfig: {
      temperature: 0.35,
      maxOutputTokens: 2048,
      topP: 0.95
    }
  };

  let lastError = null;

  for (const model of AI_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal
      });

      if (!response.ok) {
        lastError = new Error(`Engine status ${response.status}`);
        continue;
      }

      const data = await response.json();
      const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (answer) {
        return {
          status: 'success',
          responseText: answer,
          response: answer,
          provider: 'ChemSpace Intelligence (DeepChem LLM)',
          model: 'ChemSpace DeepChem-3.8',
          timestamp: new Date().toISOString()
        };
      }
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      lastError = err;
    }
  }

  throw lastError || new Error('ChemSpace Intelligence Engine fallback triggered.');
}

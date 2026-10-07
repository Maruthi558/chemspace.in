/**
 * ChemSpace Google AI Studio / Gemini Integration Service
 * Provides real-time streaming and standard inference using Google AI Studio Gemini models.
 */

const DEFAULT_GEMINI_KEY = '';

export const GEMINI_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite',
  'gemini-3.8-flash',
  'gemini-flash-latest'
];

export const CHEMSPACE_SYSTEM_INSTRUCTION = `You are ChemSpace AI, an advanced, highly knowledgeable chemistry and scientific intelligence assistant.
Your capabilities include:
1. Explaining organic, inorganic, physical, and biochemistry concepts clearly.
2. Generating canonical SMILES, IUPAC nomenclature, and molecular formula breakdowns.
3. Interpreting spectroscopy data (FTIR vibrational frequencies, 1H/13C NMR chemical shifts, UV-Vis absorbance).
4. Retrosynthetic reaction planning, reagents, and mechanisms (SN1, SN2, EAS, aldol condensations).
5. Computational chemistry, DFT, HOMO-LUMO bandgaps, and thermodynamic calculations.
6. Assisting students and researchers with step-by-step problem solving.

Formatting guidelines:
- Present chemical formulas with proper sub/superscripts where applicable or standard scientific notation (e.g., C9H8O4, H2SO4).
- Use clear markdown, bullet points, and code blocks for SMILES, equations, and Python/RDKit code.
- Be friendly, precise, mathematically rigorous, and scientifically reliable.`;

export function getGeminiApiKey() {
  const envKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) ||
                 (typeof import.meta !== 'undefined' && import.meta.env?.GEMINI_API_KEY) ||
                 (typeof localStorage !== 'undefined' && (localStorage.getItem('chemspace_gemini_key') || localStorage.getItem('gemini_api_key')));
  return envKey || DEFAULT_GEMINI_KEY;
}

/**
 * Stream real-time tokens from Google AI Studio Gemini API via Server-Sent Events (SSE)
 */
export async function* streamGeminiChat(query, { history = [], systemPrompt = CHEMSPACE_SYSTEM_INSTRUCTION, signal = null } = {}) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Google AI Studio Gemini API key is not configured.');
  }

  // Format conversation history for Gemini
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
      temperature: 0.4,
      maxOutputTokens: 2048,
      topP: 0.95
    }
  };

  let lastError = null;

  for (const model of GEMINI_MODELS) {
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
        console.warn(`[GeminiService] Model ${model} returned ${response.status}:`, errorText);
        lastError = new Error(`Model ${model} returned ${response.status}`);
        continue; // Try next model candidate
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
                  model,
                  provider: 'Google AI Studio (Gemini)',
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
          model,
          provider: 'Google AI Studio (Gemini)',
          isDone: true
        };
        return; // Successfully finished streaming
      }
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      lastError = err;
      console.warn(`[GeminiService] Error with ${model}:`, err.message);
    }
  }

  throw lastError || new Error('All Google AI Studio Gemini models were unavailable.');
}

/**
 * Standard single-shot request to Google AI Studio Gemini API
 */
export async function callGeminiChat(query, { history = [], systemPrompt = CHEMSPACE_SYSTEM_INSTRUCTION, signal = null } = {}) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Google AI Studio Gemini API key is not configured.');
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
      temperature: 0.4,
      maxOutputTokens: 2048,
      topP: 0.95
    }
  };

  let lastError = null;

  for (const model of GEMINI_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal
      });

      if (!response.ok) {
        lastError = new Error(`Model ${model} returned ${response.status}`);
        continue;
      }

      const data = await response.json();
      const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (answer) {
        return {
          status: 'success',
          responseText: answer,
          response: answer,
          provider: 'Google AI Studio (Gemini)',
          model,
          timestamp: new Date().toISOString()
        };
      }
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      lastError = err;
    }
  }

  throw lastError || new Error('All Google AI Studio Gemini models were unavailable.');
}

/**
 * ChemSpace OpenAI Intelligence Service
 * Integrates OpenAI GPT-4o / GPT-4o-mini for chemical reasoning, reaction planning, 
 * spectroscopy analysis, and scientific intelligence.
 */
import OpenAI from 'openai';

export const OPENAI_MODELS = [
  'gpt-4o-mini',
  'gpt-4o',
  'chatgpt-4o-latest'
];

export const CHEMSPACE_OPENAI_SYSTEM_INSTRUCTION = `You are ChemSpace AI, the premier scientific intelligence and molecular computation engine built for the ChemSpace laboratory platform.
Your capabilities include:
1. Explaining organic, inorganic, physical, and biochemistry concepts rigorously, concisely, and accurately.
2. Generating canonical SMILES strings, IUPAC nomenclature, and molecular formula breakdowns.
3. Interpreting spectroscopy data (FTIR vibrational frequencies, 1H/13C NMR chemical shifts, UV-Vis absorbance).
4. Retrosynthetic reaction planning, reagents, catalysts, and mechanisms (SN1, SN2, EAS, aldol, peptide coupling).
5. Computational chemistry, DFT wavefunctions, HOMO-LUMO bandgaps, and thermodynamic stability calculations.
6. When answering chemistry and science questions, respond with professional scientific rigor strictly in English, preserving standard chemical notation, SMILES, and formulas.

Formatting guidelines:
- Present chemical formulas with standard notation (e.g., C9H8O4, H2SO4, ΔE = 4.12 eV).
- Use clean GitHub-flavored markdown, bullet points, and code blocks for SMILES, reaction schemes, and Python/RDKit code.
- Be friendly, authoritative, precise, and scientifically reliable. Always identify as ChemSpace AI powered by OpenAI.`;

export function getOpenAIApiKey() {
  const custom = typeof localStorage !== 'undefined'
    ? (localStorage.getItem('chemspace_openai_key') || localStorage.getItem('openai_api_key'))
    : null;
  if (custom && custom.trim()) return custom.trim();

  const envKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_OPENAI_API_KEY) ||
                 (typeof import.meta !== 'undefined' && import.meta.env?.OPENAI_API_KEY);
  return (envKey && envKey.trim()) || '';
}

export function setCustomOpenAIApiKey(key) {
  if (typeof localStorage === 'undefined') return;
  if (key && key.trim()) {
    localStorage.setItem('chemspace_openai_key', key.trim());
  } else {
    localStorage.removeItem('chemspace_openai_key');
  }
}

export function hasCustomOpenAIApiKey() {
  if (typeof localStorage === 'undefined') return false;
  const k = localStorage.getItem('chemspace_openai_key') || localStorage.getItem('openai_api_key');
  return Boolean(k && k.trim());
}

/**
 * Get configured OpenAI client instance
 */
function getClient(apiKey) {
  const key = apiKey || getOpenAIApiKey();
  if (!key) return null;
  return new OpenAI({
    apiKey: key,
    dangerouslyAllowBrowser: true
  });
}

/**
 * Stream real-time tokens from OpenAI via Chat Completions
 * Yields: { text: accumulatedText, delta: token, isDone: boolean, model: string }
 */
export async function* streamOpenAIChat(query, { history = [], systemPrompt = CHEMSPACE_OPENAI_SYSTEM_INSTRUCTION, signal = null, model = 'gpt-4o-mini' } = {}) {
  const apiKey = getOpenAIApiKey();
  if (!apiKey) {
    throw new Error('OpenAI API Key is not configured in ChemSpace.');
  }

  const client = getClient(apiKey);
  const messages = [
    { role: 'system', content: systemPrompt }
  ];

  if (Array.isArray(history) && history.length > 0) {
    for (const msg of history.slice(-6)) {
      if (!msg.content) continue;
      messages.push({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      });
    }
  }

  messages.push({
    role: 'user',
    content: query
  });

  const modelsToTry = [model, ...OPENAI_MODELS.filter(m => m !== model)];
  let lastError = null;

  for (const candidateModel of modelsToTry) {
    try {
      const stream = await client.chat.completions.create({
        model: candidateModel,
        messages,
        temperature: 0.35,
        max_tokens: 2048,
        top_p: 0.95,
        stream: true
      }, { signal });

      let accumulated = '';
      for await (const chunk of stream) {
        if (signal && signal.aborted) break;
        const delta = chunk.choices[0]?.delta?.content || '';
        if (delta) {
          accumulated += delta;
          yield {
            text: accumulated,
            delta,
            isDone: false,
            model: candidateModel
          };
        }
      }

      if (accumulated) {
        yield {
          text: accumulated,
          delta: '',
          isDone: true,
          model: candidateModel
        };
        return;
      }
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      console.warn(`[OpenAIService] Streaming failed with ${candidateModel}:`, err.message);
      lastError = err;
    }
  }

  // Fallback: direct fetch streaming if SDK encountered an issue
  try {
    const fetchRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.35,
        max_tokens: 2048,
        top_p: 0.95,
        stream: true
      }),
      signal
    });

    if (fetchRes.ok && fetchRes.body) {
      const reader = fetchRes.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ') && trimmed !== 'data: [DONE]') {
            try {
              const parsed = JSON.parse(trimmed.slice(6));
              const delta = parsed.choices?.[0]?.delta?.content || '';
              if (delta) {
                accumulated += delta;
                yield {
                  text: accumulated,
                  delta,
                  isDone: false,
                  model
                };
              }
            } catch {
              // ignore parse errors for partial chunks
            }
          }
        }
      }

      if (accumulated) {
        yield {
          text: accumulated,
          delta: '',
          isDone: true,
          model
        };
        return;
      }
    }
  } catch (directErr) {
    if (directErr.name === 'AbortError') throw directErr;
    lastError = directErr;
  }

  throw lastError || new Error('Failed to stream response from OpenAI.');
}

/**
 * Standard single-shot request to OpenAI
 */
export async function callOpenAIChat(query, { history = [], systemPrompt = CHEMSPACE_OPENAI_SYSTEM_INSTRUCTION, signal = null, model = 'gpt-4o-mini' } = {}) {
  const apiKey = getOpenAIApiKey();
  if (!apiKey) {
    throw new Error('OpenAI API Key is not configured in ChemSpace.');
  }

  const client = getClient(apiKey);
  const messages = [
    { role: 'system', content: systemPrompt }
  ];

  if (Array.isArray(history) && history.length > 0) {
    for (const msg of history.slice(-6)) {
      if (!msg.content) continue;
      messages.push({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      });
    }
  }

  messages.push({
    role: 'user',
    content: query
  });

  const modelsToTry = [model, ...OPENAI_MODELS.filter(m => m !== model)];
  let lastError = null;

  for (const candidateModel of modelsToTry) {
    try {
      const response = await client.chat.completions.create({
        model: candidateModel,
        messages,
        temperature: 0.35,
        max_tokens: 2048,
        top_p: 0.95
      }, { signal });

      const text = response.choices[0]?.message?.content;
      if (text) {
        return {
          status: 'success',
          responseText: text,
          response: text,
          provider: 'ChemSpace OpenAI Intelligence',
          model: candidateModel,
          timestamp: new Date().toISOString()
        };
      }
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      console.warn(`[OpenAIService] Request failed with ${candidateModel}:`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error('Failed to obtain response from OpenAI.');
}

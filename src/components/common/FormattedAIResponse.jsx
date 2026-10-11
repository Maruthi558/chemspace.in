import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, Check, Terminal, FileCode, CheckCircle2 } from 'lucide-react';
import { isSmilesString } from '../../services/chemicalResolver';

/**
 * Pre-processes markdown text to ensure all asterisks and markdown formatting
 * are rendered cleanly without dangling or unparsed star marks.
 */
function sanitizeMarkdown(text) {
  if (!text) return '';
  let str = text;

  // Fix unclosed double asterisks at the end of streaming chunks (e.g. "**Word")
  const starCount = (str.match(/\*\*/g) || []).length;
  if (starCount % 2 !== 0) {
    str += '**';
  }

  // Fix standalone asterisk lists (e.g. "* item" -> "- item") to ensure standard bullet parsing
  str = str.replace(/^(\s*)\*(\s+)/gm, '$1-$2');

  return str;
}

function CodeBlockRenderer({ children, className, ...props }) {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';
  const codeContent = String(children).replace(/\n$/, '');

  const handleCopy = () => {
    navigator.clipboard.writeText(codeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-input)] shadow-sm">
      <div className="bg-[var(--bg-inner)] px-3 py-1.5 border-b border-[var(--border-subtle)] flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)] select-none">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)]">
          <Terminal className="w-3.5 h-3.5 text-orange-500" />
          <span>{language ? language.toUpperCase() : 'COMMAND / CODE'}</span>
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="px-2 py-0.5 rounded hover:bg-[var(--bg-hover)] text-xs font-bold text-[var(--text-secondary)] hover:text-emerald-500 transition flex items-center gap-1 cursor-pointer"
          title="Copy command"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-500" />
              <span className="text-emerald-500">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3.5 text-xs font-mono text-emerald-600 dark:text-emerald-300 overflow-x-auto leading-relaxed select-text">
        <code>{codeContent}</code>
      </pre>
    </div>
  );
}

function InlineCodeRenderer({ children, ...props }) {
  const [copied, setCopied] = useState(false);
  const codeStr = String(children);
  const isLikelySmiles = isSmilesString(codeStr) || (codeStr.length >= 2 && /[=#\(\)1-9@]/.test(codeStr));
  const isCommand = codeStr.startsWith('npm ') || codeStr.startsWith('python ') || codeStr.startsWith('git ') || codeStr.includes(' --');

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(codeStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <span className="inline-flex items-center gap-1 mx-0.5 align-baseline">
      <code className="px-1.5 py-0.5 rounded-md bg-[var(--bg-inner)] border border-[var(--border-subtle)] text-orange-600 dark:text-orange-400 font-mono text-[11px] font-semibold select-text">
        {codeStr}
      </code>
      {(isLikelySmiles || isCommand) && (
        <button
          type="button"
          onClick={handleCopy}
          className="p-0.5 rounded hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-orange-500 transition cursor-pointer"
          title={isLikelySmiles ? 'Copy SMILES' : 'Copy command'}
        >
          {copied ? <Check className="w-2.5 h-2.5 text-emerald-500" /> : <Copy className="w-2.5 h-2.5" />}
        </button>
      )}
    </span>
  );
}

export default function FormattedAIResponse({ content = '', className = '' }) {
  if (!content) return null;

  const cleanedMarkdown = sanitizeMarkdown(content);

  return (
    <div className={`prose prose-sm max-w-none text-xs sm:text-sm text-[var(--text-primary)] leading-relaxed font-sans selection:bg-orange-500/20 ${className}`}>
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-base sm:text-lg font-bold text-[var(--text-primary)] mt-4 mb-2 pb-1 border-b border-[var(--border-subtle)]">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-sm sm:text-base font-bold text-[var(--text-primary)] mt-3 mb-1.5">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xs sm:text-sm font-bold text-orange-500 dark:text-orange-400 mt-2.5 mb-1">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-2 leading-relaxed last:mb-0">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-[var(--text-primary)] tracking-tight">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-[var(--text-secondary)]">
              {children}
            </em>
          ),
          ul: ({ children }) => (
            <ul className="space-y-1.5 my-2 pl-2 list-none">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="space-y-1.5 my-2 pl-4 list-decimal marker:text-orange-500 marker:font-bold">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="flex items-start gap-2 leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0 mt-1.5" />
              <div className="flex-1 min-w-0">{children}</div>
            </li>
          ),
          code: ({ inline, className, children, ...props }) => {
            const hasMultipleLines = String(children).includes('\n');
            if (!inline && hasMultipleLines) {
              return <CodeBlockRenderer className={className} {...props}>{children}</CodeBlockRenderer>;
            }
            return <InlineCodeRenderer {...props}>{children}</InlineCodeRenderer>;
          },
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-inner)] shadow-sm">
              <table className="w-full text-left text-xs border-collapse">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-[var(--bg-hover)] text-[var(--text-secondary)] font-bold border-b border-[var(--border-subtle)]">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="px-3 py-2 text-[11px] font-mono uppercase tracking-wider text-[var(--text-secondary)]">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 border-t border-[var(--border-subtle)] text-xs text-[var(--text-primary)]">
              {children}
            </td>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-orange-500 pl-3 my-2 text-[var(--text-secondary)] italic">
              {children}
            </blockquote>
          )
        }}
      >
        {cleanedMarkdown}
      </ReactMarkdown>
    </div>
  );
}

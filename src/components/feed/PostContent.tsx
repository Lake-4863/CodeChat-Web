'use client';

import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface PostContentProps {
  content: string;
}

export function PostContent({ content }: PostContentProps) {
  return (
    <div className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
      <ReactMarkdown
        components={{
          code({ node, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const text = String(children);
            const isBlock = match !== null || text.endsWith('\n');
            if (!isBlock) {
              return (
                <code
                  style={{
                    background: 'var(--bg-tertiary)',
                    color: 'var(--accent)',
                    padding: '1px 5px',
                    borderRadius: '3px',
                    fontFamily: 'ui-monospace, monospace',
                    fontSize: '0.85em',
                  }}
                  {...props}
                >
                  {children}
                </code>
              );
            }
            const lang = match ? match[1] : '';
            const code = text.replace(/\n$/, '');
            return <CodeBlock lang={lang} code={code} />;
          },
          p({ children }) {
            return <p className="mb-2 last:mb-0" style={{ color: 'var(--text-primary)' }}>{children}</p>;
          },
          a({ children, href }) {
            return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
          },
          strong({ children }) {
            return <strong style={{ color: 'var(--text-primary)' }}>{children}</strong>;
          },
          blockquote({ children }) {
            return (
              <blockquote
                style={{ borderLeft: '3px solid var(--border)', paddingLeft: '12px', color: 'var(--text-secondary)' }}
                className="my-2"
              >
                {children}
              </blockquote>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

function CodeBlock({ lang, code }: { lang: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      style={{ border: '1px solid var(--border)', borderRadius: '6px', overflow: 'hidden', marginTop: '8px', marginBottom: '8px' }}
      className="group relative"
    >
      <div
        style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border)' }}
        className="flex items-center justify-between px-3 py-1"
      >
        <span style={{ color: 'var(--text-muted)', fontFamily: 'ui-monospace, monospace' }} className="text-xs">{lang}</span>
        <button
          onClick={handleCopy}
          style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
          className="flex items-center gap-1 text-xs hover:text-[var(--text-primary)] transition-colors"
          title="コピー"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <SyntaxHighlighter
        style={vscDarkPlus as Record<string, React.CSSProperties>}
        language={lang || 'text'}
        PreTag="div"
        customStyle={{ margin: 0, borderRadius: 0, background: '#1e1e1e', fontSize: '0.8rem' }}
        showLineNumbers={code.split('\n').length > 5}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

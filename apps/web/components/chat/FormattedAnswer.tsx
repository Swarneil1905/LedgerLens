"use client";

import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

/** Turn [1] into a markdown link so we can render citations as superscripts. */
function preprocessCitations(md: string): string {
  return md.replace(/\[(\d+)\]/g, (_, n: string) => `[\\[${n}\\]](cite:${n})`);
}

/** Many models emit `1. **Title**` on the same line as prior text — force block breaks. */
function normalizeLooseNumbering(md: string): string {
  return md
    .replace(/([^\n])\s*(\d{1,2}\.\s+\*\*)/g, "$1\n\n$2")
    .replace(/(\*\*[^*]+\*\*:)\s+\*/g, "$1\n\n- ");
}

const markdownComponents: Partial<Components> = {
  a: ({ href, children, ...props }) => {
    if (href?.startsWith("cite:")) {
      const n = href.slice("cite:".length);
      return (
        <sup
          className="mx-0.5 inline cursor-default align-super font-mono text-[10px] font-semibold tracking-tight text-[var(--ll-accent)]"
          aria-label={`Source ${n}`}
        >
          [{n}]
        </sup>
      );
    }
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-[var(--ll-accent)] underline decoration-[var(--ll-accent)]/40 underline-offset-2 hover:decoration-[var(--ll-accent)]"
        {...props}
      >
        {children}
      </a>
    );
  },
  h1: ({ children }) => (
    <h3 className="mb-2 mt-5 border-b border-[var(--ll-border-default)] pb-1.5 text-[15px] font-semibold tracking-tight text-[var(--ll-text-primary)] first:mt-0">
      {children}
    </h3>
  ),
  h2: ({ children }) => (
    <h3 className="mb-2 mt-5 border-b border-[var(--ll-border-default)] pb-1.5 text-[15px] font-semibold tracking-tight text-[var(--ll-text-primary)] first:mt-0">
      {children}
    </h3>
  ),
  h3: ({ children }) => (
    <h4 className="mb-1.5 mt-4 text-sm font-semibold tracking-tight text-[var(--ll-text-primary)] first:mt-0">
      {children}
    </h4>
  ),
  p: ({ children }) => (
    <p className="mb-3 text-[13px] leading-[1.65] text-[var(--ll-text-secondary)] last:mb-0">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="mb-3 ml-1 list-disc space-y-1.5 pl-4 text-[13px] leading-[1.6] text-[var(--ll-text-secondary)] marker:text-[var(--ll-text-tertiary)]">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-3 ml-1 list-decimal space-y-1.5 pl-4 text-[13px] leading-[1.6] text-[var(--ll-text-secondary)] marker:font-mono marker:text-xs marker:text-[var(--ll-text-tertiary)]">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="pl-0.5 [&>p]:mb-1">{children}</li>,
  strong: ({ children }) => (
    <strong className="font-semibold text-[var(--ll-text-primary)]">{children}</strong>
  ),
  hr: () => <hr className="my-4 border-[var(--ll-border-hairline)]" />,
  blockquote: ({ children }) => (
    <blockquote className="my-3 border-l-2 border-[var(--ll-accent)]/50 pl-3 text-[13px] italic text-[var(--ll-text-tertiary)]">
      {children}
    </blockquote>
  ),
  table: ({ children }) => (
    <div className="my-3 overflow-x-auto rounded-[var(--ll-radius-md)] border border-[var(--ll-border-default)] bg-[var(--ll-bg-base)]">
      <table className="w-full min-w-[320px] border-collapse text-left text-[12px] text-[var(--ll-text-secondary)]">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-[var(--ll-bg-overlay)]">{children}</thead>,
  th: ({ children }) => (
    <th className="border-b border-[var(--ll-border-default)] px-2.5 py-2 font-semibold text-[var(--ll-text-primary)]">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b border-[var(--ll-border-hairline)] px-2.5 py-1.5 align-top">{children}</td>
  ),
  code: ({ className, children, ...props }) => {
    const isBlock = className?.includes("language-");
    if (isBlock) {
      return (
        <pre className="my-3 overflow-x-auto rounded-[var(--ll-radius-md)] border border-[var(--ll-border-default)] bg-[var(--ll-bg-base)] p-3 text-[11px] leading-relaxed text-[var(--ll-text-secondary)]">
          <code className={className} {...props}>
            {children}
          </code>
        </pre>
      );
    }
    return (
      <code
        className="rounded bg-[var(--ll-bg-overlay)] px-1 py-0.5 font-mono text-[11px] text-[var(--ll-accent)]"
        {...props}
      >
        {children}
      </code>
    );
  }
};

export function FormattedAnswer({ content }: { content: string }) {
  const md = useMemo(() => {
    const trimmed = content.trim();
    if (!trimmed) {
      return "";
    }
    return preprocessCitations(normalizeLooseNumbering(trimmed));
  }, [content]);

  if (!md) {
    return null;
  }

  return (
    <div
      className="ll-answer-markdown max-w-[min(100%,72ch)]"
      style={{ fontFamily: "var(--ll-font-ui)" }}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {md}
      </ReactMarkdown>
    </div>
  );
}

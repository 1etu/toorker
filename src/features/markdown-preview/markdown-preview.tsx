import { useState, useMemo } from "react";
import { Copy, Check } from "lucide-react";

const SAMPLE = `# Heading 1
## Heading 2
### Heading 3

This is a paragraph with **bold**, *italic*, and \`inline code\`.

- Unordered list item 1
- Unordered list item 2
- Nested concept

1. Ordered item one
2. Ordered item two

> This is a blockquote with some wisdom.

\`\`\`javascript
const greeting = "Hello, World!";
console.log(greeting);
\`\`\`

[Link text](https://example.com) and some trailing text.

---

| Column A | Column B |
|----------|----------|
| Cell 1   | Cell 2   |
`;

function renderMarkdown(md: string): string {
  let html = md;

  html = html.replace(
    /```(\w*)\n([\s\S]*?)```/g,
    (_, _lang, code) =>
      `<pre class="md-pre"><code class="md-code">${escapeHtml(code.trimEnd())}</code></pre>`,
  );

  html = html.replace(
    /`([^`]+)`/g,
    '<code class="md-inline-code">$1</code>',
  );

  html = html.replace(/^######\s+(.+)$/gm, '<h6 class="md-h6">$1</h6>');
  html = html.replace(/^#####\s+(.+)$/gm, '<h5 class="md-h5">$1</h5>');
  html = html.replace(/^####\s+(.+)$/gm, '<h4 class="md-h4">$1</h4>');
  html = html.replace(/^###\s+(.+)$/gm, '<h3 class="md-h3">$1</h3>');
  html = html.replace(/^##\s+(.+)$/gm, '<h2 class="md-h2">$1</h2>');
  html = html.replace(/^#\s+(.+)$/gm, '<h1 class="md-h1">$1</h1>');

  html = html.replace(
    /\*\*\*(.+?)\*\*\*/g,
    "<strong><em>$1</em></strong>",
  );
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

  html = html.replace(/^---$/gm, '<hr class="md-hr" />');

  html = html.replace(
    /^>\s+(.+)$/gm,
    '<blockquote class="md-blockquote">$1</blockquote>',
  );

  html = html.replace(
    /^[-*]\s+(.+)$/gm,
    '<li class="md-li">$1</li>',
  );

  html = html.replace(
    /^\d+\.\s+(.+)$/gm,
    '<li class="md-li-ord">$1</li>',
  );

  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a class="md-link" href="$2">$1</a>',
  );

  html = html.replace(/\n\n/g, "<br/><br/>");

  return html;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const MD_STYLES = `
  .md-preview { font-size: 13px; line-height: 1.7; color: hsl(var(--foreground) / 0.85); }
  .md-preview .md-h1 { font-size: 20px; font-weight: 700; margin: 16px 0 8px; color: hsl(var(--foreground)); }
  .md-preview .md-h2 { font-size: 17px; font-weight: 600; margin: 14px 0 6px; color: hsl(var(--foreground)); }
  .md-preview .md-h3 { font-size: 15px; font-weight: 600; margin: 12px 0 4px; color: hsl(var(--foreground)); }
  .md-preview .md-h4, .md-preview .md-h5, .md-preview .md-h6 { font-size: 13px; font-weight: 600; margin: 10px 0 4px; color: hsl(var(--foreground)); }
  .md-preview strong { font-weight: 600; color: hsl(var(--foreground)); }
  .md-preview em { font-style: italic; }
  .md-preview .md-inline-code { font-family: var(--font-mono, monospace); font-size: 12px; padding: 1px 5px; border-radius: 4px; background: hsl(var(--secondary)); }
  .md-preview .md-pre { margin: 8px 0; padding: 12px; border-radius: 8px; background: hsl(var(--secondary)); overflow-x: auto; }
  .md-preview .md-code { font-family: var(--font-mono, monospace); font-size: 12px; line-height: 1.6; }
  .md-preview .md-blockquote { border-left: 3px solid hsl(var(--border)); padding-left: 12px; margin: 8px 0; color: hsl(var(--muted-foreground)); }
  .md-preview .md-li { margin-left: 20px; list-style: disc; }
  .md-preview .md-li-ord { margin-left: 20px; list-style: decimal; }
  .md-preview .md-link { color: hsl(var(--primary)); text-decoration: underline; text-underline-offset: 2px; }
  .md-preview .md-hr { border: none; border-top: 1px solid hsl(var(--border)); margin: 12px 0; }
`;

export const MarkdownPreview = () => {
  const [input, setInput] = useState(SAMPLE);
  const [copied, setCopied] = useState(false);

  const html = useMemo(() => renderMarkdown(input), [input]);

  const copyHtml = async () => {
    await navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-3">
      <style>{MD_STYLES}</style>

      <div className="flex items-center gap-2">
        <span className="text-[11px] text-muted-foreground/40">
          {input.split(/\n/).length} lines
        </span>
        <div className="flex-1" />
        <button
          onClick={copyHtml}
          disabled={!input}
          className="flex h-8 items-center gap-1.5 rounded-md border px-3 text-[11px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-40"
        >
          {copied ? (
            <Check className="h-3 w-3 text-success" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
          Copy HTML
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/40">
            Markdown
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter markdown..."
            spellCheck={false}
            className="h-[420px] w-full resize-none rounded-lg border bg-card p-3 font-mono text-[12px] leading-relaxed outline-none placeholder:text-muted-foreground/30 focus:ring-1 focus:ring-ring"
          />
        </div>
        <div>
          <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/40">
            Preview
          </div>
          <div
            className="md-preview h-[420px] overflow-y-auto rounded-lg border bg-card p-4"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    </div>
  );
};

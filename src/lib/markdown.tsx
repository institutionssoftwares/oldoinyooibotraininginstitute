import { Fragment, type ReactNode } from "react";

/**
 * Tiny, safe markdown renderer (no raw HTML). Supports headings, paragraphs,
 * bold, italic, links, images, bullet/numbered lists and block quotes.
 */
function inline(text: string, keyPrefix: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(!\[([^\]]*)\]\(([^)\s]+)\))|(\[([^\]]+)\]\(([^)\s]+)\))|(\*\*([^*]+)\*\*)|(_([^_]+)_)|(\*([^*]+)\*)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const k = `${keyPrefix}-${i++}`;
    if (m[1]) out.push(<img key={k} src={safeUrl(m[3]!)} alt={m[2] ?? ""} className="my-4 rounded-lg" loading="lazy" />);
    else if (m[4])
      out.push(
        <a key={k} href={safeUrl(m[6]!)} className="text-primary underline underline-offset-2" target={m[6]!.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
          {m[5]}
        </a>,
      );
    else if (m[7]) out.push(<strong key={k}>{m[8]}</strong>);
    else if (m[9]) out.push(<em key={k}>{m[10]}</em>);
    else if (m[11]) out.push(<em key={k}>{m[12]}</em>);
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function safeUrl(u: string) {
  return /^(https?:\/\/|\/|mailto:|tel:)/i.test(u) ? u : "#";
}

export function renderMarkdown(src: string | null | undefined): ReactNode {
  if (!src) return null;
  const blocks = src.replace(/\r\n/g, "\n").split(/\n{2,}/);
  return blocks.map((block, bi) => {
    const lines = block.split("\n").filter((l) => l.trim() !== "");
    if (lines.length === 0) return null;
    const first = lines[0]!;
    const h = /^(#{1,4})\s+(.*)$/.exec(first);
    if (h && lines.length === 1) {
      const level = h[1]!.length;
      const cls = ["text-2xl font-semibold text-foreground", "text-xl font-semibold text-foreground", "text-lg font-semibold text-foreground", "font-semibold text-foreground"][level - 1];
      const content = inline(h[2]!, `h${bi}`);
      if (level === 1) return <h2 key={bi} className={cls}>{content}</h2>;
      if (level === 2) return <h3 key={bi} className={cls}>{content}</h3>;
      return <h4 key={bi} className={cls}>{content}</h4>;
    }
    if (lines.every((l) => /^\s*[-*•]\s+/.test(l)))
      return (
        <ul key={bi} className="list-disc space-y-1 pl-6">
          {lines.map((l, li) => <li key={li}>{inline(l.replace(/^\s*[-*•]\s+/, ""), `${bi}-${li}`)}</li>)}
        </ul>
      );
    if (lines.every((l) => /^\s*\d+[.)]\s+/.test(l)))
      return (
        <ol key={bi} className="list-decimal space-y-1 pl-6">
          {lines.map((l, li) => <li key={li}>{inline(l.replace(/^\s*\d+[.)]\s+/, ""), `${bi}-${li}`)}</li>)}
        </ol>
      );
    if (lines.every((l) => l.startsWith(">")))
      return (
        <blockquote key={bi} className="border-l-4 border-gold pl-4 italic">
          {lines.map((l, li) => <Fragment key={li}>{inline(l.replace(/^>\s?/, ""), `${bi}-${li}`)}{li < lines.length - 1 ? <br /> : null}</Fragment>)}
        </blockquote>
      );
    return (
      <p key={bi}>
        {lines.map((l, li) => <Fragment key={li}>{inline(l, `${bi}-${li}`)}{li < lines.length - 1 ? <br /> : null}</Fragment>)}
      </p>
    );
  });
}

export function Markdown({ source, className }: { source: string | null | undefined; className?: string }) {
  return <div className={className ?? "space-y-4 leading-relaxed text-muted-foreground"}>{renderMarkdown(source)}</div>;
}

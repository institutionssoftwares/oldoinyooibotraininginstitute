import { useRef, useState } from "react";
import { Bold, Eye, Heading2, Image as ImageIcon, Italic, Link2, List, ListOrdered, Pencil, Quote } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Markdown } from "@/lib/markdown";
import { MediaPickerDialog } from "./MediaPicker";

type Props = { value: string; onChange: (v: string) => void; id?: string | undefined; placeholder?: string | undefined; rows?: number | undefined };

/** Markdown-based rich text editor with a toolbar and live preview (no raw HTML). */
export function RichTextEditor({ value, onChange, id, placeholder, rows = 12 }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [preview, setPreview] = useState(false);
  const [pick, setPick] = useState(false);

  const wrap = (before: string, after = before, placeholderText = "text") => {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e } = el;
    const sel = value.slice(s, e) || placeholderText;
    const next = value.slice(0, s) + before + sel + after + value.slice(e);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(s + before.length, s + before.length + sel.length);
    });
  };
  const linePrefix = (prefix: string) => {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e } = el;
    const start = value.lastIndexOf("\n", s - 1) + 1;
    const endIdx = value.indexOf("\n", e);
    const end = endIdx === -1 ? value.length : endIdx;
    const block = value
      .slice(start, end)
      .split("\n")
      .map((l, i) => (prefix === "1. " ? `${i + 1}. ${l}` : prefix + l))
      .join("\n");
    onChange(value.slice(0, start) + block + value.slice(end));
    requestAnimationFrame(() => el.focus());
  };
  const insert = (text: string) => {
    const el = ref.current;
    const s = el?.selectionStart ?? value.length;
    onChange(value.slice(0, s) + text + value.slice(s));
  };

  const tools = [
    { icon: Bold, label: "Bold", run: () => wrap("**") },
    { icon: Italic, label: "Italic", run: () => wrap("_") },
    { icon: Heading2, label: "Heading", run: () => linePrefix("## ") },
    { icon: List, label: "Bullet list", run: () => linePrefix("- ") },
    { icon: ListOrdered, label: "Numbered list", run: () => linePrefix("1. ") },
    { icon: Quote, label: "Quote", run: () => linePrefix("> ") },
    {
      icon: Link2,
      label: "Link",
      run: () => {
        const url = window.prompt("Link address (https://…)");
        if (url) wrap("[", `](${url})`, "link text");
      },
    },
    { icon: ImageIcon, label: "Insert image", run: () => setPick(true) },
  ];

  return (
    <div className="rounded-lg border">
      <div className="flex flex-wrap items-center gap-0.5 border-b bg-muted/40 p-1">
        {tools.map((t) => (
          <Button key={t.label} type="button" variant="ghost" size="icon" className="size-8" title={t.label} aria-label={t.label} onClick={t.run} disabled={preview}>
            <t.icon className="size-4" />
          </Button>
        ))}
        <div className="ml-auto">
          <Button type="button" variant="ghost" size="sm" onClick={() => setPreview((p) => !p)}>
            {preview ? <Pencil className="size-4" /> : <Eye className="size-4" />}
            {preview ? "Edit" : "Preview"}
          </Button>
        </div>
      </div>
      {preview ? (
        <div className="min-h-40 p-4">
          {value.trim() ? <Markdown source={value} className="space-y-3 text-sm leading-relaxed" /> : <p className="text-sm text-muted-foreground">Nothing to preview yet.</p>}
        </div>
      ) : (
        <Textarea ref={ref} id={id} value={value} onChange={(e) => onChange(e.target.value)} rows={rows} placeholder={placeholder} className="rounded-t-none border-0 font-mono text-sm focus-visible:ring-0" />
      )}
      <p className="border-t px-3 py-1.5 text-[11px] text-muted-foreground">Formatting: **bold**, _italic_, ## heading, - bullet, 1. numbered, &gt; quote, [link](https://…)</p>
      <MediaPickerDialog open={pick} onOpenChange={setPick} category="news" onSelect={(rows) => rows[0] && insert(`\n\n![${rows[0].alt_text ?? rows[0].title ?? ""}](${rows[0].url})\n\n`)} />
    </div>
  );
}

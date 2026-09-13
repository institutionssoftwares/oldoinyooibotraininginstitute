import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Save, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { MediaField, MediaPickerDialog } from "@/components/admin/MediaPicker";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { relationOptions, upsertRow, type Row } from "@/lib/admin/api";
import { slugify, type FieldDef, type ResourceDef } from "@/lib/admin/resources";
import { cn } from "@/lib/utils";

type Values = Record<string, unknown>;

function toLocal(iso: string | null | undefined) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function ImagesField({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {value.map((url, i) => (
          <div key={url + i} className="relative size-20 overflow-hidden rounded-lg border bg-muted">
            <img src={url} alt="" className="size-full object-cover" />
            <button
              type="button"
              className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white"
              onClick={() => onChange(value.filter((_, j) => j !== i))}
              aria-label="Remove image"
            >
              <X className="size-3" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex size-20 flex-col items-center justify-center gap-1 rounded-lg border border-dashed text-muted-foreground hover:bg-muted/50"
        >
          <Plus className="size-5" />
          <span className="text-[10px]">Add</span>
        </button>
      </div>
      <MediaPickerDialog
        open={open}
        onOpenChange={setOpen}
        multiple
        category="gallery"
        onSelect={(rows) => onChange([...value, ...rows.map((r) => r.url)])}
      />
    </div>
  );
}

function RelationField({ field, value, onChange }: { field: FieldDef; value: string; onChange: (v: string | null) => void }) {
  const rel = field.relation!;
  const opts = useQuery({ queryKey: ["rel", rel.table, rel.labelColumn], queryFn: () => relationOptions(rel) });
  return (
    <Select value={value || "none"} onValueChange={(v) => onChange(v === "none" ? null : v)}>
      <SelectTrigger>
        <SelectValue placeholder={opts.isLoading ? "Loading…" : "Select…"} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">— None —</SelectItem>
        {(opts.data ?? []).map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function ResourceForm({
  def,
  initial,
  onSaved,
}: {
  def: ResourceDef;
  initial?: Row | undefined;
  onSaved?: ((row: Row) => void) | undefined;
}) {
  const [values, setValues] = useState<Values>(() => ({ ...(def.defaults ?? {}), ...(initial ?? {}) }));
  const [saving, setSaving] = useState(false);
  const set = (name: string, v: unknown) => setValues((s) => ({ ...s, [name]: v }));

  const groups = useMemo(() => {
    const order: string[] = [];
    const map = new Map<string, FieldDef[]>();
    for (const f of def.fields) {
      const g = f.group ?? "Content";
      if (!map.has(g)) {
        map.set(g, []);
        order.push(g);
      }
      map.get(g)!.push(f);
    }
    return order.map((g) => ({ name: g, fields: map.get(g)! }));
  }, [def]);

  const save = async () => {
    for (const f of def.fields) {
      if (f.required) {
        const v = values[f.name];
        if (v === undefined || v === null || v === "" || (Array.isArray(v) && !v.length)) {
          toast.error(`"${f.label}" is required`);
          document.getElementById(`field-${f.name}`)?.focus();
          return;
        }
      }
    }
    const payload: Values = {};
    for (const f of def.fields) {
      let v = values[f.name];
      if (typeof v === "string") v = v.trim();
      if (v === "") v = null;
      if (f.type === "number" && v != null) v = Number(v);
      if (f.type === "datetime" && v) v = new Date(v as string).toISOString();
      payload[f.name] = v;
    }
    setSaving(true);
    try {
      const row = await upsertRow(def.table, payload, initial?.id);
      toast.success(initial ? `${def.singular} updated` : `${def.singular} created`);
      onSaved?.(row);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save");
    } finally {
      setSaving(false);
    }
  };

  const renderField = (f: FieldDef) => {
    const v = values[f.name];
    const id = `field-${f.name}`;
    switch (f.type) {
      case "switch":
        return (
          <div className="flex items-center gap-3 pt-6">
            <Switch id={id} checked={Boolean(v)} onCheckedChange={(c) => set(f.name, c)} />
            <Label htmlFor={id} className="font-normal">
              {f.label}
            </Label>
          </div>
        );
      case "textarea":
      case "units":
        return (
          <Textarea
            id={id}
            rows={f.type === "units" ? 6 : 3}
            maxLength={f.max}
            placeholder={f.placeholder ?? (f.type === "units" ? "One item per line" : undefined)}
            value={f.type === "units" ? (Array.isArray(v) ? (v as string[]).join("\n") : ((v as string) ?? "")) : ((v as string) ?? "")}
            onChange={(e) =>
              set(f.name, f.type === "units" ? e.target.value.split("\n").map((l) => l.trim()).filter(Boolean) : e.target.value)
            }
          />
        );
      case "richtext":
        return <RichTextEditor id={id} value={(v as string) ?? ""} onChange={(x) => set(f.name, x)} placeholder={f.placeholder} />;
      case "number":
        return <Input id={id} type="number" value={v == null ? "" : String(v)} onChange={(e) => set(f.name, e.target.value === "" ? null : Number(e.target.value))} />;
      case "select":
        return (
          <Select value={(v as string) ?? ""} onValueChange={(x) => set(f.name, x)}>
            <SelectTrigger id={id}>
              <SelectValue placeholder="Select…" />
            </SelectTrigger>
            <SelectContent>
              {(f.options ?? []).map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case "date":
        return <Input id={id} type="date" value={((v as string) ?? "").slice(0, 10)} onChange={(e) => set(f.name, e.target.value || null)} />;
      case "datetime":
        return <Input id={id} type="datetime-local" value={toLocal(v as string)} onChange={(e) => set(f.name, e.target.value || null)} />;
      case "image":
        return <MediaField value={v as string | null} onChange={(url) => set(f.name, url)} category={def.key === "staff" ? "staff" : def.key === "courses" ? "courses" : "news"} />;
      case "file":
        return <MediaField value={v as string | null} onChange={(url) => set(f.name, url)} imagesOnly={false} category="documents" label="file" />;
      case "tags":
        return (
          <Input
            id={id}
            placeholder="Comma separated, e.g. admissions, 2026"
            value={Array.isArray(v) ? (v as string[]).join(", ") : ((v as string) ?? "")}
            onChange={(e) => set(f.name, e.target.value.split(",").map((t) => t.trim()).filter(Boolean))}
          />
        );
      case "images":
        return <ImagesField value={Array.isArray(v) ? (v as string[]) : []} onChange={(x) => set(f.name, x)} />;
      case "relation":
        return <RelationField field={f} value={(v as string) ?? ""} onChange={(x) => set(f.name, x)} />;
      case "slug":
        return (
          <div className="flex gap-2">
            <Input id={id} value={(v as string) ?? ""} onChange={(e) => set(f.name, slugify(e.target.value))} placeholder="web-address-slug" />
            {f.slugFrom ? (
              <Button type="button" variant="outline" size="sm" className="shrink-0" onClick={() => set(f.name, slugify((values[f.slugFrom!] as string) ?? ""))}>
                Generate
              </Button>
            ) : null}
          </div>
        );
      default:
        return <Input id={id} maxLength={f.max} value={(v as string) ?? ""} placeholder={f.placeholder} onChange={(e) => set(f.name, e.target.value)} />;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {groups.map((g) => (
        <section key={g.name} className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{g.name}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {g.fields.map((f) => (
              <div key={f.name} className={cn("flex flex-col gap-1.5", f.width === "half" || f.type === "switch" ? "" : "sm:col-span-2")}>
                {f.type !== "switch" ? (
                  <Label htmlFor={`field-${f.name}`}>
                    {f.label} {f.required ? <span className="text-destructive">*</span> : null}
                  </Label>
                ) : null}
                {renderField(f)}
                {f.help ? <p className="text-xs text-muted-foreground">{f.help}</p> : null}
              </div>
            ))}
          </div>
        </section>
      ))}
      <div className="sticky bottom-4 flex justify-end gap-2">
        <Button onClick={() => void save()} disabled={saving} variant="navy" size="lg" className="shadow-lift">
          <Save className="size-4" />
          {saving ? "Saving…" : initial ? `Save ${def.singular.toLowerCase()}` : `Create ${def.singular.toLowerCase()}`}
        </Button>
      </div>
    </div>
  );
}

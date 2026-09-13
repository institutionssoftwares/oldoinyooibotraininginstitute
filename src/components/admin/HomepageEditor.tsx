import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { MediaField } from "@/components/admin/MediaPicker";
import { supabase } from "@/integrations/supabase/client";

type Section = {
  id: string;
  key: string;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  image_url: string | null;
  cta_label: string | null;
  cta_link: string | null;
  secondary_cta_label: string | null;
  secondary_cta_link: string | null;
  enabled: boolean;
  sort_order: number;
};

/** Edit the homepage's configurable sections (hero, calls to action, highlights). */
export function HomepageEditor() {
  const qc = useQueryClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const table = () => (supabase as any).from("homepage_sections");
  const sections = useQuery({
    queryKey: ["admin", "homepage_sections"],
    queryFn: async () => {
      const { data, error } = await table().select("*").order("sort_order");
      if (error) throw new Error(error.message);
      return (data ?? []) as Section[];
    },
  });

  const save = useMutation({
    mutationFn: async (s: Section) => {
      const { id: _id, ...values } = s;
      const { error } = await table().update(values).eq("id", s.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Section saved");
      void qc.invalidateQueries({ queryKey: ["admin", "homepage_sections"] });
    },
    onError: (e) => toast.error(e.message),
  });

  if (sections.isLoading) return <p className="py-12 text-center text-sm text-muted-foreground">Loading…</p>;
  if (!sections.data?.length)
    return (
      <p className="rounded-xl border border-dashed p-12 text-center text-sm text-muted-foreground">
        No homepage sections found in the database.
      </p>
    );

  return (
    <div className="flex flex-col gap-5">
      {sections.data.map((s) => (
        <SectionCard key={s.id} section={s} onSave={(next) => save.mutate(next)} saving={save.isPending} />
      ))}
    </div>
  );
}

function SectionCard({ section, onSave, saving }: { section: Section; onSave: (s: Section) => void; saving: boolean }) {
  const [draft, setDraft] = useStateSafe(section);
  const set = (k: keyof Section, v: unknown) => setDraft((d) => ({ ...d, [k]: v }));
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-base font-semibold capitalize">{section.key.replace(/_/g, " ")}</h2>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <Switch checked={draft.enabled} onCheckedChange={(c) => set("enabled", c)} />
          Shown on homepage
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label>Title</Label>
          <Input value={draft.title ?? ""} onChange={(e) => set("title", e.target.value || null)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Subtitle</Label>
          <Input value={draft.subtitle ?? ""} onChange={(e) => set("subtitle", e.target.value || null)} />
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label>Body text</Label>
          <Textarea rows={3} value={draft.body ?? ""} onChange={(e) => set("body", e.target.value || null)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Button label</Label>
          <Input value={draft.cta_label ?? ""} onChange={(e) => set("cta_label", e.target.value || null)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Button link</Label>
          <Input value={draft.cta_link ?? ""} placeholder="/admissions" onChange={(e) => set("cta_link", e.target.value || null)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Second button label</Label>
          <Input value={draft.secondary_cta_label ?? ""} onChange={(e) => set("secondary_cta_label", e.target.value || null)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Second button link</Label>
          <Input value={draft.secondary_cta_link ?? ""} onChange={(e) => set("secondary_cta_link", e.target.value || null)} />
        </div>
        <div className="sm:col-span-2">
          <Label>Image</Label>
          <div className="mt-1.5">
            <MediaField value={draft.image_url} onChange={(url) => set("image_url", url)} category="homepage" />
          </div>
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <Button variant="navy" disabled={saving} onClick={() => onSave(draft)}>
          Save section
        </Button>
      </div>
    </section>
  );
}

import { useState } from "react";
function useStateSafe<T>(initial: T) {
  return useState<T>(initial);
}

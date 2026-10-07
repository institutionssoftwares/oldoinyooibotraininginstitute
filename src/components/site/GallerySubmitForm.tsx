import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitGalleryPhotos } from "@/lib/gallery-submissions.functions";

export function GallerySubmitForm() {
  const submit = useServerFn(submitGalleryPhotos);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formEl = e.currentTarget;
    setBusy(true);
    try {
      const res = await submit({ data: new FormData(formEl) });
      toast.success(`Thank you! ${res.count} photo${res.count > 1 ? "s" : ""} sent for approval.`);
      formEl.reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send photos.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-4 rounded-xl border border-border bg-card p-6 shadow-card">
      <div>
        <h2 className="font-display text-xl font-semibold">Share your OOTI photos</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Send photos of institute activities. They will appear in the gallery after the administrator approves them.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="sub-name">Your name</Label>
          <Input id="sub-name" name="name" required minLength={2} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="sub-phone">Phone (optional)</Label>
          <Input id="sub-phone" name="phone" type="tel" />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="sub-caption">Description (optional)</Label>
        <Input id="sub-caption" name="caption" placeholder="e.g. Electrical practicals, March 2026" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="sub-photos">Photos (up to 10, max 8 MB each)</Label>
        <Input id="sub-photos" name="photos" type="file" accept="image/*" multiple required />
      </div>
      <Button type="submit" variant="gold" disabled={busy}>
        {busy ? "Sending…" : "Send for approval"}
      </Button>
    </form>
  );
}

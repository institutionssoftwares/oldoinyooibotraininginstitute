import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPasswordReset } from "@/lib/password-reset.functions";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot password | OOTI" },
      { name: "description", content: "Request a password reset for your OOTI student, trainer or staff account." },
      { property: "og:title", content: "Forgot password | OOTI" },
      { property: "og:description", content: "Request a password reset for your OOTI account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ForgotPassword,
});

function ForgotPassword() {
  const send = useServerFn(requestPasswordReset);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    try {
      await send({
        data: {
          full_name: String(f.get("full_name") ?? ""),
          email: String(f.get("email") ?? ""),
          phone: String(f.get("phone") ?? ""),
          account_type: String(f.get("account_type") ?? "student") as "student",
          note: String(f.get("note") ?? ""),
        },
      });
      setDone(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Please check your details.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="container mx-auto max-w-lg px-4 py-16">
      <h1 className="font-display text-3xl font-bold text-primary">Forgot your password?</h1>
      {done ? (
        <div className="mt-6 rounded-xl border border-border bg-card p-8 shadow-card">
          <p className="font-medium">Request received.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            The OOTI administrator will reset your password and contact you with your new password.
          </p>
          <Link to="/login" className="mt-4 inline-block text-sm text-primary hover:underline">
            Back to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-6 grid gap-4 rounded-xl border border-border bg-card p-8 shadow-card">
          <p className="text-sm text-muted-foreground">
            Fill in your details. The administrator will reset your password and give you the new one.
          </p>
          <div className="grid gap-2"><Label htmlFor="full_name">Full name</Label><Input id="full_name" name="full_name" required minLength={2} /></div>
          <div className="grid gap-2"><Label htmlFor="email">Account email</Label><Input id="email" name="email" type="email" required /></div>
          <div className="grid gap-2"><Label htmlFor="phone">Phone number (to receive your new password)</Label><Input id="phone" name="phone" /></div>
          <div className="grid gap-2">
            <Label htmlFor="account_type">I am a</Label>
            <select id="account_type" name="account_type" className="h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value="student">Student</option>
              <option value="trainer">Trainer</option>
              <option value="staff">Staff</option>
            </select>
          </div>
          <div className="grid gap-2"><Label htmlFor="note">Note (optional)</Label><Input id="note" name="note" /></div>
          <Button type="submit" variant="gold" disabled={busy}>{busy ? "Sending…" : "Send request"}</Button>
        </form>
      )}
    </section>
  );
}

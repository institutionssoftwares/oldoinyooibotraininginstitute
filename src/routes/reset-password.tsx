import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/ooti-logo.asset.json";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset Password | OOTI Loitokitok" },
      { name: "description", content: "Choose a new password for your Oldoinyo Oibor Training Institute portal account." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Reset your OOTI portal password" },
      { property: "og:description", content: "Choose a new password for your OOTI portal account." },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // The reset link signs the user in with a recovery session; wait for it before allowing a change.
    supabase.auth.getSession().then(({ data }) => setReady(!!data.session));
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    if (password !== String(form.get("confirm") ?? "")) {
      toast.error("Passwords do not match.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password updated. You are signed in.");
    void navigate({ to: "/portal", replace: true });
  };

  return (
    <section className="section-y">
      <div className="container-page max-w-md">
        <div className="text-center">
          <img src={logo.url} alt="OOTI logo" className="mx-auto h-16 w-16 object-contain" />
          <h1 className="mt-4 font-display text-2xl font-bold">Choose a new password</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {ready ? "Enter and confirm your new password below." : "Checking your reset link…"}
          </p>
        </div>
        <form onSubmit={submit} className="mt-8 grid gap-5 rounded-xl border border-border bg-card p-8 shadow-card">
          <div className="grid gap-2">
            <Label htmlFor="new-password">New password</Label>
            <Input id="new-password" name="password" type="password" minLength={8} required disabled={!ready} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirm-password">Confirm password</Label>
            <Input id="confirm-password" name="confirm" type="password" minLength={8} required disabled={!ready} />
          </div>
          <Button type="submit" variant="gold" disabled={busy || !ready}>
            {busy ? "Please wait…" : "Update password"}
          </Button>
          {!ready ? (
            <p className="text-center text-xs text-muted-foreground">
              If this message stays, request a new link from the login page — reset links expire after a short time.
            </p>
          ) : null}
        </form>
      </div>
    </section>
  );
}

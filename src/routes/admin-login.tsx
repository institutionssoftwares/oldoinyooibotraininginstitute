import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { fetchRoles } from "@/hooks/use-permissions";
import { derivePermissions } from "@/lib/admin/resources";
import { SITE_URL } from "@/lib/site";
import logo from "@/assets/ooti-logo.asset.json";

export const Route = createFileRoute("/admin-login")({
  head: () => ({
    meta: [
      { title: "Admin Login | OOTI Admin Portal" },
      { name: "description", content: "Secure sign-in for Oldoinyo Oibor Training Institute website administrators." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "OOTI Admin Portal Login" },
      { property: "og:description", content: "Administrator sign-in for the OOTI content management system." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const signIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: String(form.get("email") ?? "").trim(),
      password: String(form.get("password") ?? ""),
    });
    if (error || !data.user) {
      setBusy(false);
      toast.error(error && /invalid login/i.test(error.message) ? "Incorrect email or password." : error?.message ?? "Sign-in failed");
      return;
    }
    const perms = derivePermissions(await fetchRoles(data.user.id));
    setBusy(false);
    if (!perms.portalStaff) {
      await supabase.auth.signOut();
      toast.error("This account is not an administrator. Use the Student Portal login instead.");
      return;
    }
    void navigate({ to: "/admin", replace: true });
  };

  const forgot = async (formEl: HTMLFormElement) => {
    const email = String(new FormData(formEl).get("email") ?? "").trim();
    if (!email) { toast.error("Enter your email first."); return; }
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${SITE_URL}/reset-password` });
    setBusy(false);
    if (error) toast.error(error.message);
    else toast.success("Password reset link sent. Check your email.");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center text-navy-foreground">
          <img src={logo.url} alt="OOTI logo" className="mx-auto size-16 rounded-full bg-background object-contain" />
          <h1 className="mt-4 flex items-center justify-center gap-2 font-display text-2xl font-bold">
            <ShieldCheck className="size-6" /> OOTI Admin Portal
          </h1>
          <p className="mt-1 text-sm opacity-80">Authorised administrators only</p>
        </div>
        <form onSubmit={signIn} className="mt-8 grid gap-5 rounded-xl bg-card p-8 shadow-lift">
          <div className="grid gap-2">
            <Label htmlFor="admin-email">Admin email</Label>
            <Input id="admin-email" name="email" type="email" required autoComplete="username" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="admin-password">Password</Label>
            <Input id="admin-password" name="password" type="password" required autoComplete="current-password" />
          </div>
          <Button type="submit" variant="gold" disabled={busy}>{busy ? "Please wait…" : "Sign in to Admin"}</Button>
          <button type="button" className="text-sm text-primary hover:underline" disabled={busy} onClick={(e) => void forgot(e.currentTarget.form!)}>
            Forgot password?
          </button>
          <a href="/" className="text-center text-xs text-muted-foreground hover:underline">← Back to website</a>
        </form>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/ooti-logo.asset.json";
import { SITE_URL } from "@/lib/site";

function safeRedirect(value: unknown): string | undefined {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//")
    ? value
    : undefined;
}

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => {
    const r = safeRedirect(search["redirect"]);
    return r ? { redirect: r } : {};
  },
  head: () => ({
    meta: [
      { title: "Portal Login | OOTI Loitokitok" },
      {
        name: "description",
        content:
          "Sign in to the Oldoinyo Oibor Training Institute portal for students, trainers and staff.",
      },
      { property: "og:title", content: "OOTI Portal Login" },
      { property: "og:description", content: "Sign in to the OOTI student and staff portal." },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: redirect ?? "/portal", replace: true });
    });
  }, [navigate, redirect]);

  const signIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: String(form.get("email") ?? "").trim(),
      password: String(form.get("password") ?? ""),
    });
    setBusy(false);
    if (error) {
      toast.error(
        /invalid login credentials/i.test(error.message)
          ? "Incorrect email or password."
          : error.message,
      );
      return;
    }
    toast.success("Signed in");
    navigate({ to: redirect ?? "/portal", replace: true });
  };

  const signUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: String(form.get("email") ?? "").trim(),
      password: String(form.get("password") ?? ""),
      options: {
        emailRedirectTo: `${SITE_URL}/portal`,
        data: { full_name: String(form.get("full_name") ?? "").trim() },
      },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Account created. Check your email to confirm it.");
  };

  return (
    <section className="section-y">
      <div className="container-page max-w-md">
        <div className="text-center">
          <img src={logo.url} alt="OOTI logo" className="mx-auto h-16 w-16 object-contain" />
          <h1 className="mt-4 font-display text-2xl font-bold">OOTI Portal</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            For students, trainers and staff of Oldoinyo Oibor Training Institute.
          </p>
        </div>

        <Tabs defaultValue="signin" className="mt-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign in</TabsTrigger>
            <TabsTrigger value="signup">Create account</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <form
              onSubmit={signIn}
              className="grid gap-5 rounded-xl border border-border bg-card p-8 shadow-card"
            >
              <div className="grid gap-2">
                <Label htmlFor="signin-email">Email</Label>
                <Input id="signin-email" name="email" type="email" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="signin-password">Password</Label>
                <Input id="signin-password" name="password" type="password" required />
              </div>
              <Button type="submit" variant="gold" disabled={busy}>
                {busy ? "Please wait…" : "Sign in"}
              </Button>
              <button
                type="button"
                disabled={busy}
                className="text-center text-sm text-primary hover:underline"
                onClick={async (e) => {
                  const email = String(new FormData(e.currentTarget.form!).get("email") ?? "").trim();
                  if (!email) {
                    toast.error("Enter your email first, then click “Forgot password”.");
                    return;
                  }
                  setBusy(true);
                  const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${SITE_URL}/reset-password`,
                  });
                  setBusy(false);
                  if (error) toast.error(error.message);
                  else toast.success("Password reset link sent. Check your email.");
                }}
              >
                Forgot password?
              </button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form
              onSubmit={signUp}
              className="grid gap-5 rounded-xl border border-border bg-card p-8 shadow-card"
            >
              <div className="grid gap-2">
                <Label htmlFor="signup-name">Full name</Label>
                <Input id="signup-name" name="full_name" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input id="signup-email" name="email" type="email" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  name="password"
                  type="password"
                  minLength={8}
                  required
                />
              </div>
              <Button type="submit" variant="gold" disabled={busy}>
                {busy ? "Please wait…" : "Create account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Applying to join OOTI?{" "}
          <Link to="/apply" className="font-medium text-primary hover:underline">
            Use the application form
          </Link>
        </p>
      </div>
    </section>
  );
}

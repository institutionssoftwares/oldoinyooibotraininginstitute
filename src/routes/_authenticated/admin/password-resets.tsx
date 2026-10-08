import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listResetRequests, resolveResetRequest } from "@/lib/password-reset.functions";

export const Route = createFileRoute("/_authenticated/admin/password-resets")({
  head: () => ({ meta: [{ title: "Password reset requests | OOTI Admin" }, { name: "robots", content: "noindex" }] }),
  component: PasswordResets,
});

function PasswordResets() {
  const qc = useQueryClient();
  const list = useServerFn(listResetRequests);
  const resolve = useServerFn(resolveResetRequest);
  const [pw, setPw] = useState<Record<string, string>>({});
  const q = useQuery({ queryKey: ["admin", "password-resets"], queryFn: () => list() });

  const m = useMutation({
    mutationFn: (v: { id: string; action: "set_password" | "reject"; password?: string }) => resolve({ data: v }),
    onSuccess: (_d, v) => {
      toast.success(v.action === "set_password" ? "Password updated. Give the new password to the account owner." : "Request rejected.");
      qc.invalidateQueries({ queryKey: ["admin", "password-resets"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-primary">Password reset requests</h1>
        <p className="text-sm text-muted-foreground">Set a new password, then give it to the account owner (e.g. by phone).</p>
      </div>
      {q.isLoading && <p>Loading…</p>}
      {q.error && <p className="text-destructive">{(q.error as Error).message}</p>}
      {q.data?.length === 0 && <p className="text-muted-foreground">No requests yet.</p>}
      <div className="grid gap-3">
        {q.data?.map((r) => (
          <div key={r.id} className="rounded-lg border border-border bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold">{r.full_name} <span className="text-xs uppercase text-muted-foreground">· {r.account_type}</span></p>
                <p className="text-sm">{r.email}{r.phone ? ` · ${r.phone}` : ""}</p>
                {r.note && <p className="text-sm text-muted-foreground">{r.note}</p>}
                <p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</p>
              </div>
              <span className="rounded bg-muted px-2 py-1 text-xs font-medium capitalize">{r.status}</span>
            </div>
            {r.status === "pending" && (
              <div className="mt-3 flex flex-wrap gap-2">
                <Input
                  placeholder="New password (8+ characters)"
                  className="max-w-xs"
                  value={pw[r.id] ?? ""}
                  onChange={(e) => setPw((p) => ({ ...p, [r.id]: e.target.value }))}
                />
                <Button
                  variant="gold"
                  disabled={m.isPending || (pw[r.id] ?? "").length < 8}
                  onClick={() => m.mutate({ id: r.id, action: "set_password", password: pw[r.id] ?? "" })}
                >
                  Set password
                </Button>
                <Button variant="outline" disabled={m.isPending} onClick={() => m.mutate({ id: r.id, action: "reject" })}>
                  Reject
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

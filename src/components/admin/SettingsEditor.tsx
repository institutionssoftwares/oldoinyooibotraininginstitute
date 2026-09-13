import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { ADMIN_ROLES } from "@/lib/admin/resources";

type Setting = { key: string; value: unknown };
type RoleRow = { id: string; user_id: string; role: string };

/** Site settings (key/value) plus staff role assignment. Admin-only via RLS. */
export function SettingsEditor() {
  const qc = useQueryClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const settings = useQuery({
    queryKey: ["admin", "site_settings"],
    queryFn: async () => {
      const { data, error } = await db.from("site_settings").select("*").order("key");
      if (error) throw new Error(error.message);
      return (data ?? []) as Setting[];
    },
  });
  const roles = useQuery({
    queryKey: ["admin", "user_roles"],
    queryFn: async () => {
      const { data, error } = await db.from("user_roles").select("id, user_id, role").order("created_at");
      if (error) throw new Error(error.message);
      return (data ?? []) as RoleRow[];
    },
  });

  const saveSetting = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { error } = await db.from("site_settings").upsert({ key, value, updated_at: new Date().toISOString() });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Setting saved");
      void qc.invalidateQueries({ queryKey: ["admin", "site_settings"] });
    },
    onError: (e) => toast.error(e.message),
  });

  const addRole = useMutation({
    mutationFn: async ({ user_id, role }: { user_id: string; role: string }) => {
      const { error } = await db.from("user_roles").insert({ user_id, role });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Role assigned");
      void qc.invalidateQueries({ queryKey: ["admin", "user_roles"] });
    },
    onError: (e) => toast.error(e.message),
  });
  const removeRole = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db.from("user_roles").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Role removed");
      void qc.invalidateQueries({ queryKey: ["admin", "user_roles"] });
    },
    onError: (e) => toast.error(e.message),
  });

  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState("staff");

  const stringValue = (v: unknown) => (typeof v === "string" ? v : JSON.stringify(v ?? ""));

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="mb-1 font-display text-base font-semibold">Site settings</h2>
        <p className="mb-4 text-sm text-muted-foreground">Key/value settings used across the website.</p>
        <div className="flex flex-col gap-3">
          {settings.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (
            settings.data?.map((s) => <SettingRow key={s.key} setting={s} onSave={(value) => saveSetting.mutate({ key: s.key, value })} />) ?? null
          )}
          <div className="mt-2 flex flex-wrap items-end gap-2 border-t pt-4">
            <div className="flex flex-col gap-1.5">
              <Label>New setting key</Label>
              <Input value={newKey} onChange={(e) => setNewKey(e.target.value)} placeholder="e.g. intake_banner" />
            </div>
            <div className="flex min-w-56 flex-1 flex-col gap-1.5">
              <Label>Value</Label>
              <Input value={newValue} onChange={(e) => setNewValue(e.target.value)} />
            </div>
            <Button
              variant="navy"
              disabled={!newKey.trim()}
              onClick={() => {
                saveSetting.mutate({ key: newKey.trim(), value: newValue });
                setNewKey("");
                setNewValue("");
              }}
            >
              <Plus className="size-4" /> Add
            </Button>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="mb-1 font-display text-base font-semibold">Staff roles</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Roles control what each account can do in this portal. Paste the person's user ID (found on their account) and pick a role.
        </p>
        {roles.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left">
                  <th className="px-3 py-2 font-medium text-muted-foreground">User ID</th>
                  <th className="px-3 py-2 font-medium text-muted-foreground">Role</th>
                  <th className="w-12 px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {roles.data?.map((r) => (
                  <tr key={r.id} className="border-b last:border-0">
                    <td className="px-3 py-2 font-mono text-xs">{r.user_id}</td>
                    <td className="px-3 py-2 capitalize">{r.role.replace(/_/g, " ")}</td>
                    <td className="px-3 py-2">
                      <Button size="icon" variant="ghost" className="size-7 text-destructive" aria-label="Remove role" onClick={() => removeRole.mutate(r.id)}>
                        <Trash2 className="size-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-4 flex flex-wrap items-end gap-2">
          <div className="flex min-w-64 flex-1 flex-col gap-1.5">
            <Label>User ID</Label>
            <Input value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="w-52">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ADMIN_ROLES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label} — {r.help}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="navy" disabled={!userId.trim()} onClick={() => addRole.mutate({ user_id: userId.trim(), role })}>
            <Plus className="size-4" /> Assign role
          </Button>
        </div>
      </section>
    </div>
  );
}

function SettingRow({ setting, onSave }: { setting: Setting; onSave: (value: string) => void }) {
  const [value, setValue] = useState(typeof setting.value === "string" ? setting.value : JSON.stringify(setting.value ?? ""));
  return (
    <div className="flex flex-wrap items-center gap-2">
      <code className="w-48 shrink-0 rounded bg-muted px-2 py-1.5 text-xs">{setting.key}</code>
      <Input className="min-w-56 flex-1" value={value} onChange={(e) => setValue(e.target.value)} />
      <Button size="sm" variant="outline" onClick={() => onSave(value)}>
        Save
      </Button>
    </div>
  );
}

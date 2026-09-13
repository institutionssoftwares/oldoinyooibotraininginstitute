import { createFileRoute } from "@tanstack/react-router";

import { SettingsEditor } from "@/components/admin/SettingsEditor";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: () => (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">Settings &amp; roles</h1>
        <p className="mt-1 text-sm text-muted-foreground">Site-wide settings and who can access this portal.</p>
      </div>
      <SettingsEditor />
    </div>
  ),
});

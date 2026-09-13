import { createFileRoute } from "@tanstack/react-router";

import { HomepageEditor } from "@/components/admin/HomepageEditor";

export const Route = createFileRoute("/_authenticated/admin/homepage")({
  component: () => (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">Homepage sections</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Edit the text, images and buttons shown on the homepage. Turn a section off to hide it.
        </p>
      </div>
      <HomepageEditor />
    </div>
  ),
});

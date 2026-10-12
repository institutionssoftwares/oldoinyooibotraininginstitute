import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { usePermissions } from "@/hooks/use-permissions";

function useUserId() {
  const [id, setId] = useState<string | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setId(data.user?.id ?? null));
  }, []);
  return id;
}

function Inner({ userId, imageId }: { userId: string; imageId: string }) {
  const perms = usePermissions(userId);
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  if (!perms.data?.content) return null;

  const remove = async () => {
    if (!confirm("Delete this photo from the gallery?")) return;
    setBusy(true);
    const { error } = await supabase.from("gallery_images").delete().eq("id", imageId);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Photo deleted");
    qc.invalidateQueries();
  };

  return (
    <button
      type="button"
      onClick={remove}
      disabled={busy}
      className="absolute right-2 top-2 z-10 inline-flex items-center gap-1 rounded-md bg-destructive px-2 py-1 text-xs font-medium text-destructive-foreground shadow disabled:opacity-60"
      aria-label="Delete photo"
    >
      <Trash2 className="size-3.5" /> Delete
    </button>
  );
}

export function AdminDeletePhotoButton({ imageId }: { imageId: string }) {
  const userId = useUserId();
  if (!userId) return null;
  return <Inner userId={userId} imageId={imageId} />;
}

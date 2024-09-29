"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";

import { UserButton } from "@/features/auth/components/UserButton";
import { useGetWorkspaces } from "@/features/workspaces/api/useGetWorkspaces";
import { useCreateWorkspaceModal } from "@/features/workspaces/store/useCreateWorkspaceModal";

export default function Home() {
  const router = useRouter();

  const [open, setOpen] = useCreateWorkspaceModal();
  const { data, isLoading } = useGetWorkspaces();

  const workspaceId = useMemo(() => data?.[0]?._id, [data]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (workspaceId) {
      router.replace(`/workspace/${workspaceId}`);
    } else if (!open) {
      setOpen(true);
    }
  }, [workspaceId, isLoading, open, setOpen, router]);

  return (
    <main className="h-full flex flex-col items-center justify-center gap-4 bg-background">
      <Loader aria-hidden className="size-6 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground" role="status">
        {isLoading ? "Loading your workspaces" : "Create a workspace to get started"}
      </p>
      <UserButton />
    </main>
  );
}

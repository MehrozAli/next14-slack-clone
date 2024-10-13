"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Loader, TriangleAlert } from "lucide-react";

import { useWorkspaceId } from "@/hooks/useWorkspaceId";
import { useCreateChannelModal } from "@/features/channels/store/useCreateChannelModal";
import { useGetWorkspace } from "@/features/workspaces/api/useGetWorkspace";
import { useGetChannels } from "@/features/channels/api/useGetChannels";
import { useCurrentMember } from "@/features/members/api/useCurrentMember";

const WorkspacePage = () => {
  const router = useRouter();

  const [open, setOpen] = useCreateChannelModal();
  const workspaceId = useWorkspaceId();
  const { data: member, isLoading: isMemberLoading } = useCurrentMember({
    workspaceId,
  });
  const { data: workspace, isLoading: isWorkspaceLoading } = useGetWorkspace({
    id: workspaceId,
  });
  const { data: channels, isLoading: areChannelsLoading } = useGetChannels({
    workspaceId,
  });

  const channelId = useMemo(() => channels?.[0]?._id, [channels]);
  const isAdmin = useMemo(() => member?.role === "admin", [member?.role]);

  useEffect(() => {
    if (
      isWorkspaceLoading ||
      areChannelsLoading ||
      isMemberLoading ||
      !member ||
      !workspace
    ) {
      return;
    }

    if (channelId) {
      router.push(`/workspace/${workspaceId}/channel/${channelId}`);
    } else if (!open && isAdmin) {
      setOpen(true);
    }
  }, [
    isAdmin,
    isWorkspaceLoading,
    areChannelsLoading,
    isMemberLoading,
    member,
    workspace,
    open,
    router,
    setOpen,
    workspaceId,
  ]);

  if (isWorkspaceLoading || areChannelsLoading || isMemberLoading) {
    return (
      <div className="h-full flex-1 flex items-center justify-center flex-col gap-2">
        <Loader className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!workspace || !member) {
    return (
      <div className="h-full flex-1 flex items-center justify-center flex-col gap-2">
        <TriangleAlert className="size-6 text-muted-foreground" />

        <p className="text-muted-foreground text-sm">Workspace not found</p>
      </div>
    );
  }

  return (
    <div className="h-full flex-1 flex items-center justify-center flex-col gap-2">
      <TriangleAlert className="size-6 text-muted-foreground" />

      <p className="text-muted-foreground text-sm">No channels found.</p>
    </div>
  );
};

export default WorkspacePage;

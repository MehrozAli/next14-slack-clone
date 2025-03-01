import {
  AlertTriangle,
  HashIcon,
  Loader,
  MessageSquareText,
  SendHorizonal,
} from "lucide-react";

import { useCurrentMember } from "@/features/members/api/useCurrentMember";
import { useGetWorkspace } from "@/features/workspaces/api/useGetWorkspace";
import { useGetChannels } from "@/features/channels/api/useGetChannels";
import { useGetMembers } from "@/features/members/api/useGetMembers";
import { useCreateChannelModal } from "@/features/channels/store/useCreateChannelModal";
import { useWorkspaceId } from "@/hooks/useWorkspaceId";
import { useChannelId } from "@/hooks/useChannelId";
import { useMemberId } from "@/hooks/useMemberId";

import { WorkspaceHeader } from "./WorkspaceHeader";
import { SidebarItem } from "./SidebarItem";
import { WorkspaceSection } from "./WorkspaceSection";
import { UserItem } from "./UserItem";

export const WorkspaceSidebar = () => {
  const [_open, setOpen] = useCreateChannelModal();
  const memberId = useMemberId();
  const workspaceId = useWorkspaceId();
  const channelId = useChannelId();
  const { data: member, isLoading: isMemberLoading } = useCurrentMember({
    workspaceId,
  });
  const { data: workspace, isLoading: isWorkspaceLoading } = useGetWorkspace({
    id: workspaceId,
  });
  const { data: channels } = useGetChannels({
    workspaceId,
  });
  const { data: members } = useGetMembers({
    workspaceId,
  });

  if (isMemberLoading || isWorkspaceLoading) {
    return (
      <div className="flex flex-col bg-[#5e2c5f] h-full items-center justify-center">
        <Loader className="size-5 animate-spin text-white" />
      </div>
    );
  }

  if (!member || !workspace) {
    return (
      <div className="flex flex-col gap-y-2 bg-[#5e2c5f] h-full items-center justify-center">
        <AlertTriangle className="size-5 text-white" />

        <span className="text-white text-sm">Workspace not found</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#5e2c5f]">
      <WorkspaceHeader
        workspace={workspace}
        isAdmin={member.role === "admin"}
      />

      <div className="flex flex-col px-2 mt-3">
        <SidebarItem label="Threads" id="threads" icon={MessageSquareText} />
        <SidebarItem label="Drafts & Sent" id="drafts" icon={SendHorizonal} />
      </div>

      <WorkspaceSection
        label="Channels"
        hint="New channel"
        onNew={member.role === "admin" ? () => setOpen(true) : undefined}
      >
        {channels?.map((item) => (
          <SidebarItem
            key={item._id}
            label={item.name}
            icon={HashIcon}
            id={item._id}
            variant={channelId === item._id ? "active" : "default"}
          />
        ))}
      </WorkspaceSection>

      <WorkspaceSection label="Direct Messages" hint="New direct message">
        {members?.map((item) => (
          <UserItem
            key={item._id}
            id={item._id}
            label={item.user.name}
            image={item.user.image}
            variant={memberId === item._id ? "active" : "default"}
          />
        ))}
      </WorkspaceSection>
    </div>
  );
};

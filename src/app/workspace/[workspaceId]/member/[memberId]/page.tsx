"use client";

import { useEffect, useState } from "react";
import { AlertTriangleIcon, Loader } from "lucide-react";
import { toast } from "sonner";

import { useCreateOrGetConversation } from "@/features/conversations/api/useCreateOrGetConversation";
import { useMemberId } from "@/hooks/useMemberId";
import { useWorkspaceId } from "@/hooks/useWorkspaceId";

import { Conversation } from "./_components/Conversation";
import { Id } from "../../../../../../convex/_generated/dataModel";

const MemberPage = () => {
  const workspaceId = useWorkspaceId();
  const memberId = useMemberId();
  const { mutate, isPending } = useCreateOrGetConversation();

  const [conversationId, setConversationId] =
    useState<Id<"conversations"> | null>(null);

  useEffect(() => {
    mutate(
      { workspaceId, memberId },
      {
        onSuccess: (data) => setConversationId(data),
        onError: () => toast.error("Error fetching conversation"),
      }
    );
  }, [mutate, workspaceId, memberId]);

  if (isPending) {
    return (
      <div className="h-full flex-1 flex items-center justify-center flex-col gap-2">
        <Loader className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!conversationId) {
    return (
      <div className="h-full flex flex-col gap-y-2 items-center justify-center gap-2">
        <AlertTriangleIcon className="size-6 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          Conversation not found
        </span>
      </div>
    );
  }

  return <Conversation id={conversationId} />;
};

export default MemberPage;

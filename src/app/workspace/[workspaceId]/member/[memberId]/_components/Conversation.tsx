import { Loader } from "lucide-react";

import { useMemberId } from "@/hooks/useMemberId";
import { useGetMember } from "@/features/members/api/useGetMember";
import { useGetMessages } from "@/features/messages/api/useGetMessages";

import { Header } from "./Header";
import { ChatInput } from "./ChatInput";

import { Id } from "../../../../../../../convex/_generated/dataModel";
import { MessageList } from "../../../channel/[channelId]/_components/MessageList";

interface ConversationProps {
  id: Id<"conversations">;
}

export const Conversation = ({ id }: ConversationProps) => {
  const memberId = useMemberId();
  const { data: member, isLoading: isMemberLoading } = useGetMember({
    id: memberId,
  });
  const { results, status, loadMore } = useGetMessages({
    conversationId: id,
  });

  if (isMemberLoading || status == "LoadingFirstPage") {
    return (
      <div className="h-full flex-1 flex items-center justify-center flex-col gap-2">
        <Loader className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Header
        onClick={() => {}}
        memberName={member?.user.name}
        memberImage={member?.user.image}
      />

      <MessageList
        data={results}
        variant="conversation"
        memberImage={member?.user.image}
        memberName={member?.user.name}
        loadMore={loadMore}
        isLoadingMore={status === "LoadingMore"}
        canLoadMore={status === "CanLoadMore"}
      />

      <ChatInput
        placeholder={`Message ${member?.user.name}`}
        conversationId={id}
      />
    </div>
  );
};

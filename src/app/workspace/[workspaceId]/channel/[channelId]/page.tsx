"use client";

import { Loader, TriangleAlert } from "lucide-react";

import { useGetChannel } from "@/features/channels/api/useGetChannel";
import { useChannelId } from "@/hooks/useChannelId";
import { useGetMessages } from "@/features/messages/api/useGetMessages";

import { Header } from "./_components/Header";
import { ChatInput } from "./_components/ChatInput";
import { MessageList } from "./_components/MessageList";

const ChannelPage = () => {
  const channelId = useChannelId();
  const { data: channel, isLoading: isChannelLoading } = useGetChannel({
    id: channelId,
  });
  const { results, status, loadMore } = useGetMessages({ channelId });

  if (isChannelLoading || status === "LoadingFirstPage") {
    return (
      <div className="h-full flex-1 flex items-center justify-center">
        <Loader className="animate-spin text-muted-foreground size-5" />
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="h-full flex-1 flex flex-col gap-y-2 items-center justify-center">
        <TriangleAlert className="text-muted-foreground size-6" />

        <span className="text-muted-foreground text-sm">Channel not found</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Header title={channel.name} />
      <MessageList
        channelName={channel.name}
        channelCreationTime={channel._creationTime}
        data={results}
        loadMore={loadMore}
        isLoadingMore={status === "LoadingMore"}
        canLoadMore={status === "CanLoadMore"}
      />
      <ChatInput placeholder={`Message #${channel.name}`} />
    </div>
  );
};

export default ChannelPage;

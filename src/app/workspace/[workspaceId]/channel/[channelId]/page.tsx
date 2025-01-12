"use client";

import { Loader, TriangleAlert } from "lucide-react";

import { useGetChannel } from "@/features/channels/api/useGetChannel";
import { useChannelId } from "@/hooks/useChannelId";

import { Header } from "./_components/Header";
import { ChatInput } from "./_components/ChatInput";
import { useGetMessages } from "@/features/messages/api/useGetMessages";

const ChannelPage = () => {
  const channelId = useChannelId();
  const { data: channel, isLoading: isChannelLoading } = useGetChannel({
    id: channelId,
  });
  const { results } = useGetMessages({ channelId })

  console.log('results :>> ', results);

  if (isChannelLoading) {
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
      <div className="flex-1" />
      <ChatInput placeholder={`Message #${channel.name}`} />
    </div>
  );
};

export default ChannelPage;

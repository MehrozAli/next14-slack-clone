import React, { useRef, useState } from "react";
import dynamic from "next/dynamic";
import Quill from "quill";

import { useCreateMessages } from "@/features/messages/api/useCreateMessage";
import { useWorkspaceId } from "@/hooks/useWorkspaceId";
import { useChannelId } from "@/hooks/useChannelId";
import { toast } from "sonner";

const Editor = dynamic(() => import("@/components/Editor"), { ssr: false });

interface ChatInputProps {
  placeholder: string;
}

export const ChatInput = ({ placeholder }: ChatInputProps) => {
  const editorRef = useRef<Quill | null>(null);
  const workspaceId = useWorkspaceId();
  const channelId = useChannelId();
  const { mutate: createMessage } = useCreateMessages();

  const [editorKey, setEditorKey] = useState(0);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async ({
    body,
    image,
  }: {
    body: string;
    image: File | null;
  }) => {
    try {
      setIsPending(true);
      await createMessage(
        {
          body,
          workspaceId,
          channelId,
        },
        { throwError: true }
      );

      setEditorKey((prev) => prev + 1);
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="px-5 w-full">
      <Editor
        key={editorKey}
        placeholder={placeholder}
        onSubmit={handleSubmit}
        disabled={isPending}
        innerRef={editorRef}
      />
    </div>
  );
};

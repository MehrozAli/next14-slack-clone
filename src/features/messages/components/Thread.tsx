import { useRef, useState } from "react";
import { AlertTriangle, Loader, XIcon } from "lucide-react";
import dynamic from "next/dynamic";
import Quill from "quill";
import { toast } from "sonner";

import { Message } from "@/app/workspace/[workspaceId]/channel/[channelId]/_components/Message";
import { Button } from "@/components/ui/button";
import { useCurrentMember } from "@/features/members/api/useCurrentMember";
import { useGenerateUploadUrl } from "@/features/upload/api/useGenerateUploadUrl";
import { useWorkspaceId } from "@/hooks/useWorkspaceId";
import { useChannelId } from "@/hooks/useChannelId";

import { useGetMessageById } from "../api/useGetMessageById";
import { useCreateMessages } from "../api/useCreateMessage";

import { Id } from "../../../../convex/_generated/dataModel";

const Editor = dynamic(() => import("@/components/Editor"), { ssr: false });

interface ThreadProps {
  messageId: Id<"messages">;
  onClose: () => void;
}

type CreateMessageValues = {
  channelId: Id<"channels">;
  workspaceId: Id<"workspaces">;
  body: string;
  image?: Id<"_storage">;
  parentMessageId: Id<"messages">;
};

export const Thread = ({ messageId, onClose }: ThreadProps) => {
  const editorRef = useRef<Quill | null>(null);
  const channelId = useChannelId();
  const workspaceId = useWorkspaceId();
  const { data: message, isLoading: isMessageLoading } = useGetMessageById({
    id: messageId,
  });
  const { data: currentMember } = useCurrentMember({ workspaceId });
  const { mutate: generateUploadUrl } = useGenerateUploadUrl();
  const { mutate: createMessage } = useCreateMessages();

  const [editingId, setEditingId] = useState<Id<"messages"> | null>(null);
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
      editorRef.current?.enable(false);

      const values: CreateMessageValues = {
        channelId,
        workspaceId,
        body,
        image: undefined,
        parentMessageId: messageId,
      };

      if (image) {
        const url = await generateUploadUrl({}, { throwError: true });

        if (!url) {
          throw new Error("Url not found");
        }

        const result = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": image.type },
          body: image,
        });

        if (!result.ok) {
          throw new Error("Failed to upload image");
        }

        const { storageId } = await result.json();

        values.image = storageId;
      }

      await createMessage(values, { throwError: true });

      setEditorKey((prev) => prev + 1);
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setIsPending(false);
      editorRef.current?.enable(true);
    }
  };

  if (isMessageLoading) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center h-[49px] px-4 border-b">
          <p className="text-lg font-bold">Thread</p>
          <Button onClick={onClose} size="iconSm" variant="ghost">
            <XIcon className="size-5 stroke-1.5" />
          </Button>
        </div>

        <div className="flex flex-col gap-y-2 h-full items-center justify-center">
          <Loader className="size-5 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!message) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center h-[49px] px-4 border-b">
          <p className="text-lg font-bold">Thread</p>
          <Button onClick={onClose} size="iconSm" variant="ghost">
            <XIcon className="size-5 stroke-1.5" />
          </Button>
        </div>

        <div className="flex flex-col gap-y-2 h-full items-center justify-center">
          <AlertTriangle className="size-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Message not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center h-[49px] px-4 border-b">
        <p className="text-lg font-bold">Thread</p>
        <Button onClick={onClose} size="iconSm" variant="ghost">
          <XIcon className="size-5 stroke-1.5" />
        </Button>
      </div>

      <div>
        <Message
          memberId={message.memberId}
          authorImage={message.user.image}
          authorName={message.user.name}
          isAuthor={message.memberId === currentMember?._id}
          body={message.body}
          image={message.image}
          id={message._id}
          createdAt={message._creationTime}
          updatedAt={message.updatedAt}
          reactions={message.reactions}
          isEditing={editingId === message._id}
          setEditingId={setEditingId}
          hideThreadButton
        />
      </div>

      <div className="px-4">
        <Editor
          key={editorKey}
          onSubmit={handleSubmit}
          disabled={isPending}
          innerRef={editorRef}
          placeholder="Reply"
        />
      </div>
    </div>
  );
};

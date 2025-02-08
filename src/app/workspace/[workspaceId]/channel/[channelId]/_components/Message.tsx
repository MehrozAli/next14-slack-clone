import dynamic from "next/dynamic";
import { format, isToday, isYesterday } from "date-fns";
import { toast } from "sonner";

import { Hint } from "@/components/Hint";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Toolbar } from "@/components/Toolbar";
import { useUpdateMessages } from "@/features/messages/api/useUpdateMessage";
import { cn } from "@/lib/utils";
import { useDeleteMessage } from "@/features/messages/api/useDeleteMessage";
import { useConfirm } from "@/hooks/useConfirm";
import { useToggleReaction } from "@/features/reactions/api/useToggleReaction";

import { Thumbnail } from "./Thumbnail";
import { Reactions } from "./Reactions";

import { Doc, Id } from "../../../../../../../convex/_generated/dataModel";

const Renderer = dynamic(() => import("@/components/Renderer"), { ssr: false });
const Editor = dynamic(() => import("@/components/Editor"), { ssr: false });

interface MessageProps {
  id: Id<"messages">;
  memberId: Id<"members">;
  authorImage?: string;
  authorName?: string;
  isAuthor: boolean;
  reactions: Array<
    Omit<Doc<"reactions">, "memberId"> & {
      count: number;
      memberIds: Id<"members">[];
    }
  >;
  body: Doc<"messages">["body"];
  image?: string | null;
  createdAt: Doc<"messages">["_creationTime"];
  updatedAt: Doc<"messages">["updatedAt"];
  isEditing: boolean;
  isCompact?: boolean;
  setEditingId: (id: Id<"messages"> | null) => void;
  hideThreadButton?: boolean;
  threadCount?: number;
  threadImage?: string;
  threadTimestamp?: number;
}

const formatFullTime = (date: Date) =>
  `${isToday(date) ? "Today" : isYesterday(date) ? "Yesterday" : format(date, "dd/MM/yyyy")} at ${format(date, "hh:mm a")}`;

export const Message = (props: MessageProps) => {
  const {
    id,
    isAuthor,
    memberId,
    authorImage,
    authorName = "Member",
    body,
    createdAt,
    isEditing,
    reactions,
    setEditingId,
    updatedAt,
    hideThreadButton,
    image,
    isCompact,
    threadCount,
    threadImage,
    threadTimestamp,
  } = props;
  const [ConfirmDialog, confirm] = useConfirm(
    "Are you sure you want to delete this message? This cannot be undone.",
    "Delete message"
  );

  const { mutate: updateMessage, isPending: isUpdatingMessage } =
    useUpdateMessages();
  const { mutate: removeMessage, isPending: isRemovingMessage } =
    useDeleteMessage();
  const { mutate: toggleReaction, isPending: isTogglingReaction } =
    useToggleReaction();
  const isPending = isUpdatingMessage;

  const handleUpdate = ({ body }: { body: string }) => {
    updateMessage(
      { id, body },
      {
        onSuccess: () => {
          toast.success("Message updated successfully");
          setEditingId(null);
        },
        onError: () => toast.error("Failed to update message"),
      }
    );
  };

  const handleDelete = async () => {
    const ok = await confirm();

    if (!ok) {
      return;
    }

    removeMessage(
      { id },
      {
        onSuccess: () => {
          toast.success("Message deleted successfully");

          // TODO: Close thread if it's open
        },
        onError: () => toast.error("Failed to delete message"),
      }
    );
  };

  const handleReaction = (value: string) => {
    toggleReaction(
      {
        messageId: id,
        value,
      },
      {
        onError: (err) => toast.error(err.message),
      }
    );
  };

  if (isCompact) {
    return (
      <>
        <ConfirmDialog />
        <div
          className={cn(
            "flex flex-col gap-2 p-1.5 px-5 hover:bg-gray-100/60 group relative",
            {
              "bg-[#f2c77443] hover:bg-[#f2c77443]": isEditing,
              "bg-rose-500/50 transform transition-all scale-y-0 origin-bottom duration-200":
                isRemovingMessage,
            }
          )}
        >
          <div className="flex items-start gap-2">
            <Hint label={formatFullTime(new Date(createdAt))}>
              <button className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 w-[40px] leading-[22px] text-center hover:underline">
                {format(new Date(createdAt), "hh:mm")}
              </button>
            </Hint>

            {isEditing ? (
              <div className="w-full h-full">
                <Editor
                  onSubmit={handleUpdate}
                  disabled={isPending}
                  defaultValue={JSON.parse(body)}
                  onCancel={() => setEditingId(null)}
                  variant="update"
                />
              </div>
            ) : (
              <div className="flex flex-col w-full">
                <Renderer value={body} />
                <Thumbnail url={image} />

                {updatedAt ? (
                  <span className="text-xs text-muted-foreground">
                    (edited)
                  </span>
                ) : null}
                <Reactions data={reactions} onChange={handleReaction} />
              </div>
            )}
          </div>

          {!isEditing ? (
            <Toolbar
              isAuthor={isAuthor}
              isPending={isPending}
              handleEdit={() => setEditingId(id)}
              handleThread={() => {}}
              handleDelete={handleDelete}
              handleReaction={handleReaction}
              hideThreadButton={hideThreadButton}
            />
          ) : null}
        </div>
      </>
    );
  }

  return (
    <>
      <ConfirmDialog />
      <div
        className={cn(
          "flex flex-col gap-2 p-1.5 px-5 hover:bg-gray-100/60 group relative",
          {
            "bg-[#f2c77443] hover:bg-[#f2c77443]": isEditing,
            "bg-rose-500/50 transform transition-all scale-y-0 origin-bottom duration-200":
              isRemovingMessage,
          }
        )}
      >
        <div className="flex items-start gap-2">
          <button>
            <Avatar>
              <AvatarImage src={authorImage} />

              <AvatarFallback>
                {authorName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </button>

          {isEditing ? (
            <div className="w-full h-full">
              <Editor
                onSubmit={handleUpdate}
                disabled={isPending}
                defaultValue={JSON.parse(body)}
                onCancel={() => setEditingId(null)}
                variant="update"
              />
            </div>
          ) : (
            <div className="flex flex-col w-full overflow-hidden">
              <div className="text-sm">
                <button
                  className="font-bold text-primary hover:underline"
                  onClick={() => {}}
                >
                  {authorName}
                </button>

                <span>&nbsp;&nbsp;</span>
                <Hint label={formatFullTime(new Date(createdAt))}>
                  <button className="text-xs text-muted-foreground hover:underline">
                    {format(new Date(createdAt), "h:mm a")}
                  </button>
                </Hint>
              </div>

              <Renderer value={body} />
              <Thumbnail url={image} />

              {updatedAt ? (
                <span className="text-xs text-muted-foreground">(edited)</span>
              ) : null}
              <Reactions data={reactions} onChange={handleReaction} />
            </div>
          )}
        </div>

        {!isEditing ? (
          <Toolbar
            isAuthor={isAuthor}
            isPending={isPending}
            handleEdit={() => setEditingId(id)}
            handleThread={() => {}}
            handleDelete={handleDelete}
            handleReaction={handleReaction}
            hideThreadButton={hideThreadButton}
          />
        ) : null}
      </div>
    </>
  );
};

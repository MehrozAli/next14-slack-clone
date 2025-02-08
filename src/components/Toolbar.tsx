import { MessageSquare, Pencil, Smile, Trash } from "lucide-react";

import { Button } from "./ui/button";
import { Hint } from "./Hint";
import { EmojiPopover } from "./EmojiPopover";

interface ToolbarProps {
  handleEdit: () => void;
  handleThread: () => void;
  handleDelete: () => void;
  handleReaction: (value: string) => void;
  isAuthor: boolean;
  isPending: boolean;
  hideThreadButton?: boolean;
}

export const Toolbar = ({
  handleDelete,
  handleEdit,
  handleThread,
  isAuthor,
  isPending,
  hideThreadButton,
  handleReaction,
}: ToolbarProps) => {
  return (
    <div className="absolute top-0 right-5">
      <div className="group-hover:opacity-100 opacity-0 transition-opacity border bg-white rounded-md shadow-sm">
        <EmojiPopover
          hint="Add reaction"
          onEmojiSelect={(emoji) => handleReaction(emoji.native)}
        >
          <Button variant="ghost" size="iconSm" disabled={isPending}>
            <Smile className="size-4" />
          </Button>
        </EmojiPopover>

        {!hideThreadButton ? (
          <Hint label="Reply in thread">
            <Button
              onClick={handleThread}
              variant="ghost"
              size="iconSm"
              disabled={isPending}
            >
              <MessageSquare className="size-4" />
            </Button>
          </Hint>
        ) : null}

        {isAuthor ? (
          <>
            <Hint label="Edit message">
              <Button
                onClick={handleEdit}
                variant="ghost"
                size="iconSm"
                disabled={isPending}
              >
                <Pencil className="size-4" />
              </Button>
            </Hint>

            <Hint label="Delete message">
              <Button
                onClick={handleDelete}
                variant="ghost"
                size="iconSm"
                disabled={isPending}
              >
                <Trash className="size-4" />
              </Button>
            </Hint>
          </>
        ) : null}
      </div>
    </div>
  );
};

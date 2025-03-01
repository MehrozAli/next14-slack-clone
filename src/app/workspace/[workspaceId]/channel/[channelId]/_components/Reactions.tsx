import { MdOutlineAddReaction } from "react-icons/md";

import { useWorkspaceId } from "@/hooks/useWorkspaceId";
import { useCurrentMember } from "@/features/members/api/useCurrentMember";
import { cn } from "@/lib/utils";

import { Doc, Id } from "../../../../../../../convex/_generated/dataModel";
import { Hint } from "@/components/Hint";
import { EmojiPopover } from "@/components/EmojiPopover";

interface ReactionsProps {
  data: Array<
    Omit<Doc<"reactions">, "memberId"> & {
      count: number;
      memberIds: Id<"members">[];
    }
  >;
  onChange: (value: string) => void;
}

export const Reactions = ({ data, onChange }: ReactionsProps) => {
  const workspaceId = useWorkspaceId();
  const { data: currentMember } = useCurrentMember({ workspaceId });

  if (!data.length || !currentMember?._id) {
    return null;
  }

  return (
    <div className="flex items-center mt-1 mb-1 gap-1">
      {data.map((reaction) => (
        <Hint
          label={`${reaction.count} ${reaction.count === 1 ? "person" : "people"} reacted with ${reaction.value}`}
          key={reaction._id}
        >
          <button
            onClick={() => onChange(reaction.value)}
            className={cn(
              "h-6 px-2 rounded-full bg-slate-200/70 border border-transparent text-slate-800 flex items-center gap-x-1",
              {
                "bg-blue-100/70 border-blue-500 text-white":
                  reaction.memberIds.includes(currentMember._id),
              }
            )}
          >
            {reaction.value}{" "}
            <span
              className={cn("text-xs font-semibold text-muted-foreground", {
                "text-blue-500": reaction.memberIds.includes(currentMember._id),
              })}
            >
              {reaction.count}
            </span>
          </button>
        </Hint>
      ))}

      <EmojiPopover
        hint="Add reaction"
        onEmojiSelect={(emoji) => onChange(emoji)}
      >
        <button className="h-6 px-3 rounded-full bg-slate-200/70 border border-transparent hover:border-slate-500 text-slate-800 flex items-center gap-x-1">
          <MdOutlineAddReaction className="size-4" />
        </button>
      </EmojiPopover>
    </div>
  );
};

import { getAuthUserId } from "@convex-dev/auth/server";

import { QueryCtx } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

export const requireUserId = async (ctx: QueryCtx) => {
  const userId = await getAuthUserId(ctx);

  if (!userId) {
    throw new Error("Unauthorized");
  }

  return userId;
};

export const getMember = (
  ctx: QueryCtx,
  workspaceId: Id<"workspaces">,
  userId: Id<"users">
) =>
  ctx.db
    .query("members")
    .withIndex("by_workspace_user_id", (q) =>
      q.eq("workspaceId", workspaceId).eq("userId", userId)
    )
    .unique();

export const isParticipant = (
  conversation: Doc<"conversations">,
  member: Doc<"members">
) =>
  conversation.memberOneId === member._id ||
  conversation.memberTwoId === member._id;

// A message is visible to every member of its workspace, except direct
// messages, which only the two participants may see.
export const canReadMessage = async (
  ctx: QueryCtx,
  message: Doc<"messages">,
  member: Doc<"members"> | null
) => {
  if (!member || member.workspaceId !== message.workspaceId) {
    return false;
  }

  if (!message.conversationId) {
    return true;
  }

  const conversation = await ctx.db.get(message.conversationId);

  return !!conversation && isParticipant(conversation, member);
};

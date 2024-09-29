import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

import { mutation } from "./_generated/server";
import { canReadMessage, getMember } from "./access";
import { reactionValue } from "./limits";

export const toggle = mutation({
  args: { messageId: v.id("messages"), value: v.string() },
  handler: async (ctx, args) => {
    const value = reactionValue(args.value);
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const message = await ctx.db.get(args.messageId);

    if (!message) {
      throw new Error("Message not found");
    }

    const member = await getMember(ctx, message.workspaceId, userId);

    if (!member || !(await canReadMessage(ctx, message, member))) {
      throw new Error("Unauthorized");
    }

    const existingMessageReaction = await ctx.db
      .query("reactions")
      .filter((q) =>
        q.and(
          q.eq(q.field("messageId"), args.messageId),
          q.eq(q.field("memberId"), member._id),
          q.eq(q.field("value"), value)
        )
      )
      .first();

    if (existingMessageReaction) {
      await ctx.db.delete(existingMessageReaction._id);

      return existingMessageReaction._id;
    } else {
      const newReactionId = await ctx.db.insert("reactions", {
        value,
        memberId: member._id,
        messageId: message._id,
        workspaceId: message.workspaceId,
      });

      return newReactionId;
    }
  },
});

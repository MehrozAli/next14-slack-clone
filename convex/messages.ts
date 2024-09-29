import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { paginationOptsValidator } from "convex/server";

import { mutation, MutationCtx, query, QueryCtx } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import {
  canReadMessage,
  getMember,
  isParticipant,
  requireUserId,
} from "./access";
import { imageProblem } from "./limits";

// Removes messages together with their reactions and attached images, so
// deleting a message never leaves orphaned rows or files behind.
export const deleteMessages = async (
  ctx: MutationCtx,
  messages: Doc<"messages">[]
) => {
  for (const message of messages) {
    const reactions = await ctx.db
      .query("reactions")
      .withIndex("by_message_id", (q) => q.eq("messageId", message._id))
      .collect();

    for (const reaction of reactions) {
      await ctx.db.delete(reaction._id);
    }

    if (message.image) {
      await ctx.storage.delete(message.image);
    }

    await ctx.db.delete(message._id);
  }
};

const populateUser = (ctx: QueryCtx, userId: Id<"users">) => ctx.db.get(userId);
const populateMember = (ctx: QueryCtx, memberId: Id<"members">) =>
  ctx.db.get(memberId);

const populateReactions = (ctx: QueryCtx, messageId: Id<"messages">) =>
  ctx.db
    .query("reactions")
    .withIndex("by_message_id", (q) => q.eq("messageId", messageId))
    .collect();

const populateThread = async (ctx: QueryCtx, messageId: Id<"messages">) => {
  const messages = await ctx.db
    .query("messages")
    .withIndex("by_parent_message_id", (q) =>
      q.eq("parentMessageId", messageId)
    )
    .collect();

  if (messages.length === 0) {
    return {
      count: 0,
      image: undefined,
      timestamp: 0,
      name: "",
    };
  }

  const lastMessage = messages[messages.length - 1];
  const lastMessageMember = await populateMember(ctx, lastMessage.memberId);

  if (!lastMessageMember) {
    return {
      count: 0,
      image: undefined,
      timestamp: 0,
      name: "",
    };
  }

  const lastMessageUser = await populateUser(ctx, lastMessageMember.userId);

  return {
    count: messages.length,
    image: lastMessageUser?.image,
    timestamp: lastMessage._creationTime,
    name: lastMessageUser?.name,
  };
};

export const get = query({
  args: {
    channelId: v.optional(v.id("channels")),
    conversationId: v.optional(v.id("conversations")),
    parentMessageId: v.optional(v.id("messages")),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);

    let _conversationId = args.conversationId;
    let workspaceId: Id<"workspaces">;

    if (args.parentMessageId) {
      const parentMessage = await ctx.db.get(args.parentMessageId);

      if (!parentMessage) {
        throw new Error("Parent message not found");
      }

      const member = await getMember(ctx, parentMessage.workspaceId, userId);

      if (!(await canReadMessage(ctx, parentMessage, member))) {
        throw new Error("Unauthorized");
      }

      if (!args.conversationId && !args.channelId) {
        _conversationId = parentMessage.conversationId;
      }
      workspaceId = parentMessage.workspaceId;
    } else if (args.channelId) {
      const channel = await ctx.db.get(args.channelId);

      if (!channel) {
        throw new Error("Channel not found");
      }
      workspaceId = channel.workspaceId;
    } else if (args.conversationId) {
      const conversation = await ctx.db.get(args.conversationId);

      if (!conversation) {
        throw new Error("Conversation not found");
      }

      const member = await getMember(ctx, conversation.workspaceId, userId);

      if (!member || !isParticipant(conversation, member)) {
        throw new Error("Unauthorized");
      }
      workspaceId = conversation.workspaceId;
    } else {
      throw new Error("A channel, conversation or parent message is required");
    }

    if (!(await getMember(ctx, workspaceId, userId))) {
      throw new Error("Unauthorized");
    }

    const results = await ctx.db
      .query("messages")
      .withIndex("by_channel_id_parent_message_id_conversation_id", (q) =>
        q
          .eq("channelId", args.channelId)
          .eq("parentMessageId", args.parentMessageId)
          .eq("conversationId", _conversationId)
      )
      .order("desc")
      .paginate(args.paginationOpts);

    return {
      ...results,
      page: (
        await Promise.all(
          results.page.map(async (message) => {
            const member = await populateMember(ctx, message.memberId);
            const user = member ? await populateUser(ctx, member.userId) : null;

            if (!member || !user) {
              return null;
            }

            const reactions = await populateReactions(ctx, message._id);
            const thread = await populateThread(ctx, message._id);
            const image = message.image
              ? await ctx.storage.getUrl(message.image)
              : undefined;
            const reactionsWithCounts = reactions.map((reaction) => {
              return {
                ...reaction,
                count: reactions.filter((r) => r.value === reaction.value)
                  .length,
              };
            });
            const dedupedReactions = reactionsWithCounts.reduce(
              (acc, reaction) => {
                const existingReaction = acc.find(
                  (r) => r.value === reaction.value
                );

                if (existingReaction) {
                  existingReaction.memberIds = Array.from(
                    new Set([...existingReaction.memberIds, reaction.memberId])
                  );
                } else {
                  acc.push({ ...reaction, memberIds: [reaction.memberId] });
                }

                return acc;
              },
              [] as (Doc<"reactions"> & {
                count: number;
                memberIds: Id<"members">[];
              })[]
            );

            const reactionsWithoutMemberId = dedupedReactions.map(
              ({ memberId, ...rest }) => rest
            );

            return {
              ...message,
              image,
              member,
              user,
              reactions: reactionsWithoutMemberId,
              threadCount: thread.count,
              threadImage: thread.image,
              threadName: thread.name,
              threadTimestamp: thread.timestamp,
            };
          })
        )
      ).filter(
        (message): message is NonNullable<typeof message> => message !== null
      ),
    };
  },
});

export const create = mutation({
  args: {
    body: v.string(),
    image: v.optional(v.id("_storage")),
    workspaceId: v.id("workspaces"),
    channelId: v.optional(v.id("channels")),
    parentMessageId: v.optional(v.id("messages")),
    conversationId: v.optional(v.id("conversations")),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const member = await getMember(ctx, args.workspaceId, userId);

    if (!member) {
      throw new Error("Unauthorized");
    }

    if (!args.channelId && !args.conversationId && !args.parentMessageId) {
      throw new Error("A channel, conversation or parent message is required");
    }

    if (args.channelId) {
      const channel = await ctx.db.get(args.channelId);

      if (!channel || channel.workspaceId !== args.workspaceId) {
        throw new Error("Channel not found");
      }
    }

    let _conversationId = args.conversationId;

    if (args.parentMessageId) {
      const parentMessage = await ctx.db.get(args.parentMessageId);

      if (
        !parentMessage ||
        !(await canReadMessage(ctx, parentMessage, member)) ||
        (args.channelId && parentMessage.channelId !== args.channelId)
      ) {
        throw new Error("Parent message not found");
      }

      // Thread replies inside a direct message only carry the parent id,
      // so the conversation is taken from the parent.
      if (!args.conversationId && !args.channelId) {
        _conversationId = parentMessage.conversationId;
      }
    }

    if (_conversationId) {
      const conversation = await ctx.db.get(_conversationId);

      if (
        !conversation ||
        conversation.workspaceId !== args.workspaceId ||
        !isParticipant(conversation, member)
      ) {
        throw new Error("Conversation not found");
      }
    }

    if (args.image) {
      const file = await ctx.db.system.get(args.image);

      if (!file) {
        throw new Error("Image not found");
      }

      const problem = imageProblem(file);

      if (problem) {
        throw new Error(problem);
      }
    }

    const messageId = await ctx.db.insert("messages", {
      memberId: member._id,
      body: args.body,
      image: args.image,
      channelId: args.channelId,
      workspaceId: args.workspaceId,
      parentMessageId: args.parentMessageId,
      conversationId: _conversationId,
    });

    return messageId;
  },
});

export const update = mutation({
  args: { id: v.id("messages"), body: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const message = await ctx.db.get(args.id);

    if (!message) {
      throw new Error("Message not found");
    }

    const member = await getMember(ctx, message.workspaceId, userId);

    if (!member || message.memberId !== member._id) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.id, { body: args.body, updatedAt: Date.now() });

    return args.id;
  },
});

export const remove = mutation({
  args: { id: v.id("messages") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const message = await ctx.db.get(args.id);

    if (!message) {
      throw new Error("Message not found");
    }

    const member = await getMember(ctx, message.workspaceId, userId);

    if (!member || message.memberId !== member._id) {
      throw new Error("Unauthorized");
    }

    await deleteMessages(ctx, [message]);
    return args.id;
  },
});

export const getById = query({
  args: { id: v.id("messages") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      return null;
    }

    const message = await ctx.db.get(args.id);

    if (!message) {
      return null;
    }

    const currentMember = await getMember(ctx, message.workspaceId, userId);

    if (!(await canReadMessage(ctx, message, currentMember))) {
      return null;
    }

    const member = await populateMember(ctx, message.memberId);

    if (!member) {
      return null;
    }

    const user = await populateUser(ctx, member.userId);

    if (!user) {
      return null;
    }

    const reactions = await populateReactions(ctx, message._id);
    const reactionsWithCounts = reactions.map((reaction) => {
      return {
        ...reaction,
        count: reactions.filter((r) => r.value === reaction.value).length,
      };
    });
    const dedupedReactions = reactionsWithCounts.reduce(
      (acc, reaction) => {
        const existingReaction = acc.find((r) => r.value === reaction.value);

        if (existingReaction) {
          existingReaction.memberIds = Array.from(
            new Set([...existingReaction.memberIds, reaction.memberId])
          );
        } else {
          acc.push({ ...reaction, memberIds: [reaction.memberId] });
        }

        return acc;
      },
      [] as (Doc<"reactions"> & {
        count: number;
        memberIds: Id<"members">[];
      })[]
    );
    const reactionsWithoutMemberId = dedupedReactions.map(
      ({ memberId, ...rest }) => rest
    );

    return {
      ...message,
      image: message.image
        ? await ctx.storage.getUrl(message.image)
        : undefined,
      user,
      member,
      reactions: reactionsWithoutMemberId,
    };
  },
});

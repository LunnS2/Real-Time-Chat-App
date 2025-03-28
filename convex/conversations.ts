import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createConversation = mutation({
  args: {
    participants: v.array(v.id("users")),
    isGroup: v.boolean(),
    name: v.optional(v.string()),
    groupName: v.optional(v.string()),
    groupImage: v.optional(v.string()), // Changed from v.id("_storage")
    admin: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthorized");

    // For 1:1 chats, check if conversation already exists
    if (!args.isGroup && args.participants.length === 2) {
      const existing = await ctx.db
        .query("conversations")
        .filter(q =>
          q.and(
            q.eq(q.field("isGroup"), false),
            q.or(
              q.eq(q.field("participants"), args.participants),
              q.eq(q.field("participants"), [...args.participants].reverse())
            )
          )
        )
        .first();
      if (existing) return existing._id;
    }

    return await ctx.db.insert("conversations", {
      participants: args.participants,
      isGroup: args.isGroup,
      name: args.name,
      groupName: args.groupName,
      groupImage: args.groupImage, // Now expects a string URL
      admin: args.admin,
    });
  }
});

export const getMyConversations = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", q => 
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();
    if (!user) throw new ConvexError("User not found");

    // Correct way to filter conversations where user is a participant
    const conversations = await ctx.db
      .query("conversations")
      .filter(q => 
        q.and(
          q.eq(q.field("participants"), [user._id]), // Fixed array filter
          q.neq(q.field("isGroup"), true)
        )
      )
      .collect();

    // For group conversations
    const groupConversations = await ctx.db
      .query("conversations")
      .filter(q => 
        q.and(
          q.eq(q.field("participants"), [user._id]), // Fixed array filter
          q.eq(q.field("isGroup"), true)
        )
      )
      .collect();

    const allConversations = [...conversations, ...groupConversations];

    return await Promise.all(
      allConversations.map(async conv => {
        if (!conv.isGroup && conv.participants.length === 2) {
          const otherUserId = conv.participants.find(id => id !== user._id);
          const otherUser = otherUserId ? await ctx.db.get(otherUserId) : null;
          return { ...conv, otherUser };
        }
        return conv;
      })
    );
  }
});

export const kickUser = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthorized");

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) throw new ConvexError("Conversation not found");

    if (conversation.admin !== identity.subject) {
      throw new ConvexError("Only admin can kick users");
    }

    await ctx.db.patch(args.conversationId, {
      participants: conversation.participants.filter(id => id !== args.userId)
    });
  }
});

export const exitConversation = mutation({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", q => 
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();
    if (!user) throw new ConvexError("User not found");

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) throw new ConvexError("Conversation not found");

    if (!conversation.participants.includes(user._id)) {
      throw new ConvexError("User not in conversation");
    }

    const updatedParticipants = conversation.participants.filter(id => id !== user._id);
    
    if (updatedParticipants.length === 0) {
      await ctx.db.delete(args.conversationId);
      return { deleted: true };
    }

    await ctx.db.patch(args.conversationId, {
      participants: updatedParticipants,
      admin: conversation.admin === user._id ? updatedParticipants[0] : conversation.admin
    });

    return { deleted: false };
  }
});

export const generateUploadUrl = mutation(async ctx => {
  return await ctx.storage.generateUploadUrl();
});
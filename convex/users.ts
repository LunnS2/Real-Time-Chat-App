import { ConvexError, v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";

export const createUser = internalMutation({
  args: {
    tokenIdentifier: v.string(),
    email: v.string(),
    name: v.string(),
    image: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("users", {
      tokenIdentifier: args.tokenIdentifier,
      email: args.email,
      name: args.name,
      image: args.image,
      isOnline: true,
    });
  }
});

export const updateUser = internalMutation({
  args: { tokenIdentifier: v.string(), image: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", q => q.eq("tokenIdentifier", args.tokenIdentifier))
      .unique();
    if (!user) throw new ConvexError("User not found");
    await ctx.db.patch(user._id, { image: args.image });
  }
});

export const setUserOnline = internalMutation({
  args: { tokenIdentifier: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", q => q.eq("tokenIdentifier", args.tokenIdentifier))
      .unique();
    if (!user) throw new ConvexError("User not found");
    await ctx.db.patch(user._id, { isOnline: true });
  }
});

export const setUserOffline = internalMutation({
  args: { tokenIdentifier: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", q => q.eq("tokenIdentifier", args.tokenIdentifier))
      .unique();
    if (!user) throw new ConvexError("User not found");
    await ctx.db.patch(user._id, { isOnline: false });
  }
});

export const getUsers = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthorized");
    return await ctx.db.query("users").collect();
  }
});

export const getMe = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthorized");
    return await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", q => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
  }
});

export const getGroupMembers = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthorized");

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) throw new ConvexError("Conversation not found");

    return await Promise.all(
      conversation.participants.map(id => ctx.db.get(id))
    ).then(users => users.filter(Boolean));
  }
});
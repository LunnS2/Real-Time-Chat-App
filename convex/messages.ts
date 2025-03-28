import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";

export const sendTextMessage = mutation({
  args: {
    sender: v.id("users"), // Changed from v.string()
    content: v.string(),
    conversation: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", q => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) throw new ConvexError("User not found");
    if (user._id !== args.sender) throw new ConvexError("Unauthorized sender");

    const conversation = await ctx.db
      .query("conversations")
      .filter(q => q.eq(q.field("_id"), args.conversation))
      .first();

    if (!conversation) throw new ConvexError("Conversation not found");
    if (!conversation.participants.includes(user._id)) {
      throw new ConvexError("Not a participant");
    }

    const messageId = await ctx.db.insert("messages", {
      sender: args.sender,
      content: args.content,
      conversation: args.conversation,
      messageType: "text",
    });

    // Update conversation last message
    await ctx.db.patch(args.conversation, {
      lastMessage: {
        _id: messageId,
        content: args.content,
        sender: args.sender,
        messageType: "text",
        conversation: args.conversation,
        _creationTime: Date.now(),
      }
    });

    return messageId;
  },
});

export const getMessages = query({
  args: { conversation: v.id("conversations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthorized");

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", q => q.eq("conversation", args.conversation))
      .collect();

    const userProfileCache = new Map();

    return await Promise.all(
      messages.map(async message => {
        if (userProfileCache.has(message.sender)) {
          return { ...message, sender: userProfileCache.get(message.sender) };
        }
        const sender = await ctx.db.get(message.sender);
        if (!sender) throw new ConvexError("Sender not found");
        userProfileCache.set(message.sender, sender);
        return { ...message, sender };
      })
    );
  },
});

export const sendImage = mutation({
  args: {
    imgId: v.id("_storage"),
    sender: v.id("users"),
    conversation: v.id("conversations")
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthorized");

    const content = (await ctx.storage.getUrl(args.imgId)) as string;
    const messageId = await ctx.db.insert("messages", {
      content,
      sender: args.sender,
      messageType: "image",
      conversation: args.conversation,
    });

    await ctx.db.patch(args.conversation, {
      lastMessage: {
        _id: messageId,
        content,
        sender: args.sender,
        messageType: "image",
        conversation: args.conversation,
        _creationTime: Date.now(),
      }
    });

    return messageId;
  }
});

export const sendVideo = mutation({
  args: {
    videoId: v.id("_storage"),
    sender: v.id("users"),
    conversation: v.id("conversations")
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthorized");

    const content = (await ctx.storage.getUrl(args.videoId)) as string;
    const messageId = await ctx.db.insert("messages", {
      content,
      sender: args.sender,
      messageType: "video",
      conversation: args.conversation,
    });

    await ctx.db.patch(args.conversation, {
      lastMessage: {
        _id: messageId,
        content,
        sender: args.sender,
        messageType: "video",
        conversation: args.conversation,
        _creationTime: Date.now(),
      }
    });

    return messageId;
  }
});
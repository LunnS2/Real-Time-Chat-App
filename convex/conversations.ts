import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createConversation = mutation({
	args: {
		participants: v.array(v.id("users")),
		isGroup: v.boolean(),
		name: v.optional(v.string()),
		groupName: v.optional(v.string()),
		groupImage: v.optional(v.id("_storage")),
		admin: v.optional(v.id("users")),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) throw new ConvexError("Unauthorized");

		const existingConversation = await ctx.db
			.query("conversations")
			.filter((q) =>
				q.or(
					q.eq(q.field("participants"), args.participants),
					q.eq(q.field("participants"), args.participants.reverse())
				)
			)
			.first();

		if (existingConversation) {
			return existingConversation._id;
		}

		let groupImage;

		if (args.groupImage) {
			groupImage = (await ctx.storage.getUrl(args.groupImage)) as string;
		}

		const conversationId = await ctx.db.insert("conversations", {
			participants: args.participants,
			isGroup: args.isGroup,
			name: args.name,
			groupName: args.groupName,
			groupImage,
			admin: args.admin,
		});

		return conversationId;
	},
});

export const getMyConversations = query({
  args: {},
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      // Return empty array instead of throwing an error
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) {
      // Return empty array instead of throwing an error
      return [];
    }

    const conversations = await ctx.db.query("conversations").collect();

    const myConversations = conversations.filter((conversation) => {
      return conversation.participants.includes(user._id);
    });

    const conversationsWithDetails = await Promise.all(
      myConversations.map(async (conversation) => {
        let userDetails = {};

        if (!conversation.isGroup) {
          const otherUserId = conversation.participants.find((id) => id !== user._id);
          const userProfile = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("_id"), otherUserId))
            .take(1);

          userDetails = userProfile[0] || {};
        }

        const lastMessage = await ctx.db
          .query("messages")
          .filter((q) => q.eq(q.field("conversation"), conversation._id))
          .order("desc")
          .take(1);

        return {
          ...userDetails,
          ...conversation,
          lastMessage: lastMessage[0] || null,
        };
      })
    );

    return conversationsWithDetails;
  },
});

export const kickUser = mutation({
	args: {
		conversationId: v.id("conversations"),
		userId: v.id("users"),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) throw new ConvexError("Unauthorized");

		const conversation = await ctx.db
			.query("conversations")
			.filter((q) => q.eq(q.field("_id"), args.conversationId))
			.unique();

		if (!conversation) throw new ConvexError("Conversation not found");

		await ctx.db.patch(args.conversationId, {
			participants: conversation.participants.filter((id) => id !== args.userId),
		});
	},
});

export const generateUploadUrl = mutation(async (ctx) => {
	return await ctx.storage.generateUploadUrl();
});

export const exitConversation = mutation({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    // Get user identity to determine who is trying to exit
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthorized");

    // Find the current user in the users collection
    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) throw new ConvexError("User not found");

    // Fetch the conversation to verify that the user is a participant
    const conversation = await ctx.db
      .query("conversations")
      .filter((q) => q.eq(q.field("_id"), args.conversationId))
      .unique();

    if (!conversation) throw new ConvexError("Conversation not found");

    // Check if the user is a participant
    if (!conversation.participants.includes(user._id)) {
      throw new ConvexError("User is not part of this conversation");
    }

    // Remove the user from the list of participants
    const updatedParticipants = conversation.participants.filter((id) => id !== user._id);

    // If the conversation is now empty, you can optionally delete it
    if (updatedParticipants.length === 0 && !conversation.isGroup) {
      await ctx.db.delete(args.conversationId);
      return { message: "Conversation deleted as no participants remain." };
    }

    // Otherwise, update the conversation with the remaining participants
    await ctx.db.patch(args.conversationId, {
      participants: updatedParticipants,
    });

    return { message: "You have exited the conversation." };
  },
});
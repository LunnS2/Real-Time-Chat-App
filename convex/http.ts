import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

http.route({
	path: "/clerk",
	method: "POST",
	handler: httpAction(async (ctx, req) => {
		const payloadString = await req.text();
		const headerPayload = req.headers;

		try {
			const result = await ctx.runAction(internal.clerk.fulfill, {
				payload: payloadString,
				headers: {
					"svix-id": headerPayload.get("svix-id")!,
					"svix-signature": headerPayload.get("svix-signature")!,
					"svix-timestamp": headerPayload.get("svix-timestamp")!,
				},
			});

			switch (result.type) {
				case "user.created":
					console.log("Creating user:", result.data.id);
					await ctx.runMutation(internal.users.createUser, {
						tokenIdentifier: `${process.env.CLERK_APP_DOMAIN}|${result.data.id}`,
						email: result.data.email_addresses[0]?.email_address,
						name: `${result.data.first_name ?? "Guest"} ${result.data.last_name ?? ""}`,
						image: result.data.image_url,
					});
					break;
				case "user.updated":
					await ctx.runMutation(internal.users.updateUser, {
						tokenIdentifier: `${process.env.CLERK_APP_DOMAIN}|${result.data.id}`,
						image: result.data.image_url,
					});
					break;
				case "session.created":
					console.log("Session created for user:", result.data.user_id);
					try {
						await ctx.runMutation(internal.users.setUserOnline, {
							tokenIdentifier: `${process.env.CLERK_APP_DOMAIN}|${result.data.user_id}`,
						});
					} catch (error) {
						console.log(`Failed to set user online: ${error}`);
						return new Response("Retry later", { status: 400 });
					}
					break;
				case "session.ended":
					console.log("Session ended for user:", result.data.user_id);
					await ctx.runMutation(internal.users.setUserOffline, {
						tokenIdentifier: `${process.env.CLERK_APP_DOMAIN}|${result.data.user_id}`,
					});
					break;
				case "session.removed":
					console.log("Session removed for user:", result.data.user_id);
					await ctx.runMutation(internal.users.setUserOffline, {
						tokenIdentifier: `${process.env.CLERK_APP_DOMAIN}|${result.data.user_id}`,
					});
					break;
				default:
					console.log("Unhandled event type:", result.type);
			}

			return new Response(null, {
				status: 200,
			});
		} catch (error) {
			console.log("Webhook Error🔥🔥", error);
			return new Response("Webhook Error", {
				status: 400,
			});
		}
	}),
});

export default http;

// https://docs.convex.dev/functions/http-actions
// Internal functions can only be called by other functions and cannot be called directly from a Convex client.
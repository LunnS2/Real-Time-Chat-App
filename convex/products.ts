import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getProducts = query({
  args: {},
  handler: async (ctx, args) => {
    const tasks = await ctx.db.query("products").collect()
    return tasks
  } 
})

export const addProducts = mutation({
  args: {
    name: v.string(),
    price: v.number(),
  },
  handler: async (ctx, args) => {
    const productId = await ctx.db.insert("products", {name: args.name, price: args.price})
    return productId
  }
})

export const deleteProducts = mutation({
  args: {
    id: v.id("products"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id)
  }
})
import { mutation } from "./_generated/server";
import { requireUserId } from "./access";

export const generateUploadUrl = mutation(async (ctx) => {
  await requireUserId(ctx);

  return await ctx.storage.generateUploadUrl();
});

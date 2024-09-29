import { expect, test } from "vitest";

import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { setup, signUp } from "./test.setup";

const body = JSON.stringify({ ops: [{ insert: "look\n" }] });

async function channelWithAuthor() {
  const t = setup();
  const alice = await signUp(t, "Alice");
  const workspaceId = await alice.as.mutation(api.workspaces.create, { name: "Design" });
  const [general] = await alice.as.query(api.channels.get, { workspaceId });
  const store = (blob: Blob) => t.run((ctx) => ctx.storage.store(blob));
  const fileExists = (id: Id<"_storage">) => t.run(async (ctx) => !!(await ctx.db.system.get(id)));
  return { t, alice, workspaceId, channelId: general._id, store, fileExists };
}

test("a PNG attachment is stored and served with the message", async () => {
  const { alice, workspaceId, channelId, store } = await channelWithAuthor();
  const image = await store(new Blob([new Uint8Array(64)], { type: "image/png" }));

  const id = await alice.as.mutation(api.messages.create, { workspaceId, channelId, body, image });

  const message = await alice.as.query(api.messages.getById, { id });
  expect(message?.image).toMatch(/^https?:\/\//);
});

test("non-image attachments are rejected", async () => {
  const { alice, workspaceId, channelId, store } = await channelWithAuthor();
  const image = await store(new Blob(["<svg onload=alert(1)>"], { type: "image/svg+xml" }));

  await expect(
    alice.as.mutation(api.messages.create, { workspaceId, channelId, body, image })
  ).rejects.toThrow(/png, jpeg, gif or webp/i);
});

test("images over 5 MB are rejected", async () => {
  const { alice, workspaceId, channelId, store } = await channelWithAuthor();
  const image = await store(new Blob([new Uint8Array(5 * 1024 * 1024 + 1)], { type: "image/jpeg" }));

  await expect(
    alice.as.mutation(api.messages.create, { workspaceId, channelId, body, image })
  ).rejects.toThrow(/5 MB/);
});

test("deleting a message removes its image and reactions", async () => {
  const { t, alice, workspaceId, channelId, store, fileExists } = await channelWithAuthor();
  const image = await store(new Blob([new Uint8Array(64)], { type: "image/webp" }));
  const id = await alice.as.mutation(api.messages.create, { workspaceId, channelId, body, image });
  await alice.as.mutation(api.reactions.toggle, { messageId: id, value: "🎉" });

  await alice.as.mutation(api.messages.remove, { id });

  expect(await fileExists(image)).toBe(false);
  const reactions = await t.run((ctx) => ctx.db.query("reactions").collect());
  expect(reactions).toHaveLength(0);
});

test("deleting a channel removes its messages' images", async () => {
  const { alice, workspaceId, store, fileExists } = await channelWithAuthor();
  const channelId = await alice.as.mutation(api.channels.create, { workspaceId, name: "photos" });
  const image = await store(new Blob([new Uint8Array(64)], { type: "image/gif" }));
  await alice.as.mutation(api.messages.create, { workspaceId, channelId, body, image });

  await alice.as.mutation(api.channels.remove, { id: channelId });

  expect(await fileExists(image)).toBe(false);
});

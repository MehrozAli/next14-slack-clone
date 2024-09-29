import { expect, test } from "vitest";

import { api } from "./_generated/api";
import { setup, signUp } from "./test.setup";

const body = (text: string) => JSON.stringify({ ops: [{ insert: `${text}\n` }] });

async function workspaceWithTwoMembers() {
  const t = setup();
  const alice = await signUp(t, "Alice");
  const bob = await signUp(t, "Bob");
  const workspaceId = await alice.as.mutation(api.workspaces.create, { name: "Design" });
  const { joinCode } = (await alice.as.query(api.workspaces.getById, { id: workspaceId }))!;
  await bob.as.mutation(api.workspaces.join, { workspaceId, joinCode });
  const [general] = await alice.as.query(api.channels.get, { workspaceId });
  return { t, alice, bob, workspaceId, channelId: general._id };
}

test("only the author can edit or delete a message", async () => {
  const { alice, bob, workspaceId, channelId } = await workspaceWithTwoMembers();
  const id = await alice.as.mutation(api.messages.create, {
    workspaceId,
    channelId,
    body: body("hello"),
  });

  await expect(
    bob.as.mutation(api.messages.update, { id, body: body("hijacked") })
  ).rejects.toThrow(/unauthorized/i);
  await expect(bob.as.mutation(api.messages.remove, { id })).rejects.toThrow(/unauthorized/i);

  await alice.as.mutation(api.messages.update, { id, body: body("hello, edited") });
  const edited = await alice.as.query(api.messages.getById, { id });
  expect(edited?.body).toBe(body("hello, edited"));
  expect(edited?.updatedAt).toBeTypeOf("number");

  await alice.as.mutation(api.messages.remove, { id });
  expect(await alice.as.query(api.messages.getById, { id })).toBeNull();
});

test("channel messages are listed newest first with thread and reaction summaries", async () => {
  const { alice, bob, workspaceId, channelId } = await workspaceWithTwoMembers();
  const first = await alice.as.mutation(api.messages.create, { workspaceId, channelId, body: body("one") });
  await alice.as.mutation(api.messages.create, { workspaceId, channelId, body: body("two") });
  await bob.as.mutation(api.messages.create, {
    workspaceId,
    channelId,
    parentMessageId: first,
    body: body("reply"),
  });
  await bob.as.mutation(api.reactions.toggle, { messageId: first, value: "👍" });
  await alice.as.mutation(api.reactions.toggle, { messageId: first, value: "👍" });

  const { page } = await bob.as.query(api.messages.get, {
    channelId,
    paginationOpts: { numItems: 10, cursor: null },
  });

  expect(page.map((m) => m.body)).toEqual([body("two"), body("one")]);
  const one = page[1];
  expect(one.threadCount).toBe(1);
  expect(one.threadName).toBe("Bob");
  expect(one.reactions).toEqual([expect.objectContaining({ value: "👍", count: 2 })]);
});

import { expect, test } from "vitest";

import { api } from "./_generated/api";
import { setup, signUp } from "./test.setup";

async function workspace() {
  const t = setup();
  const alice = await signUp(t, "Alice");
  const workspaceId = await alice.as.mutation(api.workspaces.create, { name: "  Design   Team " });
  const [general] = await alice.as.query(api.channels.get, { workspaceId });
  return { t, alice, workspaceId, channelId: general._id };
}

test("workspace names are trimmed and must be 3-80 characters", async () => {
  const { alice, workspaceId } = await workspace();

  expect((await alice.as.query(api.workspaces.getById, { id: workspaceId }))?.name).toBe("Design Team");
  await expect(alice.as.mutation(api.workspaces.create, { name: "  a " })).rejects.toThrow(/3-80/);
  await expect(
    alice.as.mutation(api.workspaces.update, { id: workspaceId, name: "x".repeat(81) })
  ).rejects.toThrow(/3-80/);
});

test("channel names are normalised on create and rename", async () => {
  const { alice, workspaceId } = await workspace();

  const id = await alice.as.mutation(api.channels.create, { workspaceId, name: " Plan  Budget " });
  expect((await alice.as.query(api.channels.getById, { id }))?.name).toBe("plan-budget");

  await alice.as.mutation(api.channels.update, { id, name: "Q3 Launch" });
  expect((await alice.as.query(api.channels.getById, { id }))?.name).toBe("q3-launch");

  await expect(alice.as.mutation(api.channels.update, { id, name: "ab" })).rejects.toThrow(/3-80/);
});

test("message bodies must be Quill deltas within the size limit", async () => {
  const { alice, workspaceId, channelId } = await workspace();

  await expect(
    alice.as.mutation(api.messages.create, { workspaceId, channelId, body: "<b>not json" })
  ).rejects.toThrow(/quill delta/i);
  await expect(
    alice.as.mutation(api.messages.create, { workspaceId, channelId, body: '{"ops":"x"}' })
  ).rejects.toThrow(/quill delta/i);
  const tooLong = JSON.stringify({ ops: [{ insert: "a".repeat(20_001) }] });
  await expect(
    alice.as.mutation(api.messages.create, { workspaceId, channelId, body: tooLong })
  ).rejects.toThrow(/too long/i);

  const id = await alice.as.mutation(api.messages.create, {
    workspaceId,
    channelId,
    body: JSON.stringify({ ops: [{ insert: "ok\n" }] }),
  });
  await expect(alice.as.mutation(api.messages.update, { id, body: "nope" })).rejects.toThrow(
    /quill delta/i
  );
});

test("reactions must be short and contain no whitespace", async () => {
  const { alice, workspaceId, channelId } = await workspace();
  const messageId = await alice.as.mutation(api.messages.create, {
    workspaceId,
    channelId,
    body: JSON.stringify({ ops: [{ insert: "ok\n" }] }),
  });

  await expect(
    alice.as.mutation(api.reactions.toggle, { messageId, value: "x".repeat(33) })
  ).rejects.toThrow(/invalid reaction/i);
  await expect(alice.as.mutation(api.reactions.toggle, { messageId, value: "" })).rejects.toThrow(
    /invalid reaction/i
  );
  await alice.as.mutation(api.reactions.toggle, { messageId, value: "👨‍👩‍👧‍👦" });
});

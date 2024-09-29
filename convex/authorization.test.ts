import { expect, test } from "vitest";

import { api } from "./_generated/api";
import { setup, signUp, TestConvex } from "./test.setup";

const body = (text: string) => JSON.stringify({ ops: [{ insert: `${text}\n` }] });

async function workspaceFor(t: TestConvex, owner: Awaited<ReturnType<typeof signUp>>, name: string) {
  const workspaceId = await owner.as.mutation(api.workspaces.create, { name });
  const workspace = (await owner.as.query(api.workspaces.getById, { id: workspaceId }))!;
  const [general] = await owner.as.query(api.channels.get, { workspaceId });
  return { workspaceId, joinCode: workspace.joinCode, channelId: general._id };
}

async function team() {
  const t = setup();
  const alice = await signUp(t, "Alice");
  const bob = await signUp(t, "Bob");
  const carol = await signUp(t, "Carol");
  const eve = await signUp(t, "Eve");
  const ws = await workspaceFor(t, alice, "Design");
  await bob.as.mutation(api.workspaces.join, { workspaceId: ws.workspaceId, joinCode: ws.joinCode });
  await carol.as.mutation(api.workspaces.join, { workspaceId: ws.workspaceId, joinCode: ws.joinCode });
  const member = async (u: typeof alice) =>
    (await u.as.query(api.members.current, { workspaceId: ws.workspaceId }))!;
  return { t, alice, bob, carol, eve, ...ws, member };
}

const firstPage = { numItems: 20, cursor: null };

test("non-members cannot read channel messages", async () => {
  const { alice, eve, workspaceId, channelId } = await team();
  const id = await alice.as.mutation(api.messages.create, { workspaceId, channelId, body: body("secret") });

  await expect(
    eve.as.query(api.messages.get, { channelId, paginationOpts: firstPage })
  ).rejects.toThrow(/unauthorized/i);
  await expect(
    eve.as.query(api.messages.get, { parentMessageId: id, paginationOpts: firstPage })
  ).rejects.toThrow(/unauthorized/i);
  expect(await eve.as.query(api.messages.getById, { id })).toBeNull();
  await expect(
    eve.as.mutation(api.reactions.toggle, { messageId: id, value: "👀" })
  ).rejects.toThrow(/unauthorized/i);
});

test("direct messages are visible only to the two participants", async () => {
  const { alice, bob, carol, workspaceId, member } = await team();
  const conversationId = await alice.as.mutation(api.conversations.createOrGet, {
    workspaceId,
    memberId: (await member(bob))._id,
  });
  const dm = await alice.as.mutation(api.messages.create, { workspaceId, conversationId, body: body("just us") });
  await bob.as.mutation(api.messages.create, { workspaceId, parentMessageId: dm, body: body("reply") });

  const bobView = await bob.as.query(api.messages.get, { conversationId, paginationOpts: firstPage });
  expect(bobView.page).toHaveLength(1);

  await expect(
    carol.as.query(api.messages.get, { conversationId, paginationOpts: firstPage })
  ).rejects.toThrow(/unauthorized/i);
  await expect(
    carol.as.query(api.messages.get, { parentMessageId: dm, paginationOpts: firstPage })
  ).rejects.toThrow(/unauthorized/i);
  expect(await carol.as.query(api.messages.getById, { id: dm })).toBeNull();
  await expect(
    carol.as.mutation(api.messages.create, { workspaceId, conversationId, body: body("hi") })
  ).rejects.toThrow(/conversation not found/i);
  await expect(
    carol.as.mutation(api.messages.create, { workspaceId, parentMessageId: dm, body: body("hi") })
  ).rejects.toThrow(/parent message not found/i);
  await expect(
    carol.as.mutation(api.reactions.toggle, { messageId: dm, value: "👀" })
  ).rejects.toThrow(/unauthorized/i);
});

test("messages cannot be posted into another workspace's channel", async () => {
  const { t, alice, eve, channelId } = await team();
  const own = await workspaceFor(t, eve, "Elsewhere");

  await expect(
    eve.as.mutation(api.messages.create, { workspaceId: own.workspaceId, channelId, body: body("x") })
  ).rejects.toThrow(/channel not found/i);
  expect(
    (await alice.as.query(api.messages.get, { channelId, paginationOpts: firstPage })).page
  ).toHaveLength(0);
});

test("a conversation can only be opened with a member of the same workspace", async () => {
  const { t, alice, eve, workspaceId } = await team();
  const own = await workspaceFor(t, eve, "Elsewhere");
  const eveMember = (await eve.as.query(api.members.current, { workspaceId: own.workspaceId }))!;

  await expect(
    alice.as.mutation(api.conversations.createOrGet, { workspaceId, memberId: eveMember._id })
  ).rejects.toThrow(/member not found/i);
});

test("member profiles are hidden from people outside the workspace", async () => {
  const { alice, eve, member } = await team();
  const aliceMember = await member(alice);

  expect(await eve.as.query(api.members.getById, { id: aliceMember._id })).toBeNull();
  expect((await alice.as.query(api.members.getById, { id: aliceMember._id }))?.user.name).toBe("Alice");
});

test("only admins remove other members, and anyone can leave", async () => {
  const { alice, bob, carol, member } = await team();
  const bobMember = await member(bob);
  const carolMember = await member(carol);

  await expect(bob.as.mutation(api.members.remove, { id: carolMember._id })).rejects.toThrow(
    /unauthorized/i
  );
  await carol.as.mutation(api.members.remove, { id: carolMember._id });
  await alice.as.mutation(api.members.remove, { id: bobMember._id });

  const remaining = await alice.as.query(api.members.get, { workspaceId: bobMember.workspaceId });
  expect(remaining.map((m) => m.user.name)).toEqual(["Alice"]);
});

test("admins cannot demote themselves and leave the workspace without an admin", async () => {
  const { alice, bob, member } = await team();
  const aliceMember = await member(alice);

  await expect(
    alice.as.mutation(api.members.update, { id: aliceMember._id, role: "member" })
  ).rejects.toThrow(/own role/i);
  await expect(
    bob.as.mutation(api.members.update, { id: aliceMember._id, role: "member" })
  ).rejects.toThrow(/unauthorized/i);
});

test("upload URLs require a signed-in user", async () => {
  const t = setup();
  await expect(t.mutation(api.upload.generateUploadUrl, {})).rejects.toThrow(/unauthorized/i);
});

import { expect, test } from "vitest";

import { api } from "./_generated/api";
import { setup, signUp } from "./test.setup";

test("creating a workspace makes the creator admin and adds a General channel", async () => {
  const t = setup();
  const alice = await signUp(t, "Alice");

  const workspaceId = await alice.as.mutation(api.workspaces.create, { name: "Design" });

  const members = await alice.as.query(api.members.get, { workspaceId });
  expect(members.map((m) => [m.user.name, m.role])).toEqual([["Alice", "admin"]]);
  const channels = await alice.as.query(api.channels.get, { workspaceId });
  expect(channels.map((c) => c.name)).toEqual(["General"]);
});

test("joining requires the current join code and works only once", async () => {
  const t = setup();
  const alice = await signUp(t, "Alice");
  const bob = await signUp(t, "Bob");
  const workspaceId = await alice.as.mutation(api.workspaces.create, { name: "Design" });
  const { joinCode } = (await alice.as.query(api.workspaces.getById, { id: workspaceId }))!;

  await expect(
    bob.as.mutation(api.workspaces.join, { workspaceId, joinCode: "zzzzzz" })
  ).rejects.toThrow(/invalid join code/i);

  await bob.as.mutation(api.workspaces.join, { workspaceId, joinCode: joinCode.toUpperCase() });
  await expect(
    bob.as.mutation(api.workspaces.join, { workspaceId, joinCode })
  ).rejects.toThrow(/already/i);
});

test("outsiders cannot read a workspace and members cannot rename it", async () => {
  const t = setup();
  const alice = await signUp(t, "Alice");
  const bob = await signUp(t, "Bob");
  const eve = await signUp(t, "Eve");
  const workspaceId = await alice.as.mutation(api.workspaces.create, { name: "Design" });
  const { joinCode } = (await alice.as.query(api.workspaces.getById, { id: workspaceId }))!;
  await bob.as.mutation(api.workspaces.join, { workspaceId, joinCode });

  expect(await eve.as.query(api.workspaces.getById, { id: workspaceId })).toBeNull();
  expect(await eve.as.query(api.channels.get, { workspaceId })).toEqual([]);
  await expect(
    bob.as.mutation(api.workspaces.update, { id: workspaceId, name: "Mine" })
  ).rejects.toThrow(/unauthorized/i);
});

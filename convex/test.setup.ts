/// <reference types="vite/client" />
import { convexTest } from "convex-test";

import schema from "./schema";
import { Id } from "./_generated/dataModel";

export const modules = import.meta.glob("./**/*.*s");

export const setup = () => convexTest(schema, modules);

export type TestConvex = ReturnType<typeof setup>;

export async function signUp(t: TestConvex, name: string) {
  const userId = await t.run((ctx) =>
    ctx.db.insert("users", { name, email: `${name.toLowerCase()}@example.test` })
  );
  return { userId, as: t.withIdentity({ subject: `${userId}|session-${name}` }) };
}

export async function joinWorkspace(
  t: TestConvex,
  workspaceId: Id<"workspaces">,
  userId: Id<"users">,
  role: "admin" | "member" = "member"
) {
  return t.run((ctx) => ctx.db.insert("members", { userId, workspaceId, role }));
}

import GitHub from "@auth/core/providers/github";
import Google from "@auth/core/providers/google";
import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";

import { DataModel } from "./_generated/dataModel";

const CustomPassword = Password<DataModel>({
  profile(params) {
    const email = params.email as string;

    if (params.flow !== "signUp") {
      return { email };
    }

    const name = String(params.name ?? "").trim();

    if (name.length === 0 || name.length > 80) {
      throw new Error("Name must be 1-80 characters");
    }

    return { email, name };
  },
});

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [GitHub, Google, CustomPassword],
});

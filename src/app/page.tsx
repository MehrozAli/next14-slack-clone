"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export default function Home() {
  const router = useRouter();

  const { signOut } = useAuthActions();

  return (
    <div className="">
      Logged In!
      <Button onClick={() => signOut().finally(() => router.refresh())}>
        Signout
      </Button>
    </div>
  );
}

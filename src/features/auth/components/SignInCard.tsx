"use client";

import { Dispatch, FormEvent, SetStateAction, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { useAuthActions } from "@convex-dev/auth/react";
import { TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SignInFlow } from "../types";

interface SignInCardProps {
  setState: Dispatch<SetStateAction<SignInFlow>>;
}

export const SignInCard = ({ setState }: SignInCardProps) => {
  const router = useRouter();
  const { signIn } = useAuthActions();

  const [pending, setPending] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleProviderSignin = (value: "google" | "github") => {
    setPending(true);

    signIn(value).finally(() => setPending(false));
  };

  const onPasswordSignIn = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { email, password } = formData;

    setPending(true);
    signIn("password", { email, password, flow: "signIn" })
      .catch(() => setError("Invalid email or password"))
      .finally(() => {
        setPending(false);

        router.refresh();
      });
  };

  return (
    <Card className="w-full p-6 sm:p-8 shadow-sm">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="font-display text-2xl">Sign in to Backchannel</CardTitle>

        <CardDescription>Use your email and password, or continue with Google or GitHub.</CardDescription>
      </CardHeader>

      {!!error ? (
        <div
          role="alert"
          className="bg-destructive/15 p-3 flex items-center gap-x-2 rounded-md text-sm text-destructive mb-6"
        >
          <TriangleAlert aria-hidden className="size-4" />

          <p>{error}</p>
        </div>
      ) : null}

      <CardContent className="space-y-5 px-0 pb-0">
        <form onSubmit={onPasswordSignIn} className="space-y-3">
          <div className="space-y-1">
            <label htmlFor="auth-email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="auth-email"
              disabled={pending}
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              placeholder="you@example.com"
              autoComplete="email"
              type="email"
              required
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="auth-password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="auth-password"
              disabled={pending}
              value={formData.password}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, password: e.target.value }))
              }
              placeholder="At least 8 characters"
              autoComplete="current-password"
              type="password"
              required
            />
          </div>

          <Button disabled={pending} size="lg" type="submit" className="w-full">
            Continue
          </Button>
        </form>

        <Separator />
        <div className="flex flex-col gap-y-2.5">
          <Button
            onClick={() => handleProviderSignin("google")}
            className="relative w-full"
            size="lg"
            variant="outline"
            disabled={pending}
          >
            <FcGoogle aria-hidden className="size-5 absolute top-3 left-2.5" />
            Continue with Google
          </Button>

          <Button
            onClick={() => handleProviderSignin("github")}
            className="relative w-full"
            size="lg"
            variant="outline"
            disabled={pending}
          >
            <FaGithub aria-hidden className="size-5 absolute top-3 left-2.5" />
            Continue with GitHub
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?
          <button
            type="button"
            onClick={() => setState("signUp")}
            className="ml-1 text-link font-medium hover:underline"
          >
            Sign up
          </button>
        </p>
      </CardContent>
    </Card>
  );
};

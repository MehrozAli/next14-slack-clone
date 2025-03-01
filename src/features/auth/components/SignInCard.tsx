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
    <Card className="h-full w-full p-8">
      <CardHeader className="px-0 pt-0">
        <CardTitle>Login to continue</CardTitle>

        <CardDescription>
          Use your email or another service to continue
        </CardDescription>
      </CardHeader>

      {!!error ? (
        <div className="bg-destructive/15 p-3 flex items-center gap-x-2 rounded-md text-sm text-destructive mb-6">
          <TriangleAlert className="size-4" />

          <p>{error}</p>
        </div>
      ) : null}

      <CardContent className="space-y-5 px-0 pb-0">
        <form onSubmit={onPasswordSignIn} className="space-y-2.5">
          <Input
            disabled={pending}
            value={formData.email}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, email: e.target.value }))
            }
            placeholder="Email"
            type="email"
            required
          />

          <Input
            disabled={pending}
            value={formData.password}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, password: e.target.value }))
            }
            placeholder="Password"
            type="password"
            required
          />

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
            <FcGoogle className="size-5 absolute top-3 left-2.5" />
            Continue with Google
          </Button>

          <Button
            onClick={() => handleProviderSignin("github")}
            className="relative w-full"
            size="lg"
            variant="outline"
            disabled={pending}
          >
            <FaGithub className="size-5 absolute top-3 left-2.5" />
            Continue with GitHub
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Don&apos;t have an account?
          <span
            onClick={() => setState("signUp")}
            className="text-sky-700 hover:underline cursor-pointer"
          >
            Sign up
          </span>
        </p>
      </CardContent>
    </Card>
  );
};

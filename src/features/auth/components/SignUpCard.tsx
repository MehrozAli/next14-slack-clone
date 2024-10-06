"use client";

import { Dispatch, FormEvent, SetStateAction, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { TriangleAlert } from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SignInFlow } from "../types";

interface SignUpCardProps {
  setState: Dispatch<SetStateAction<SignInFlow>>;
}

export const SignUpCard = ({ setState }: SignUpCardProps) => {
  const { signIn } = useAuthActions();

  const [pending, setPending] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  const handleProviderSignUp = (value: "google" | "github") => {
    setPending(true);

    signIn(value).finally(() => setPending(false));
  };

  const onPasswordSignUp = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { email, password, confirmPassword, name } = formData;

    if (password !== confirmPassword) {
      setError("Passwords do not match!");

      return;
    }

    setPending(true);
    signIn("password", { name, email, password, flow: "signUp" })
      .catch((err) => setError("Something went wrong"))
      .finally(() => setPending(false));
  };

  return (
    <Card className="h-full w-full p-8">
      <CardHeader className="px-0 pt-0">
        <CardTitle>Sign up to continue</CardTitle>

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
        <form onSubmit={onPasswordSignUp} className="space-y-2.5">
          <Input
            disabled={pending}
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="Full Name"
            required
          />

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

          <Input
            disabled={pending}
            value={formData.confirmPassword}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                confirmPassword: e.target.value,
              }))
            }
            placeholder="Confirm Password"
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
            onClick={() => handleProviderSignUp("google")}
            className="relative w-full"
            size="lg"
            variant="outline"
            disabled={pending}
          >
            <FcGoogle className="size-5 absolute top-3 left-2.5" />
            Continue with Google
          </Button>

          <Button
            onClick={() => handleProviderSignUp("github")}
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
          Already have an account?
          <span
            onClick={() => setState("signIn")}
            className="text-sky-700 hover:underline cursor-pointer"
          >
            Sign in
          </span>
        </p>
      </CardContent>
    </Card>
  );
};

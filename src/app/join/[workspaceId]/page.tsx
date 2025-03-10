"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import VerificationInput from "react-verification-input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useWorkspaceId } from "@/hooks/useWorkspaceId";
import { useGetInfoById } from "@/features/workspaces/api/useGetInfoById";
import { Loader } from "lucide-react";
import { useJoin } from "@/features/workspaces/api/useJoin";
import { cn } from "@/lib/utils";

const JoinPage = () => {
  const router = useRouter();

  const workspaceId = useWorkspaceId();
  const { data, isLoading } = useGetInfoById({ id: workspaceId });
  const { mutate, isPending } = useJoin();

  const isMember = useMemo(() => data?.isMember, [data?.isMember]);

  const handleComplete = (value: string) => {
    mutate(
      { workspaceId, joinCode: value },
      {
        onSuccess: (id) => {
          toast.success("Workspace Joined");

          router.replace(`/workspace/${id}`);
        },
        onError: () => toast.error("Failed to join workspace"),
      }
    );
  };

  useEffect(() => {
    if (isMember) {
      router.push(`/workspace/${workspaceId}`);
    }
  }, [isMember, router, workspaceId]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-y-8 items-center justify-center bg-white p-8 rounded-lg shadow-md">
      <div className="flex flex-col gap-y-4 items-center justify-center max-w-md">
        <div className="flex flex-col gap-y-2 items-center justify-center">
          <h1 className="text-2xl font-bold">Join {data?.name}</h1>

          <p className="text-md text-muted-foreground">
            Enter the workspace code to join
          </p>
        </div>

        <VerificationInput
          classNames={{
            container: cn(
              "flex gap-x-2",
              isPending && "opacity-50 cursor-not-allowed"
            ),
            character:
              "uppercase h-auto rounded-md border border-gray-300 flex items-center justify-center text-lg font-medium text-gray-500",
            characterInactive: "bg-muted",
            characterSelected: "bg-white text-black",
            characterFilled: "bg-white text-black",
          }}
          onComplete={handleComplete}
          length={6}
          autoFocus
        />
      </div>

      <div className="flex gap-x-4">
        <Button size="lg" variant="outline" asChild>
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </div>
  );
};

export default JoinPage;

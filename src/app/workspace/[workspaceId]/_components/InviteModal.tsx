import { Dispatch, SetStateAction } from "react";
import { Copy, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useWorkspaceId } from "@/hooks/useWorkspaceId";
import { useNewJoinCode } from "@/features/workspaces/api/useNewJoinCode";
import { useConfirm } from "@/hooks/useConfirm";

interface InviteModalProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  workspaceName: string;
  joinCode: string;
}

export const InviteModal = ({
  open,
  setOpen,
  workspaceName,
  joinCode,
}: InviteModalProps) => {
  const workspaceId = useWorkspaceId();
  const { mutate, isPending } = useNewJoinCode();
  const [ConfirmDialog, confirm] = useConfirm(
    "This will deactivate the current invite code and generate a new one",
    "Are you sure?"
  );

  const handleCopy = () => {
    const inviteLink = `${window.location.origin}/join/${workspaceId}`;

    navigator.clipboard
      .writeText(inviteLink)
      .then(() => toast.success("Invite link copied to clipboard"));
  };

  const handleNewCode = async () => {
    const ok = await confirm();

    if (!ok) {
      return;
    }

    mutate(
      { workspaceId },
      {
        onSuccess: () => toast.success("Invite code regenerated"),
        onError: () => toast.error("Failed to regnerate invite code"),
      }
    );
  };

  return (
    <>
      <ConfirmDialog />

      <Dialog onOpenChange={setOpen} open={open}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite people to {workspaceName}</DialogTitle>
            <DialogDescription>
              Use the code below to invite people to your workspace
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-y-4 py-10 items-center justify-center">
            <p className="text-4xl font-bold tracking-widest uppercase">
              {joinCode}
            </p>

            <Button onClick={handleCopy} variant="ghost" size="sm">
              Copy link
              <Copy className="size-4 ml-2" />
            </Button>
          </div>

          <div className="flex items-center justify-between w-full">
            <Button
              onClick={handleNewCode}
              disabled={isPending}
              variant="outline"
            >
              New Code
              <RefreshCcw className="size-4 ml-2" />
            </Button>

            <DialogClose asChild>
              <Button>Close</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

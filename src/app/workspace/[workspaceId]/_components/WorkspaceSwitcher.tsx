import { Loader, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGetWorkspace } from "@/features/workspaces/api/useGetWorkspace";
import { useGetWorkspaces } from "@/features/workspaces/api/useGetWorkspaces";
import { useCreateWorkspaceModal } from "@/features/workspaces/store/useCreateWorkspaceModal";
import { useWorkspaceId } from "@/hooks/useWorkspaceId";

export const WorkspaceSwitcher = () => {
  const router = useRouter();
  const [_open, setOpen] = useCreateWorkspaceModal();
  const workspaceId = useWorkspaceId();
  const { data: workspace, isLoading: isWorkspaceLoading } = useGetWorkspace({
    id: workspaceId,
  });
  const { data: workspaces, isLoading: areWorkspacesLoading } =
    useGetWorkspaces();

  const filteredWorkspaces = workspaces?.filter(
    (ws) => ws?._id !== workspaceId
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="size-9 relative overflow-hidden bg-[#ababad] rounded-md flex items-center justify-center hover:bg-[#ababad]/80 text-slate-800 font-semibold text-xl">
        {isWorkspaceLoading ? (
          <Loader className="size-5 shrink-0 animate-spin" />
        ) : (
          workspace?.name.charAt(0).toUpperCase()
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent side="bottom" align="start" className="w-64">
        <DropdownMenuItem
          onClick={() => router.push(`/workspace/${workspaceId}`)}
          className="cursor-pointer flex-col justify-start items-start capitalize"
        >
          {workspace?.name}

          <span className="text-xs text-muted-foreground">
            Active workspace
          </span>
        </DropdownMenuItem>

        {filteredWorkspaces?.map((workspace) => (
          <DropdownMenuItem
            onClick={() => router.push(`/workspace/${workspace?._id}`)}
            className="cursor-pointer capitalize overflow-hidden"
            key={workspace?._id}
          >
            <div className="size-9 relative shrink-0 overflow-hidden bg-[#616061] text-white font-semibold text-xl rounded-md flex items-center justify-center mr-2">
              {workspace.name.charAt(0).toUpperCase()}
            </div>

            <p className="truncate">{workspace.name}</p>
          </DropdownMenuItem>
        ))}

        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => setOpen(true)}
        >
          <div className="size-9 relative overflow-hidden bg-[#f2f2f2] text-slate-800 font-semibold text-xl rounded-md flex items-center justify-center mr-2">
            <Plus />
          </div>
          Create a new workspace
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

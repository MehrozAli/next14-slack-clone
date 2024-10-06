"use client";

import { useGetWorkspace } from "@/features/workspaces/api/useGetWorkspace";
import { useWorkspaceId } from "@/hooks/useWorkspaceId";

const WorkspacePage = () => {
  const workspaceId = useWorkspaceId();
  const { data } = useGetWorkspace({ id: workspaceId });

  return (
    <div>
      Workspace ID: {workspaceId}
      {JSON.stringify(data)}
    </div>
  );
};

export default WorkspacePage;

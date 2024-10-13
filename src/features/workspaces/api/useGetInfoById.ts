import { useQuery } from "convex/react";

import { Id } from "../../../../convex/_generated/dataModel";
import { api } from "../../../../convex/_generated/api";

interface UseGetWorkspaceProps {
  id: Id<"workspaces">;
}

export const useGetInfoById = ({ id }: UseGetWorkspaceProps) => {
  const data = useQuery(api.workspaces.getInfoById, { id });
  const isLoading = data === undefined;

  return { data, isLoading };
};

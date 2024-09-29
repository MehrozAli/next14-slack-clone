"use client";

import { CreateWorkspaceModal } from "@/features/workspaces/components/CreateWorkspaceModal";
import { CreateChannelModal } from "@/features/channels/components/CreateChannelModal";

export const ModalsProvider = () => (
  <>
    <CreateWorkspaceModal />
    <CreateChannelModal />
  </>
);

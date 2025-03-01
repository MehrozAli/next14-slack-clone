"use client";

import { PropsWithChildren } from "react";
import { Loader } from "lucide-react";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Thread } from "@/features/messages/components/Thread";
import { usePanel } from "@/hooks/usePanel";

import { WorkspaceSidebar } from "./_components/WorkspaceSidebar";
import { Sidebar } from "./_components/Sidebar";
import { Toolbar } from "./_components/Toolbar";
import { Profile } from "./_components/Profile";

import { Id } from "../../../../convex/_generated/dataModel";

const WorkspaceLayout = ({ children }: PropsWithChildren) => {
  const { parentMessageId, onMessageClose, profileMemberId } = usePanel();
  const showPanel = !!parentMessageId || !!profileMemberId;

  return (
    <div className="h-full">
      <Toolbar />

      <div className="flex h-[calc(100vh-40px)]">
        <Sidebar />

        <ResizablePanelGroup
          autoSaveId="mac-workspace-layout"
          direction="horizontal"
        >
          <ResizablePanel
            defaultSize={20}
            minSize={11}
            className="bg-[#5e2c5f]"
          >
            <WorkspaceSidebar />
          </ResizablePanel>

          <ResizableHandle withHandle />
          <ResizablePanel minSize={20} defaultSize={80}>{children}</ResizablePanel>

          {showPanel ? (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel minSize={20} defaultSize={29}>
                {parentMessageId ? (
                  <Thread
                    messageId={parentMessageId as Id<"messages">}
                    onClose={onMessageClose}
                  />
                ) : profileMemberId ? (
                  <Profile memberId={profileMemberId as Id<"members">} onClose={onMessageClose} />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Loader className="size-5 animate-spin text-muted-foreground" />
                  </div>
                )}
              </ResizablePanel>
            </>
          ) : null}
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default WorkspaceLayout;

"use client";

import { PropsWithChildren } from "react";

import { Toolbar } from "./_components/Toolbar";
import { Sidebar } from "./_components/Sidebar";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

import { WorkspaceSidebar } from './_components/WorkspaceSidebar';

const WorkspaceLayout = ({ children }: PropsWithChildren) => {
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

          <ResizablePanel minSize={20}>{children}</ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default WorkspaceLayout;

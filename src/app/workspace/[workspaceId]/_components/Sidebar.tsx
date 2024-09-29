import { Bell, Home, MessagesSquareIcon, MoreHorizontal } from "lucide-react";

import { UserButton } from "@/features/auth/components/UserButton";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";
import { SidebarButton } from "./SidebarButton";

export const Sidebar = () => {
  return (
    <aside className="w-[70px] h-full bg-[#481349] flex flex-col gap-y-4 items-center pt-[9px] pb-[4px]">
      <WorkspaceSwitcher />

      <SidebarButton icon={Home} label="Home" isActive />
      <SidebarButton icon={MessagesSquareIcon} label="DMs" />
      <SidebarButton icon={Bell} label="Activity" />
      <SidebarButton icon={MoreHorizontal} label="More" />

      <div className="flex flex-col items-center justify-center gap-y-1 mt-auto">
        <UserButton />
      </div>
    </aside>
  );
};

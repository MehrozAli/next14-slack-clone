import { PropsWithChildren } from "react";
import { FaCaretDown } from "react-icons/fa";
import { Plus } from "lucide-react";
import { useToggle } from "react-use";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Hint } from "@/components/Hint";

interface WorkspaceSectionProps {
  label: string;
  hint: string;
  onNew?: () => void;
}

export const WorkspaceSection = ({
  children,
  label,
  hint,
  onNew,
}: PropsWithChildren<WorkspaceSectionProps>) => {
  const [on, toggle] = useToggle(true);

  return (
    <div className="flex flex-col mt-3 px-2">
      <div className="group flex items-center px-3.5">
        <Button
          variant="transparent"
          className="p-0.5 text-sm text-[#f9ddffcc] shrink-0 size-6"
          onClick={toggle}
        >
          <FaCaretDown
            className={cn("size-4 transition-transform", { "-rotate-90": !on })}
          />
        </Button>

        <Button
          variant="transparent"
          size="sm"
          className="group px-1.5 text-sm text-[#f9ddffcc] h-[28px] justify-start overflow-hidden items-center"
        >
          <span className="truncate">{label}</span>
        </Button>

        {onNew ? (
          <Hint label={hint} side="top" align="center">
            <Button
              onClick={onNew}
              variant="transparent"
              size="iconSm"
              className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto p-0.5 text-sm text-[#f9ffddcc] size-6 shrink-0"
            >
              <Plus className="size-5" />
            </Button>
          </Hint>
        ) : null}
      </div>

      {on ? children : null}
    </div>
  );
};

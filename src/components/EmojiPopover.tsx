import { PropsWithChildren, useState } from "react";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface EmojiPopoverProps {
  hint?: string;
  onEmojiSelect: (emoji: any) => void;
}

export const EmojiPopover = ({
  children,
  hint = "Emoji",
  onEmojiSelect,
}: PropsWithChildren<EmojiPopoverProps>) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  const onSelect = (emoji: any) => {
    onEmojiSelect(emoji);
    setIsPopoverOpen(false);
  };

  return (
    <TooltipProvider>
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <Tooltip
          open={isTooltipOpen}
          onOpenChange={setIsTooltipOpen}
          delayDuration={50}
        >
          <PopoverTrigger asChild>
            <TooltipTrigger asChild>{children}</TooltipTrigger>
          </PopoverTrigger>

          <TooltipContent className="bg-black text-white border border-white/5">
            <p className="font-medium text-xs">{hint}</p>
          </TooltipContent>
        </Tooltip>

        <PopoverContent className="p-0 w-full border-none shadow-none">
          <Picker data={data} onEmojiSelect={onSelect} />
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  );
};

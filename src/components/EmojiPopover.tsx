import { PropsWithChildren, useState } from "react";
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";

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
  onEmojiSelect: (emoji: string) => void;
}

export const EmojiPopover = ({
  children,
  hint = "Emoji",
  onEmojiSelect,
}: PropsWithChildren<EmojiPopoverProps>) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  const onSelect = ({ emoji }: EmojiClickData) => {
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
          <EmojiPicker onEmojiClick={onSelect} />
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  );
};

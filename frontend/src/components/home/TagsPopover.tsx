import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";

export function TagsPopover() {
  const tagsList = [
    "Research",
    "Climate",
    "Technology",
    "AI",
    "Science",
    "Politics",
    "Business",
  ];
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Tags</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 h-80">
        <ScrollArea className="h-80 p-4 w-full">
          <div className="w-full h-fit rounded-md inline-flex justify-start flex-wrap gap-2">
            {tagsList.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <div
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`cursor-pointer px-2 py-1 rounded-xl ${
                    isSelected
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-900"
                  } flex items-center space-x-2`}
                >
                  {isSelected && <Check size={16} />}
                  <small>{tag}</small>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

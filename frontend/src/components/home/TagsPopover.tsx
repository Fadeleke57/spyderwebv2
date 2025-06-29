import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tags, Plus } from "lucide-react";
import { WebTag } from "@/types/web";
import { tagsList } from "@/lib/consts";
import { useRouter } from "next/router";
import {
  useAddTagToWeb,
  useFetchWebById,
  useRemoveTagFromWeb,
} from "@/hooks/webs";
import { Input } from "../ui/input";
import { toast } from "../ui/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useAuthorization } from "@/providers/AuthorizationProvider";

export function TagsPopover() {
  const router = useRouter();
  const { webId } = router.query;

  const { data: web, refetch: refetchWeb } = useFetchWebById(webId as string);

  const { mutateAsync: addTagToWeb, isPending: tagLoading } = useAddTagToWeb(
    webId as string
  );

  const { mutateAsync: removeTagFromWeb } = useRemoveTagFromWeb(
    webId as string
  );

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");

  const { canWrite } = useAuthorization();

  const predefinedTagLabels = tagsList.map((tag) => tag.label);

  const customTags = selectedTags.filter(
    (tag) => !predefinedTagLabels.includes(tag)
  );

  useEffect(() => {
    if (web && web.tags) {
      setSelectedTags(web.tags);
    }
  }, [web]);

  const toggleTag = async (tag: string) => {
    if (!canWrite) {
      return;
    }

    try {
      if (selectedTags.includes(tag)) {
        setSelectedTags((prev) => prev.filter((t) => t !== tag));
        await removeTagFromWeb(tag);
      } else {
        if (web && web.tags.length < 10) {
          setSelectedTags((prev) => [...prev, tag]);
          await addTagToWeb(tag);
        } else {
          toast({
            title: "Tag limit reached",
            description: "You can have a maximum of 10 tags.",
            variant: "destructive",
          });
        }
      }
      refetchWeb();
    } catch (error) {
      console.error("Error toggling tag:", error);
      refetchWeb();
    }
  };

  const handleCustomTagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTag.trim() || !canWrite) return;

    const newTag = customTag.trim();
    if (!selectedTags.includes(newTag)) {
      try {
        if (web && web.tags.length < 10) {
          setSelectedTags((prev) => [...prev, newTag]);
          setCustomTag("");
          await addTagToWeb(newTag);
          refetchWeb();
        } else {
          toast({
            title: "Tag limit reached",
            description: "You can have a maximum of 10 tags.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error adding custom tag:", error);
        setSelectedTags((prev) => prev.filter((tag) => tag !== newTag));
      }
    } else {
      setCustomTag("");
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"link"}
          className="rounded-full text-neon w-fit -ml-2 px-0 m-0 h-fit bg-transparent"
        >
          <Tags size={16} className="mr-1 hover:text-neon/70" />
        </Button>
      </PopoverTrigger>
      <PopoverContent side="right" sideOffset={4} className={`w-[400px] p-4`}>
        <div className="w-full h-fit rounded-md inline-flex justify-start flex-wrap gap-2">
          {canWrite ? (
            <>
              {/* predefined tags */}
              {tagsList.map((tag: WebTag) => {
                const isSelected = selectedTags.includes(tag.label);
                return (
                  <div
                    key={tag.label}
                    onClick={() => toggleTag(tag.label)}
                    className={`cursor-pointer px-2 py-1 rounded-full ${
                      isSelected
                        ? "border dark:bg-violet-400/50 dark:border-violet-200 text-foreground"
                        : "bg-muted"
                    } flex items-center space-x-2 transition-colors`}
                  >
                    <small>{tag.value}</small>
                  </div>
                );
              })}

              {/* custom tags */}
              <>
                <div className="w-full border-t pt-2 mt-2">
                  <small className="text-muted-foreground">Custom Tags:</small>{" "}
                  {/* custom tag input */}
                  <form className="w-full my-2">
                    <div className="flex items-center gap-2">
                      <Input
                        type="text"
                        value={customTag}
                        onChange={(e) => setCustomTag(e.target.value)}
                        placeholder="Add custom tag..."
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!customTag.trim() || tagLoading}
                        onClick={handleCustomTagSubmit}
                      >
                        <Plus size={16} />
                      </Button>
                    </div>
                  </form>
                </div>

                {customTags.map((tag: string) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <div
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`cursor-pointer px-2 py-1 rounded-full ${
                        isSelected
                          ? "border dark:bg-violet-400/50 dark:border-violet-200 text-foreground"
                          : "bg-muted"
                      } flex items-center space-x-2 transition-colors`}
                    >
                      <small>
                        {tag.charAt(0).toUpperCase() + tag.slice(1)}
                      </small>
                    </div>
                  );
                })}
              </>
            </>
          ) : selectedTags.length ? (
            <>
              {/* display predefined tags for non-owners */}
              {selectedTags
                .filter((tag) => predefinedTagLabels.includes(tag))
                .map((tagLabel: string) => {
                  const tagObject = tagsList.find((t) => t.label === tagLabel);
                  return (
                    <div
                      key={tagLabel}
                      className="px-2 py-1 rounded-xl border dark:bg-violet-400/50 dark:border-violet-200 text-foreground flex items-center space-x-2"
                    >
                      <small>{tagObject?.value || tagLabel}</small>
                    </div>
                  );
                })}

              {/* display custom tags for non-owners */}
              {customTags.map((tag: string) => (
                <div
                  key={tag}
                  className="px-2 py-1 rounded-xl border dark:bg-violet-400/50 dark:border-violet-200 text-foreground flex items-center space-x-2"
                >
                  <small>{tag.charAt(0).toUpperCase() + tag.slice(1)}</small>
                </div>
              ))}
            </>
          ) : (
            <div>
              <small>No tags</small>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

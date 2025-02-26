import { Source } from "@/types/source";
import { Card } from "../ui/card";
import FaviconDisplay from "../utility/FaviconDisplay";

interface SourceTooltipProps {
  children: React.ReactNode;
  source: Source | null;
  position: { x: number; y: number } | null;
}

const SourceTooltip = ({ children, source, position }: SourceTooltipProps) => {

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (!position) return null;

  return (
    <div
      style={{
        position: "fixed",
        left: `${position.x + 20}px`,
        top: `${position.y - 20}px`,
        zIndex: 50,
        pointerEvents: position ? "auto" : "none",
      }}
      className={`${!source || !position ? "opacity-0" : "opacity-100"}`}
    >
      <Card
        className={`
          max-w-[300px]
          transition-all
          duration-300
          ease-in-out
          hover:shadow-xl
          hover:-translate-y-1
          bg-background
          p-3
          ${!source || !position ? "opacity-0" : "opacity-100"}
        `}
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            {source?.url && <FaviconDisplay url={source.url} />}
            <span className="capitalize">{source?.type}</span>
          </div>

          <div className="text-sm font-semibold">{source?.name}</div>

          <div className="flex flex-col gap-1 text-xs text-gray-500 dark:text-gray-400">
            {source?.created && (
              <div>Added {formatDate(source.created + "Z")}</div>
            )}
            {source?.url && source?.type === "website" && (
              <div className="truncate">{source.url}</div>
            )}
            {source?.size && <div>{formatFileSize(source.size)}</div>}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SourceTooltip;

import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { PricingModal } from "@/components/pricing/PricingModal";

interface ResourceUsageProps {
  storageUsed: number;
  storageLimit: number;
  computationUsed: number;
  computationLimit: number;
}

export function ResourceUsage({
  storageUsed,
  storageLimit,
  computationUsed,
  computationLimit,
}: ResourceUsageProps) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [showPricing, setShowPricing] = useState(false);

  const storagePercentage = (storageUsed / storageLimit) * 100;
  const computationPercentage = (computationUsed / computationLimit) * 100;

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const handleUpgradeClick = () => {
    setShowPricing(true);
  };

  // If sidebar is collapsed, show a minimal version
  if (isCollapsed) {
    return (
      <>
        <div className="flex justify-center items-center w-full">
          <Button
            className="aspect-square rounded-full w-6 h-6 p-0 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white shadow-sm transition-all duration-200 hover:shadow-purple-500/20 flex items-center justify-center"
            size="sm"
            onClick={handleUpgradeClick}
          >
            <Zap className="w-3 h-3" />
          </Button>
        </div>
        <PricingModal open={showPricing} setOpen={setShowPricing} />
      </>
    );
  }

  return (
    <>
      <div className="p-3 bg-card rounded-lg border border-border shadow-sm">
        <div className="space-y-3">
          {/* Storage Section */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-muted-foreground">
                Storage
              </span>
              <span className="text-xs text-muted-foreground">
                {formatBytes(storageUsed)} / {formatBytes(storageLimit)}
              </span>
            </div>
            <Progress value={storagePercentage} className="h-1.5" />
          </div>

          {/* Computation Section */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-muted-foreground">
                Computation
              </span>
              <span className="text-xs text-muted-foreground">
                {computationUsed} / {computationLimit}
              </span>
            </div>
            <Progress value={computationPercentage} className="h-1.5" />
          </div>

          {/* Upgrade Button */}
          <Button
            className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white shadow-sm transition-all duration-200 hover:shadow-purple-500/20 text-xs py-1 h-7"
            size="sm"
            onClick={handleUpgradeClick}
          >
            <Zap className="w-3 h-3 mr-1" />
            Upgrade to Pro
          </Button>
        </div>
      </div>
      <PricingModal open={showPricing} setOpen={setShowPricing} />
    </>
  );
}

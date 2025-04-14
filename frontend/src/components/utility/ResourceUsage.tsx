import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
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

  // Ensure we have valid numbers and calculate percentages safely
  const storagePercentage = Math.min(
    ((storageUsed || 0) / (storageLimit || 1)) * 100,
    100
  );
  const computationPercentage = Math.min(
    ((computationUsed || 0) / (computationLimit || 1)) * 100,
    100
  );

  const formatStorage = (mb: number) => {
    if (!mb || mb === 0) return "0 MB";

    // For storage limit, it's already in MB but needs to be shown in GB
    if (mb > 1000) {
      // If more than 1000 MB
      const gb = mb / 1024;
      return `${Math.round(gb)} GB`; // Round to whole GB for cleaner display
    }

    // For smaller values, show in MB with 1 decimal
    return `${mb.toFixed(1)} MB`;
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
                {formatStorage(storageUsed)} / {formatStorage(storageLimit)}
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
                {computationUsed || 0} / {computationLimit || 0}
              </span>
            </div>
            <Progress value={computationPercentage} className="h-1.5" />
          </div>

          {computationPercentage >= 100 && (
            <div className="flex items-center justify-center px-2 py-1.5 bg-violet-500/5 rounded-md border border-violet-500/10">
              <span className="text-xs font-medium text-violet-500">
                Autolinking disabled
              </span>
            </div>
          )}

          {/* Upgrade Button */}
          <Button
            className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white shadow-sm transition-all duration-200 hover:shadow-purple-500/20 text-xs py-1 h-7"
            size="sm"
            onClick={handleUpgradeClick}
          >
            <Zap className="w-3 h-3 mr-1" />
            Upgrade
          </Button>
        </div>
      </div>
      <PricingModal open={showPricing} setOpen={setShowPricing} />
    </>
  );
}

import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Info, Zap } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { PricingModal } from "@/components/pricing/PricingModal";
import { useUser } from "@/context/UserContext";
import SimpleTooltip from "./SimpleTooltip";

interface ResourceUsageProps {
  storageUsed: number;
  storageLimit: number;
  computationUsed: number;
  computationLimit: number;
}

const mapTierToLabel = (tier: string) => {
  switch (tier) {
    case "free":
      return "Starter Plan";
    case "basic":
      return "Basic Plan";
    case "pro":
      return "Enterprise";
    default:
      return "Resource";
  }
};

export function ResourceUsage({
  storageUsed,
  storageLimit,
  computationUsed,
  computationLimit,
}: ResourceUsageProps) {
  const { state } = useSidebar();
  const { user } = useUser();
  const isCollapsed = state === "collapsed";
  const [showPricing, setShowPricing] = useState(false);
  const [userPlan, setUserPlan] = useState(
    user ? user.subscription_plan : "free"
  );

  const formatStorage = (mb: number, limit?: number) => {
    if (!mb || mb === 0) return "0 MB";

    const gb = mb / 1024;

    // Format based on context
    if (limit && limit >= 100) {
      // For large limits like 200 GB: compact formatting
      return gb >= 1 ? `${gb.toFixed(1)} GB` : `${mb.toFixed(0)} MB`;
    } else {
      // For smaller limits: show with more clarity
      return gb >= 1
        ? `${gb.toFixed(gb >= 10 ? 0 : 1)} GB`
        : `${mb.toFixed(1)} MB`;
    }
  };

  const handleUpgradeClick = () => {
    setShowPricing(true);
  };

  useEffect(() => {
    if (!user) return;
    setUserPlan(user.subscription_plan);
  }, [user]);

  const storageMessage = (
    <div className="">
      Storage is the total size of all your uploaded items and how they are
      stored as memory.
      <br />
      <br />
      The max storage for your plan is{" "}
      <span className="font-semibold text-violet-400/80">
        {formatStorage(storageLimit || 0)}
      </span>
      . Once you reach this limit, uploads and memory updates will be paused
      till the next billing cycle.
      <br />
      <br />
      To avoid interruptions,{" "}
      <a
        className="hover:underline cursor-pointer text-violet-400/80"
        onClick={handleUpgradeClick}
      >
        upgrade your plan
      </a>
      .
    </div>
  );

  const computationMessage = (
    <div>
      Computation makes up your chats with Charlotte AI and Autolinker usage.
      <br />
      <br />
      The max computation for your plan is{" "}
      <span className="font-semibold text-violet-400/80">
        {computationLimit} credits
      </span>
      . Once you reach this limit, chats and autolinker access will be paused
      till the next billing cycle.
      <br />
      <br />
      To avoid interruptions,{" "}
      <a
        className="hover:underline cursor-pointer text-violet-400/80"
        onClick={handleUpgradeClick}
      >
        upgrade your plan
      </a>
      .
    </div>
  );

  const storagePercentage = Math.min(
    ((storageUsed || 0) / (storageLimit || 1)) * 100,
    100
  );
  const computationPercentage = Math.min(
    ((computationUsed || 0) / (computationLimit || 1)) * 100,
    100
  );

  if (isCollapsed) {
    return (
      <>
        <div className="flex justify-center items-center w-full">
          <Button
            className="aspect-square rounded-full w-6 h-6 p-0 flex items-center justify-center"
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
      <div className="p-3 bg-card rounded-lg border border-border shadow-sm font-semibold">
        <div className="space-y-3">
          {/* Header */}
          {user && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-foreground flex items-center">
                {mapTierToLabel(userPlan)}
              </span>
              <SimpleTooltip p={2} content="Plan details">
                <Info size={16} className=" ml-1 mt-[1px]"></Info>
              </SimpleTooltip>
            </div>
          )}
          {/* Storage Section */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-xs text-foreground flex items-center">
                Storage{" "}
                <SimpleTooltip
                  p={4}
                  side="right"
                  sideOffset={8}
                  content={storageMessage}
                >
                  <Info size={12} className="ml-1 mt-[1px]" />
                </SimpleTooltip>
              </span>
              <span className="text-xs text-foreground">
                {formatStorage(storageUsed, storageLimit)} /{" "}
                {formatStorage(storageLimit)}
              </span>
            </div>
            <Progress value={storagePercentage} className="h-1.5" />
          </div>

          {/* Computation Section */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-foreground flex items-center">
                Computation{" "}
                <SimpleTooltip
                  p={4}
                  side="right"
                  sideOffset={8}
                  content={computationMessage}
                >
                  <Info size={12} className=" ml-1 mt-[1px]"></Info>
                </SimpleTooltip>
              </span>
              <span className="text-xs text-foreground">
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
          {user && user.subscription_plan === "free" && (
            <Button
              className="w-full text-foreground shadow-sm transition-all duration-200 hover:shadow-violet-500/20 text-xs py-1 h-7"
              size="sm"
              onClick={handleUpgradeClick}
            >
              Upgrade Now
            </Button>
          )}
        </div>
      </div>
      <PricingModal open={showPricing} setOpen={setShowPricing} />
    </>
  );
}

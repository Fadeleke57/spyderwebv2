import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";
import { useCreateCheckoutSession } from "@/hooks/usage";

interface PricingModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

interface PricingTier {
  name: string;
  description: string;
  features: string[];
  cta: string;
  highlighted: boolean;
  price?: string;
  monthlyPrice?: string;
  yearlyPrice?: string;
}

const tiers: PricingTier[] = [
  {
    name: "Free",
    price: "0",
    description: "Perfect for personal notes",
    features: ["15 GB Storage", "100 AI Credits", "Charlotte AI Access"],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Basic",
    monthlyPrice: "10",
    yearlyPrice: "8",
    description: "For power users who write a lot",
    features: [
      "50 GB Storage",
      "1,000 AI Credits",
      "Charlotte AI Access",
      "AI Autolinker Access",
    ],
    cta: "Unlock Basic",
    highlighted: true,
  },
  {
    name: "Pro",
    monthlyPrice: "50",
    yearlyPrice: "40",
    description: "For heavy AI users",
    features: [
      "200 GB Storage",
      "5,000 AI Credits",
      "Charlotte AI Access",
      "Autolinker Access",
      "DeepResearch Agent (coming soon)",
    ],
    cta: "Unlock Pro",
    highlighted: false,
  },
];

export function PricingModal({ open, setOpen }: PricingModalProps) {
  const [isYearly, setIsYearly] = useState(false);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const { mutateAsync: createCheckoutSession } = useCreateCheckoutSession();

  const calculateYearlyPrice = (monthlyPrice: string) => {
    return (parseFloat(monthlyPrice) * 0.8 * 12).toString();
  };

  const handleSubscribe = async (tier: PricingTier) => {
    try {
      setIsLoading(tier.name);
      const tierId = tier.name.toLowerCase();
      const payload = {
        tier: tierId,
        is_yearly: isYearly,
      };
      const data = await createCheckoutSession(payload);

      if (tierId === "free") {
        setOpen(false);
        toast.success("You are now on the Free plan!");
        return;
      }
      if (data.url) {
        // redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast.error("Failed to start checkout process. Please try again.");
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[900px] max-h-[85vh] overflow-y-auto">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-xl font-bold text-center">
            Choose your plan
          </DialogTitle>
          <div className="flex flex-col items-center gap-2 mt-2">
            <p className="text-sm text-center text-muted-foreground">
              Unlock Your Web Experience
            </p>
            <div className="flex items-center gap-3 mt-2 bg-muted/50 p-1 rounded-full">
              <button
                onClick={() => setIsYearly(false)}
                className={cn(
                  "text-sm px-4 py-1 rounded-full transition-all text-foreground/70",
                  !isYearly && "bg-white text-black font-semibold shadow-sm"
                )}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={cn(
                  "text-sm px-4 py-1 rounded-full transition-all flex items-center gap-1.5 text-foreground/70",
                  isYearly && "bg-white text-black font-semibold shadow-sm"
                )}
              >
                Yearly
                <span className="text-[10px] font-semibold bg-purple-100 text-purple-900 px-1.5 py-0.5 rounded-full">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={cn(
                "rounded-xl p-4 ring-1 ring-border relative",
                tier.highlighted
                  ? "bg-purple-600 text-white ring-purple-500"
                  : "bg-card"
              )}
            >
              {tier.highlighted && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-purple-100 text-purple-700 text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Most Popular
                </div>
              )}
              <h3
                className={cn(
                  "text-base font-semibold",
                  tier.highlighted ? "text-white" : "text-foreground"
                )}
              >
                {tier.name}
              </h3>
              <p
                className={cn(
                  "mt-1 text-sm",
                  tier.highlighted ? "text-purple-100" : "text-muted-foreground"
                )}
              >
                {tier.description}
              </p>
              <div className="mt-3">
                {tier.price ? (
                  <>
                    <span
                      className={cn(
                        "text-2xl font-bold",
                        tier.highlighted ? "text-white" : "text-foreground"
                      )}
                    >
                      ${tier.price}
                    </span>
                    <span
                      className={cn(
                        "text-sm ml-1",
                        tier.highlighted
                          ? "text-purple-100"
                          : "text-muted-foreground"
                      )}
                    >
                      forever
                    </span>
                  </>
                ) : (
                  <>
                    <span
                      className={cn(
                        "text-2xl font-bold",
                        tier.highlighted ? "text-white" : "text-foreground"
                      )}
                    >
                      ${isYearly ? tier.yearlyPrice : tier.monthlyPrice}
                    </span>
                    <span
                      className={cn(
                        "text-sm ml-1",
                        tier.highlighted
                          ? "text-purple-100"
                          : "text-muted-foreground"
                      )}
                    >
                      per month
                    </span>
                    {isYearly && tier.monthlyPrice && (
                      <div
                        className={cn(
                          "text-xs mt-0.5",
                          tier.highlighted
                            ? "text-purple-100"
                            : "text-muted-foreground"
                        )}
                      >
                        ${calculateYearlyPrice(tier.monthlyPrice)} billed yearly
                      </div>
                    )}
                  </>
                )}
              </div>
              <Button
                className={cn(
                  "w-full mt-3",
                  tier.highlighted
                    ? "bg-white text-purple-600 hover:bg-purple-50"
                    : "bg-purple-600 text-white hover:bg-purple-500"
                )}
                onClick={() => handleSubscribe(tier)}
                disabled={isLoading === tier.name}
              >
                {isLoading === tier.name ? "Loading..." : tier.cta}
              </Button>
              <ul
                className={cn(
                  "mt-3 space-y-1.5 text-sm",
                  tier.highlighted ? "text-purple-100" : "text-muted-foreground"
                )}
              >
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-x-2">
                    <Check
                      className={cn(
                        "h-4 w-4 flex-none mt-0.5",
                        tier.highlighted ? "text-white" : "text-purple-600"
                      )}
                      aria-hidden="true"
                    />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

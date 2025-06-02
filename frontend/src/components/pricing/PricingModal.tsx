import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { useCreateCheckoutSession } from "@/hooks/usage";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";

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
    description: "For trying out and for small applications.",
    features: ["2 GB Storage", "100 AI Credits", "Charlotte AI Access"],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Basic",
    monthlyPrice: "10",
    yearlyPrice: "8",
    description: "Enhanced memory management for power users.",
    features: [
      "50 GB Storage",
      "1,000 AI Credits",
      "Charlotte AI Access",
      "AI Autolinker Access",
    ],
    cta: "Get Started",
    highlighted: true,
  },
  {
    name: "Enterprise",
    description:
      "Comprehensive memory solutions for organizations-scalable, secure, and fully customizable.",
    features: [
      "200 GB Storage",
      "5,000 AI Credits",
      "Charlotte AI Access",
      "AI Autolinker Access",
      "Dedicated support, custom solutions, and integration assistance.",
    ],
    cta: "Contact Us",
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
      if (tier.name === "Enterprise") {
        // redirect to email spydrdev@gmail.com
        window.location.href = "mailto:spydrdev@gmail.com";
        return;
      }
      setIsLoading(tier.name);
      const tierId = tier.name.toLowerCase();
      const payload = {
        tier: tierId,
        is_yearly: isYearly,
      };
      const data = await createCheckoutSession(payload);

      if (tierId === "free") {
        setOpen(false);
        toast({
          title: "Success",
          description: "You have successfully subscribed to the free tier.",
        });
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
      toast({
        variant: "destructive",
        title: "Error creating checkout session",
        description: "Please try again",
      });
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[900px] max-h-[95vh]">
        <ScrollArea className="max-h-[85vh]">
          <ScrollBar />
          <DialogHeader className="pb-2">
            <DialogTitle className="text-xl font-bold text-center">
              Choose your plan
            </DialogTitle>
            <div className="flex flex-col items-center gap-2 mt-2">
              <p className="text-sm text-center text-muted-foreground">
                Unlock Unified Memory Access for Your AI
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
                  <span className="text-[10px] font-semibold bg-violet-100 text-violet-500 px-1.5 py-0.5 rounded-full">
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
                    ? "border dark:bg-violet-400/40 dark:border-violet-200"
                    : "bg-card"
                )}
              >
                {tier.highlighted && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-violet-100 text-violet-500 text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                    Popular
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
                    tier.highlighted
                      ? "text-violet-100"
                      : "text-muted-foreground"
                  )}
                >
                  {tier.description}
                </p>
                {tier.monthlyPrice && tier.yearlyPrice && (
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
                              ? "text-violet-100"
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
                              ? "text-violet-100"
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
                                ? "text-violet-100"
                                : "text-muted-foreground"
                            )}
                          >
                            ${calculateYearlyPrice(tier.monthlyPrice)} billed
                            yearly
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
                <Button
                  className={cn(
                    "w-full mt-3",
                    tier.highlighted
                      ? " dark:text-foreground"
                      : "border dark:bg-violet-400/40 dark:border-violet-200 dark:hover:bg-violet-400/50"
                  )}
                  onClick={() => handleSubscribe(tier)}
                  disabled={isLoading === tier.name}
                >
                  {isLoading === tier.name ? "Loading..." : tier.cta}
                </Button>
                <ul
                  className={cn(
                    "mt-3 space-y-1.5 text-sm",
                    tier.highlighted
                      ? "text-violet-100"
                      : "text-muted-foreground"
                  )}
                >
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-x-2">
                      <Check
                        className={cn(
                          "h-4 w-4 flex-none mt-0.5",
                          tier.highlighted ? "text-white" : "text-violet-400"
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
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

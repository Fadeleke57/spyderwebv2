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
import { toast } from "sonner"
import { useUser } from "@/context/UserContext";

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
    features: [
      "5 GB Storage",
      "100 AI Operations/mo",
      "Basic Web Features",
      "3 Webs",
      "Community Support",
      "Mobile Access",
    ],
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
      "1,000 AI Operations/mo",
      "All Web Features",
      "15 Webs",
      "Email Support",
      "Mobile Access",
      "Version History",
      "Collaboration Tools",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Pro",
    monthlyPrice: "30",
    yearlyPrice: "25",
    description: "For teams and heavy AI users",
    features: [
      "200 GB Storage",
      "5,000 AI Operations/mo",
      "All Web Features",
      "Unlimited Webs",
      "Priority Support",
      "Mobile Access",
      "Extended History",
      "Advanced Collaboration",
      "AI API Access",
    ],
    cta: "Start Free Trial",
    highlighted: false,
  },
];

export function PricingModal({ open, setOpen }: PricingModalProps) {
  const [isYearly, setIsYearly] = useState(false);
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const { user } = useUser();

  const calculateYearlyPrice = (monthlyPrice: string) => {
    return (parseFloat(monthlyPrice) * 12).toString();
  };

  const handleSubscribe = async (tier: PricingTier) => {
    try {
      setIsLoading(tier.name);

      // Map tier name to backend tier ID
      const tierId = tier.name.toLowerCase();

      // Get the API URL from environment variables or use a default
      const apiUrl =
        process.env.NEXT_PUBLIC_LOCAL_API_URL || "http://localhost:8000";

      console.log("Using API URL:", apiUrl);

      // Call the backend to create a checkout session
      const response = await fetch(
        `${apiUrl}/payment/create-checkout-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tier: tierId,
            is_yearly: isYearly,
            user_id: user?.id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("Error response:", data);
        throw new Error(data.detail || "Failed to create checkout session");
      }

      // If it's a free tier, just close the modal
      if (tierId === "free") {
        setOpen(false);
        toast.success("You are now on the Free plan!");
        return;
      }

      // Redirect to Stripe Checkout
      if (data.url) {
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
              All paid plans include a 14-day free trial. No credit card
              required.
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

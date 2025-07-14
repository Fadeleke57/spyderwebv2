import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "@/components/ui/use-toast";
import { useProcessPayment } from "@/hooks/usage";
import { useUser } from "@/providers/UserProvider";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const { user } = useUser();
  const { session_id } = router.query;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {
    mutateAsync: processSuccessPayment,
  } = useProcessPayment();

  useEffect(() => {
    const processPayment = async () => {
      if (!session_id || typeof session_id !== "string") return;

      try {
        const data = await processSuccessPayment({ session_id });
        console.log("Response data:", data);
        toast({
          title: "Success",
          description: "Subscription activated successfully",
        });
        setIsLoading(false);
      } catch (err: any) {
        console.error("Payment processing error:", err);
        setError(err.message || "Failed to activate subscription");
        setIsLoading(false);
        toast({
          title: "Error",
          description: "Failed to activate subscription",
          variant: "destructive",
        });
      }
    };

    if (session_id && typeof session_id === "string") {
      console.log("Processing payment for session:", session_id);
      processPayment();
    }
  }, [session_id, processSuccessPayment]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-4">
        <div className="text-center max-w-md">
          <div className="flex justify-center mb-6">
            <XCircle className="h-16 w-16 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button asChild>
            <Link href="/home">Go to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <CheckCircle className="h-16 w-16 text-green-500/40" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
        <p className="text-muted-foreground mb-6">
          {isLoading
            ? "Processing your subscription..."
            : "Thank you for your subscription. Your account has been upgraded successfully."}
        </p>
        {!isLoading && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link href="/home">Go to Home</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/user/${user?.username}`}>Start Creating</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const { session_id } = router.query;
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Here you could verify the session with your backend if needed
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
        <p className="text-muted-foreground mb-6">
          Thank you for your subscription. Your account has been upgraded
          successfully.
        </p>
        {isLoading ? (
          <div className="animate-pulse">Processing your subscription...</div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link href="/home">Go to Home</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/webs">Start Creating Webs</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import Link from "next/link";

export default function PaymentCancelPage() {
  return (
    <div className="flex items-center justify-center h-screen p-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <XCircle className="h-16 w-16 text-red-500/80" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Payment Cancelled</h1>
        <p className="text-muted-foreground mb-6">
          Your payment was cancelled. No charges were made to your account.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link href="/home?loginSource=payment-cancel">Return to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

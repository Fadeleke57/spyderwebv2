import Image from "next/image";
import sLogo from "@/assets/slogonobg.png";

export const AuthHeader = ({
  step,
  email,
}: {
  step: string;
  email: string;
}) => (
  <div className="flex flex-col items-center justify-center mb-4">
    <Image src={sLogo} className="w-14 h-14 mb-3 rotate-45" alt="Spydr Logo" />
    <h1 className="text-xl font-semibold">
      {step === "login"
        ? "Welcome back"
        : step === "register"
          ? "Create your account"
          : "A New Age of Understanding"}
    </h1>
    <p className="text-sm text-muted-foreground mt-1">
      {step === "login"
        ? `Logging in as ${email}`
        : step === "register"
          ? `Joining with ${email}`
          : "Enter your email or continue with Google."}
    </p>
  </div>
);

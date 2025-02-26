import { Button } from "../ui/button";
import { useRouter } from "next/router";
import TypingAnimation from "@/components/ui/typing-animation";
import { cn } from "@/lib/utils";
import { googleIcon } from "../utility/Icons";
import { environment } from "@/environment/load_env";
import GSAPButton from "../utility/GSAPButton";
import { useState } from "react";
import { AuthModal } from "../auth/AuthModal";
import Link from "next/link";

function Header() {
  const [open, setIsOpen] = useState(false);
  const router = useRouter();
  const [typeOfAuth, setTypeOfAuth] = useState<"login" | "register">("login");
  const handleGoogleSignIn = () => {
    window.location.href = `${environment.api_url}/auth/login/google`;
  };

  const handleButtonClick = (typeOfAuth: "login" | "register") => {
    setTypeOfAuth(typeOfAuth);
    console.log("handleButtonClick", typeOfAuth);
    setIsOpen(true);
  };

  return (
    <div className="flex flex-col gap-4 lg:flex-row items-center justify-between">
      <div className="relative mb-6 sm:mb-8 w-full lg:max-w-[44rem]">
        <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 dark:text-white">
          The new way to news.
        </p>
        <h1 className="text-5xl lg:text-9xl tracking-tight max-w-xs lg:max-w-full mb-2 sm:mb-4 font-extrabold lg:font-bold dark:text-white">
          Welcome to the{" "}
          <TypingAnimation
            className="text-blue-500 text-5xl sm:text-4xl lg:text-9xl font-extrabold lg:font-bold tracking-tigh italic"
            text="Web."
          />
        </h1>
        <p className="leading-7 mt-4 text-base sm:text-lg font-medium max-w-full lg:max-w-xl mx-0 text-muted-foreground dark:text-white">
          Learn. Create. Connect. Share.{" "}
          <span className="hidden md:inline lg:inline">
            Curate your deep dives and turn them into starting points for
            discovery.
          </span>
        </p>{" "}
        {/* Would be funny to add a prompt here "With AI ofc!"*/}
        <div className="hidden lg:block mt-6 flex flex-row space-x-4 lg:gap-4 justify-start">
          <GSAPButton
            label="Jump in"
            variant="outline"
            classname="text-sm font-medium"
            onClick={() => router.push("/explore")}
          />
          <GSAPButton
            label="If you're new"
            classname="text-sm font-medium"
            onClick={() => router.push("/about")}
          />
        </div>
      </div>
      <div className="max-w-sm flex flex-col gap-6">
        <div className={cn("flex flex-col gap-6")}>
          <form>
            <div className="flex flex-col gap-6">
              <GSAPButton
                onClick={handleGoogleSignIn}
                buttonClassname="border lg:justify-center lg:border-none"
                classname="flex flex-row items-center gap-2 text-sm font-medium"
                color="secondary"
              >
                {googleIcon}
                Continue with Google
              </GSAPButton>

              <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                <span className="relative z-10 bg-background px-2 text-muted-foreground">
                  or
                </span>
              </div>

              <div className="flex flex-col gap-6">
                <span
                  onClick={() => setIsOpen(true)}
                  className="hover:underline text-foreground cursor-pointer text-sm font-medium text-center"
                >
                  Already have an account?
                </span>

                <GSAPButton
                  buttonClassname="border lg:justify-center"
                  classname="text-sm font-medium"
                  onClick={() => handleButtonClick("register")}
                >
                  Create Account
                </GSAPButton>
                <div className="text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
                  By signing up, you agree to our{" "}
                  <Link
                    href="/about/terms-of-service"
                    className="dark:text-blue-500"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/about/privacy-policy"
                    className="dark:text-blue-500"
                  >
                    Privacy Policy
                  </Link>
                  .
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
      {open && (
        <AuthModal
          referrer="landing"
          type={typeOfAuth}
          open={open}
          setOpen={setIsOpen}
        />
      )}
    </div>
  );
}

export default Header;

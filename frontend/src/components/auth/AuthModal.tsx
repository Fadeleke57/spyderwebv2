/// <reference types="chrome" />

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { googleIcon } from "../utility/Icons";
import { environment } from "@/environment/load_env";
import { DialogClose, DialogTitle } from "@radix-ui/react-dialog";
import { useCheckEmailExists } from "@/hooks/user";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import Image from "next/image";
import { useSubmitLogin, useSubmitRegister } from "@/hooks/auth";
import sLogo from "@/assets/slogonobg.png";
import { useRouter } from "next/router";

const emailSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

const loginSchema = z.object({
  email: z.string().email(), // will be pre-filled, but good to keep for direct use
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

const registerSchema = z.object({
  email: z.string().email(), // will be pre-filled
  username: z
    .string()
    .min(6, { message: "Username must be at least 6 characters" })
    .max(14, { message: "Username must be less than 14 characters" })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "Username can only contain letters, numbers, and underscores",
    }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

type AuthModalProps = {
  type?: "login" | "register" | "like" | "iterate";
  referrer?: string; // Optional
  open: boolean;
  setOpen: (open: boolean) => void;
};

type EmailSubmission = z.infer<typeof emailSchema>;
type LoginSubmission = z.infer<typeof loginSchema>;
type RegisterSubmission = z.infer<typeof registerSchema>;

export function AuthModal({ open, setOpen }: AuthModalProps) {
  const [step, setStep] = useState("email"); // 'email', 'login', 'register'
  const [userEmail, setUserEmail] = useState("");
  const router = useRouter();
  const { toast } = useToast();

  const { mutateAsync: checkEmailExists, isPending: isCheckingEmail } =
    useCheckEmailExists();
  const { mutateAsync: submitLogin, isPending: isLoggingIn } = useSubmitLogin();
  const { mutateAsync: submitRegister, isPending: isRegistering } =
    useSubmitRegister();

  const emailForm = useForm<EmailSubmission>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const loginForm = useForm<LoginSubmission>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<RegisterSubmission>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", username: "", password: "" },
  });

  useEffect(() => {
    if (step === "email") {
      loginForm.reset({ email: "", password: "" });
      registerForm.reset({ email: "", username: "", password: "" });
    } else if (step === "login") {
      loginForm.setValue("email", userEmail);
    } else if (step === "register") {
      registerForm.setValue("email", userEmail);
    }
  }, [step, userEmail, loginForm, registerForm]);

  const handleGoogleSignIn = () => {
    window.location.href = `https://${environment.environment == "dev" ? "test" : "api"}.stytch.com/v1/public/oauth/google/start?public_token=${environment.stytch_public_token}`;
  };

  const onEmailSubmit = async (data: EmailSubmission) => {
    try {
      const exists = await checkEmailExists(data.email);
      setUserEmail(data.email);

      if (exists) {
        loginForm.setValue("email", data.email);
        setStep("login");
      } else {
        registerForm.setValue("email", data.email);
        setStep("register");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to verify email. Please try again.",
        variant: "destructive",
      });
      console.error("Email check error:", error);
    }
  };

  const onLoginSubmit = async (data: LoginSubmission) => {
    await submitLogin(data);
  };

  const onRegisterSubmit = async (data: RegisterSubmission) => {
      await submitRegister({
        email: data.email,
        username: data.username,
        password: data.password,
      });
  };

  const handleBackToEmailStep = () => {
    setStep("email");
    setUserEmail("");
    emailForm.reset({ email: "" }); // Reset the email form as well
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="h-dvh max-w-screen rounded-none flex flex-col justify-center items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <DialogClose />
        <DialogHeader className="w-full text-center mb-6">
          <div className="flex flex-col items-center justify-center mb-4">
            <Image
              src={sLogo}
              className="w-14 h-14 mb-3 rotate-45" // Slightly smaller
              alt="Spydr Logo"
            />
            <DialogTitle className="text-xl font-semibold">
              {step === "login"
                ? "Welcome back"
                : step === "register"
                  ? "Create your account"
                  : "A New Age of Understanding"}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-1">
              {step === "login"
                ? `Logging in as ${userEmail}`
                : step === "register"
                  ? `Joining with ${userEmail}`
                  : "Enter your email or continue with Google."}
            </DialogDescription>
          </div>
        </DialogHeader>

        {step === "email" && (
          <Form {...emailForm}>
            <form
              onSubmit={emailForm.handleSubmit(onEmailSubmit)}
              className="max-w-lg w-full space-y-6"
            >
              <Button
                type="button"
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
                onClick={handleGoogleSignIn}
              >
                {googleIcon}
                Continue with Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <FormField
                control={emailForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="you@example.com"
                        data-testid="email-input"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={isCheckingEmail}
                data-testid="continue-with-email"
              >
                {isCheckingEmail ? "Verifying..." : "Continue with Email"}
              </Button>
              <div className="pt-2 text-xs text-center text-muted-foreground">
                By continuing, you agree to our{" "}
                <Link
                  href="/about/terms-of-service"
                  className="underline hover:text-primary"
                >
                  Terms
                </Link>{" "}
                and{" "}
                <Link
                  href="/about/privacy-policy"
                  className="underline hover:text-primary"
                >
                  Privacy Policy
                </Link>
                .
              </div>
            </form>
          </Form>
        )}

        {step === "login" && (
          <Form {...loginForm}>
            <form
              onSubmit={loginForm.handleSubmit(onLoginSubmit)}
              className="max-w-lg w-full space-y-6"
            >
              {/* Email is shown in DialogDescription, no need to disable input if it's there */}
              <FormField
                control={loginForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        readOnly
                        disabled
                        className="bg-muted"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="Enter your password"
                        data-testid="password-input"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={isLoggingIn}
                data-testid="login-button"
              >
                {isLoggingIn ? "Signing In..." : "Sign In"}
              </Button>
              <Button
                type="button"
                variant="link"
                className="w-full text-sm"
                onClick={handleBackToEmailStep}
              >
                Use a different email
              </Button>
            </form>
          </Form>
        )}

        {step === "register" && (
          <Form {...registerForm}>
            <form
              onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
              className="max-w-lg w-full space-y-6"
            >
              <FormField
                control={registerForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        readOnly
                        disabled
                        className="bg-muted"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={registerForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        placeholder="Choose a username"
                        data-testid="username-input"
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      {/* ShadCN UI uses FormDescription for hints */}
                      6-14 characters. Letters, numbers, and underscores only.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={registerForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="Create a password (min. 6 characters)"
                        data-testid="new-password-input"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={isRegistering}
                data-testid="create-account-button"
              >
                {isRegistering ? "Creating Account..." : "Create Account"}
              </Button>
              <Button
                type="button"
                variant="link"
                className="w-full text-sm"
                onClick={handleBackToEmailStep}
              >
                Use a different email
              </Button>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default AuthModal;

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogClose,
} from "@/components/ui/dialog";
import { AuthHeader } from "./AuthHeader";
import { EmailStepForm } from "./forms/EmailStepForm";
import { LoginForm } from "./forms/LoginForm";
import { RegisterForm } from "./forms/RegisterForm";
import { useToast } from "@/components/ui/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useStytch } from "@stytch/nextjs";
import { useRouter } from "next/router";
import { useCheckEmailExists } from "@/hooks/user";
import { useSubmitRegister } from "@/hooks/auth";

const emailSchema = z.object({
  email: z.string().email(),
});
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
const registerSchema = z.object({
  email: z.string().email().describe("Please enter a valid email address."),
  username: z
    .string()
    .min(6)
    .max(14)
    .regex(/^[a-zA-Z0-9_]+$/)
    .describe("Username can only contain letters, numbers, and underscores."),
  password: z
    .string()
    .min(6)
    .describe("Password must be at least 6 characters"),
});

type AuthModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export const SESSION_MINUTES = 10080;

export function AuthModal({ open, setOpen }: AuthModalProps) {
  const [step, setStep] = useState("email");
  const [userEmail, setUserEmail] = useState("");
  const { toast } = useToast();
  const router = useRouter();
  const client = useStytch();

  const { mutateAsync: checkEmailExists, isPending: isCheckingEmail } =
    useCheckEmailExists();
  const { mutateAsync: submitRegister, isPending: isRegistering } =
    useSubmitRegister();

  const emailForm = useForm({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", username: "", password: "" },
  });

  useEffect(() => {
    if (step === "login") loginForm.setValue("email", userEmail);
    if (step === "register") registerForm.setValue("email", userEmail);
  }, [step, userEmail, loginForm, registerForm]);

  const onEmailSubmit = async (data: any) => {
    try {
      const exists = await checkEmailExists(data.email);
      setUserEmail(data.email);
      setStep(exists ? "login" : "register");
    } catch (err) {
      toast({
        title: "Error",
        description: "Email verification failed",
        variant: "destructive",
      });
    }
  };

  const onLoginSubmit = async (data: any) => {
    try {
      const response = await client.passwords.authenticate({
        email: data.email,
        password: data.password,
        session_duration_minutes: SESSION_MINUTES,
      });
      if (response.session) {
        toast({ title: "Login successful", variant: "default" });
        const returnTo = localStorage.getItem("returnTo");
        if (returnTo) {
          localStorage.removeItem("returnTo");
          window.location.href = returnTo;
        } else {
          window.location.href = "/home?src=login";
        }
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const mapStytchErrorToToast = (message: string) => {
    if (message.includes("invalid_email")) {
      toast({
        title: "Error Creating Account",
        description: "Invalid email",
        variant: "destructive",
      });
    } else if (message.includes("weak_password")) {
      toast({
        title: "Error Creating Account",
        description: "Please use a stronger password.",
        variant: "destructive",
      });
    } else if (message.includes("duplicate_email")) {
      toast({
        title: "Error Creating Account",
        description: "This email is associated with an existing account.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Error Creating Account",
        description: "Failed to create account",
        variant: "destructive",
      });
    }
  };

  const onRegisterSubmit = async (data: any) => {
    let response;
    try {
      response = await client.passwords.create({
        email: data.email,
        password: data.password,
        session_duration_minutes: SESSION_MINUTES,
      });
    } catch (err: any) {
      mapStytchErrorToToast(err.message);
    }

    if (response && response.session) {
      await submitRegister({
        email: data.email,
        username: data.username,
        password: data.password,
        stytchUserId: response.user_id,
      });
    }
  };

  const resetToEmail = () => {
    setStep("email");
    setUserEmail("");
    emailForm.reset({ email: "" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="h-dvh max-w-screen rounded-none flex flex-col justify-center items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <DialogClose />
        <DialogHeader className="w-full text-center mb-6">
          <AuthHeader step={step} email={userEmail} />
        </DialogHeader>

        {step === "email" && (
          <EmailStepForm
            form={emailForm}
            onSubmit={onEmailSubmit}
            isPending={isCheckingEmail}
          />
        )}

        {step === "login" && (
          <LoginForm
            form={loginForm}
            onSubmit={onLoginSubmit}
            isPending={false}
            onBack={resetToEmail}
          />
        )}

        {step === "register" && (
          <RegisterForm
            form={registerForm}
            onSubmit={onRegisterSubmit}
            isPending={isRegistering}
            onBack={resetToEmail}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

export default AuthModal;

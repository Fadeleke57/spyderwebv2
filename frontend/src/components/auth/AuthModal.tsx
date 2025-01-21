import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { googleIcon } from "../utility/Icons";
import { environment } from "@/environment/load_env";
import { useRouter } from "next/router";
import { DialogClose, DialogTitle } from "@radix-ui/react-dialog";
import { useCheckEmailExists } from "@/hooks/user";
import { useToast } from "@/components/ui/use-toast";
import api from "@/lib/api";
import { useIsMobile } from "@/hooks/use-mobile";
import Link from "next/link";

const emailSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

const registerSchema = z.object({
  email: z.string().email(),
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
  type: string;
  referrer: string;
  open: boolean;
  setOpen: (open: boolean) => void;
};
type EmailSubmission = {
  email: string;
};

type LoginSubmission = {
  email: string;
  password: string;
};

type RegisterSubmission = {
  email: string;
  username: string;
  password: string;
};

export function AuthModal({ type, referrer, open, setOpen }: AuthModalProps) {
  const [step, setStep] = useState("email");
  const [userEmail, setUserEmail] = useState("");
  const [isExistingUser, setIsExistingUser] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const isMobile = useIsMobile();
  const { mutateAsync: doesEmailExist } = useCheckEmailExists();

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

  const handleGoogleSignIn = () => {
    window.location.href = `${environment.api_url}/auth/login/google`;
  };

  const onEmailSubmit = async (data: EmailSubmission) => {
    try {
      const exists = await doesEmailExist(data.email);
      setUserEmail(data.email);
      setIsExistingUser(exists);
      setStep("auth");

      if (exists) {
        loginForm.setValue("email", data.email);
      } else {
        registerForm.setValue("email", data.email);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to verify email. Please try again.",
        variant: "destructive",
      });
    }
  };

  const onLoginSubmit = async (data: LoginSubmission) => {
    try {
      const response = await api.post(
        "/auth/token",
        new URLSearchParams({
          username: data.email,
          password: data.password,
        }).toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      if (response.status === 200) {
        localStorage.setItem("token", response.data.access_token);
        setOpen(false);
        toast({
          title: "Success",
          description: "Login successful!",
        });
        window.location.href = "/home";
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Invalid email or password.",
        variant: "destructive",
      });
    }
  };

  const onRegisterSubmit = async (data: RegisterSubmission) => {
    try {
      const response = await api.post("/auth/register", {
        email: data.email,
        username: data.username,
        password: data.password,
      });

      if (response.status === 201) {
        localStorage.setItem("token", response.data.access_token);

        toast({
          title: "Success",
          description: "Registration successful!",
        });
        setOpen(false);
        window.location.href = "/home";
      }
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error?.response?.data?.detail || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="max-w-[100vw] md:max-w-[80vw] lg:max-w-[60vw] h-dvh md:h-[80vh] lg:h-[80vh] rounded-none flex flex-col justify-center items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <DialogClose />
        <div>
          <DialogTitle className="text-center text-2xl font-bold">
            {isExistingUser && step !== "email"
              ? "Welcome back"
              : "A New Age of Ideation"}
          </DialogTitle>
          <DialogDescription className="text-center text-md font-medium">
            {isExistingUser && step === "email"
              ? "Enter your email or continue with Google"
              : step === "auth" && isExistingUser
              ? "Login to continue to your account"
              : "Join the community"}
          </DialogDescription>
        </div>

        {step === "email" ? (
          <Form {...emailForm}>
            <form
              onSubmit={emailForm.handleSubmit(onEmailSubmit)}
              className="w-full md:w-[400px]"
            >
              <div className="flex flex-col gap-6">
                <Button
                  type="button"
                  className="flex flex-row gap-2"
                  onClick={handleGoogleSignIn}
                >
                  {googleIcon}
                  Continue with Google
                </Button>

                <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                  <span className="relative z-10 bg-background px-2 text-muted-foreground">
                    or
                  </span>
                </div>

                <div className="flex flex-col gap-6">
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
                            placeholder="marginalia@example.com"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button variant="secondary" type="submit" className="w-full">
                    Continue with Email
                  </Button>
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
          </Form>
        ) : isExistingUser ? (
          <Form {...loginForm}>
            <form
              onSubmit={loginForm.handleSubmit(onLoginSubmit)}
              className="w-full md:w-[400px]"
            >
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <FormLabel>Email</FormLabel>
                  <div className="px-4 py-2 bg-muted rounded-md">
                    {userEmail}
                  </div>
                </div>

                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your password"
                          {...field}
                          type="password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button variant="secondary" type="submit" className="w-full">
                  Sign In
                </Button>

                <Button
                  type="button"
                  variant="link"
                  className="text-sm"
                  onClick={() => {
                    setStep("email");
                    setUserEmail("");
                    emailForm.reset();
                    loginForm.reset();
                  }}
                >
                  Use a different email
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <Form {...registerForm}>
            <form
              onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
              className="w-full md:w-[400px]"
            >
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <FormLabel>Email</FormLabel>
                  <div className="px-4 py-2 bg-muted rounded-md">
                    {userEmail}
                  </div>
                </div>

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
                          placeholder="Enter a username"
                        />
                      </FormControl>
                      <FormLabel className="text-xs font-normal">
                        Username must be unique and must be between 6-14
                        characters long
                      </FormLabel>
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
                          placeholder="Enter a password"
                          {...field}
                          type="password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button variant="secondary" type="submit" className="w-full">
                  Create Account
                </Button>

                <Button
                  type="button"
                  variant="link"
                  className="text-sm"
                  onClick={() => {
                    setStep("email");
                    setUserEmail("");
                    emailForm.reset();
                    registerForm.reset();
                  }}
                >
                  Use a different email
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default AuthModal;

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/lib/api";
import { useRouter } from "next/router";
import Link from "next/link";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormItem,
  FormField,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { googleIcon } from "@/components/utility/Icons";
import { environment } from "@/environment/load_env";
import { ReactElement, useEffect } from "react";
import PublicLayout from "@/app/PublicLayout";
import AppLayout from "@/app/AppLayout";
import Head from "next/head";
import { useIsMobile } from "@/hooks/use-mobile";

const registerSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),
});

type RegisterFormInputs = z.infer<typeof registerSchema>;

const Register = () => {
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
  });
  const isMobile = useIsMobile();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/explore");
    }
  }, [router]);

  async function onSubmit(values: RegisterFormInputs) {
    try {
      const response = await api.post("/auth/register", values);
      if (response.status === 201) {
        toast({
          title: "Registration successful",
          description: "Redirecting..",
        });
        localStorage.setItem("token", response.data.access_token);
        window.location.href = isMobile ? "/buckets" : "/home";
      }
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error?.response?.data?.detail
          ? error?.response?.data?.detail
          : "Something went wrong",
        variant: "destructive",
      });
    }
  }

  const handleGoogleSignUp = () => {
    window.location.href = `${environment.api_url}/auth/login/google`;
  };

  return (
    <div className="w-full flex flex-col items-center justify-center p-6 lg:pt-20">
      <Head>
        <title>{"register - spydr"}</title>
        <meta
          property="og:url"
          content={`${
            typeof window !== "undefined" ? window.location.href : ""
          }`}
        />
      </Head>
      <Card className="max-w-[500px] border-none shadow-none">
        <CardHeader>
          <CardTitle className="font-bold mb-2">
            <span className="text-slate-400">like it? save it.</span>
            <br></br>create a spydr account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid w-full items-center gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          id="email"
                          type="email"
                          placeholder="johndoe@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <br />
                      <small>*Something short and memorable*</small>
                      <FormControl>
                        <Input
                          id="username"
                          type="text"
                          placeholder="hungryoctopus891"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Enter your password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">Register</Button>
                <div className="flex flex-row items-center">
                  <div className="flex-grow">
                    <Separator />
                  </div>
                  <div className="px-2">
                    <small className="text-sm font-medium leading-none text-muted-foreground">
                      OR CONTINUE WITH
                    </small>
                  </div>
                  <div className="flex-grow">
                    <Separator />
                  </div>
                </div>
                <Button
                  variant="outline"
                  type="button"
                  onClick={handleGoogleSignUp}
                >
                  {googleIcon}
                  <span className="ml-2">Sign up with Google</span>
                </Button>
                <p>
                  Already have an account?{" "}
                  <Link href="/auth/login" className="text-blue-500">
                    Login
                  </Link>
                </p>
                <div className="text-balance text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary  ">
                  By clicking continue, you agree to our{" "}
                  <Link href="/about/terms-of-service">Terms of Service</Link>{" "}
                  and <Link href="/about/privacy-policy">Privacy Policy</Link>.
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

Register.getLayout = (page: ReactElement) => {
  return <PublicLayout>{page}</PublicLayout>;
};

export default Register;

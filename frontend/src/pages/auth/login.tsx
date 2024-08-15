import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter } from "next/router";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { googleIcon } from "@/components/utility/Icons";


const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email" }),
  password: z
    .string()
    .min(1, { message: "Password is required" })
    .min(8, { message: "Password must be at least 8 characters" }),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

const Login = () => {
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    try {
      const response = await axios.post(
        "http://localhost:8000/auth/token",
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
        toast({
          title: "Login successful",
          description: "Redirecting to the terminal.",
        });
        localStorage.setItem("token", response.data.access_token);
        router.push("/terminal");
      }
    } catch (error) {
      console.error("Login failed", error);
      toast({
        title: "Login Failed",
        description: "Invalid email or password.",
        variant: "destructive",
      });
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = "http://localhost:8000/auth/login/google";
    toast({
      title: "Login successful",
      description: "Redirecting to the terminal.",
    });
  };

  return (
    <div className="w-full flex items-center justify-center h-screen">
      <Card className="w-[500px]">
        <CardHeader>
          <CardTitle className="font-bold mb-2">Login to Spydr</CardTitle>
          <CardDescription>
            Enter your email and password below to continue
          </CardDescription>
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
                <Button type="submit">Login</Button>
                <div className="flex flex-row items-center">
                  <div className="flex-grow">
                    <Separator />
                  </div>
                  <div className="px-2">
                    <small className="text-sm font-medium leading-none text-muted-foreground">
                      OR CONTINUE WITH GOOGLE
                    </small>
                  </div>
                  <div className="flex-grow">
                    <Separator />
                  </div>
                </div>
                <Button
                  variant="outline"
                  type="button"
                  onClick={handleGoogleSignIn}
                >
                  {googleIcon}
                  <span className="ml-2">Login with Google</span>
                </Button>
                <p>
                  Don&apos;t have an account?{" "}
                  <Link href="/auth/register" className="text-blue-500">
                    Register
                  </Link>
                </p>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;

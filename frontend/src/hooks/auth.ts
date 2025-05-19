import api from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/router"; // Assuming Next.js for router

// Types from your backend Pydantic models for clarity
type BackendRegisterRequest = {
  email: string;
  password: string;
  username: string;
  fullName?: string;
};

type BackendLoginRequest = {
  email: string;
  password: string;
};

type BackendRegisterResponse = {
  message: string;
  userId: string;
  webId: string;
};

type BackendLoginResponse = {
  message: string;
};

type OnboardingPayload = {
  firstName: string;
  lastName?: string;
  username: string;
  bio?: string;
  occupation: string;
  company?: string;
  purpose: string;
  interest?: string;
};

export function useSubmitLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<BackendLoginResponse, Error, BackendLoginRequest>({
    mutationFn: async (loginPayload) => {
      const response = await api.post(`/auth/login`, loginPayload);
      return response.data;
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: data.message || "Logged in successfully!",
      });
      // Invalidate user queries to refetch user data
      queryClient.invalidateQueries({ queryKey: ["user", "me"] });
      // Redirect to home or dashboard
      // The backend sets HttpOnly cookies, so no client-side token storage needed here.
      router.push("/home"); // Or your desired redirect path
    },
    onError: (error: any) => {
      toast({
        title: "Login Failed",
        description:
          error?.response?.data?.detail || "Invalid email or password.",
        variant: "destructive",
      });
      console.error("Login error:", error);
    },
  });
}

export function useSubmitRegister() {
  const queryClient = useQueryClient();
  // No automatic redirect from the hook, let the component handle it with userId and webId

  return useMutation<BackendRegisterResponse, Error, BackendRegisterRequest>({
    mutationFn: async (registerPayload) => {
      const response = await api.post(`/auth/register`, registerPayload);
      return response.data;
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: data.message || "Registration successful!",
      });
      // Invalidate user queries if needed, or let the onboarding process handle user state.
      // The backend sets HttpOnly Stytch cookies.
      // The component calling this mutation will handle the redirect to onboarding.
      queryClient.invalidateQueries({ queryKey: ["user", "me"] });
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error?.response?.data?.detail || "Something went wrong.",
        variant: "destructive",
      });
      console.error("Registration error:", error);
    },
  });
}

export function useCompleteOnboarding() {
  return useMutation({
    mutationFn: async (onboardingPayload: OnboardingPayload) => {
      const response = await api.post(`/auth/onboarding`, onboardingPayload);
      const data = await response.data.result;
      return data;
    },
    onError: (err: any) => {
      console.error(err);
    },
  });
}

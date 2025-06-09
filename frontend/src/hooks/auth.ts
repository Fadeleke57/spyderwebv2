import { api, mcpAPI } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { AxiosError } from "axios";

type BackendRegisterRequest = {
  email: string;
  password: string;
  username: string;
  fullName?: string;
  stytchUserId: string;
};

type BackendRegisterResponse = {
  message: string;
  userId: string;
  webId: string;
  email: string;
  username: string;
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

export function useSubmitRegister() {
  const queryClient = useQueryClient();
  return useMutation<
    BackendRegisterResponse,
    AxiosError,
    BackendRegisterRequest
  >({
    mutationFn: async (registerPayload) => {
      const response = await api.post(`/auth/register`, registerPayload);
      return response.data;
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: data.message || "Registration successful!",
      });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast({ title: "Registration complete", variant: "default" });
      const returnTo = localStorage.getItem("returnTo");
      if (returnTo) {
        localStorage.removeItem("returnTo");
        window.location.href = returnTo;
      } else {
        window.location.href = `/auth/onboarding?email=${encodeURIComponent(data.email)}&username=${encodeURIComponent(data.username)}&isGoogleSignup=false&defaultWebId=${data.webId}`;
      }
    },
    onError: (error: AxiosError) => {
      console.log(error);
      toast({
        title: mapErrorCode(error.response?.status as number),
        description: "Please try again.",
        variant: "destructive",
      });
      console.error("Registration error:", error);
    },
  });
}

type CompleteOauthRequest = {
  stytchUserId: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePictureUrl: string;
};

export function useCompleteOauth() {
  return useMutation({
    mutationFn: async (payload: CompleteOauthRequest) => {
      console.log("Sending OAuth completion request:", payload);
      const response = await api.post(`/auth/authenticate`, payload);
      console.log("OAuth completion response:", response.data);
      return response.data.redirect;
    },
    onSuccess: (redirectUrl) => {
      console.log("OAuth completion successful, redirect URL:", redirectUrl);
    },
    onError: (error: any) => {
      console.error("OAuth completion error:", error);
      toast({
        title: "Authentication Error",
        description: "Authentication failed",
        variant: "destructive",
      });
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

const mapErrorCode = (code: number) => {
  switch (code) {
    case 400:
      return "Username already exists.";
    case 401:
      return "Invalid email or password.";
    case 403:
      return "Forbidden";
    case 404:
      return "Not Found";
    case 500:
      return "Please use a stronger password.";
    default:
      return "Unknown Error";
  }
};

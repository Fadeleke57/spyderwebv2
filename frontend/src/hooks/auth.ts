import api from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/router";
import { AxiosError } from "axios";

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
  email: string;
  username: string;
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
      queryClient.invalidateQueries({ queryKey: ["user"] });
      window.location.href = "/home";
    },
    onError: (error: any) => {
      toast({
        title: "Login Failed",
        description: mapErrorCode(error.response?.status as number),
        variant: "destructive",
      });
      console.error("Login error:", error);
    },
  });
}

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
      window.location.href = `/auth/onboarding?email=${encodeURIComponent(data.email)}&username=${encodeURIComponent(data.username)}&isGoogleSignup=false&defaultWebId=${data.webId}`;
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

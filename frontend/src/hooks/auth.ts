import api from "@/lib/api";
import { useMutation } from "@tanstack/react-query";

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

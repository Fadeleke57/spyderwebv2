import { PostHog } from "posthog-node";
import { environment } from "@/environment/loadenv";

export default function PostHogClient() {
  const posthogClient = new PostHog(environment.posthog_key!, {
    host: environment.posthog_host,
    flushAt: 1,
    flushInterval: 0,
  });
  return posthogClient;
}

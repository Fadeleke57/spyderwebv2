import { useRouter } from "next/router";
import { useRef, useEffect } from "react";

export const usePreviousRoute = () => {
  const router = useRouter();
  const previousRoute = useRef<string | null>(null);

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      previousRoute.current = router.asPath;
    };

    router.events.on("routeChangeStart", handleRouteChange);
    return () => router.events.off("routeChangeStart", handleRouteChange);
  }, [router.events, router.asPath]);

  return previousRoute.current;
};

import React, { useEffect } from "react";
import PublicLayout from "@/app/PublicLayout";
import { useRouter } from "next/router";
import { useAuthenticate } from "@/hooks/auth";

export default function Page() {
  const router = useRouter();
  const { stytch_token_type, token } = router.query;
  const { mutateAsync: authenticate } = useAuthenticate();
  useEffect(() => {
    if (token && stytch_token_type) {
      const result = authenticate({
        token: token as string,
        stytch_token_type: stytch_token_type as string,
      });
    }
  });
  return (
    <div className="h-screen flex items-center justify-center">
      authenticate
    </div>
  );
}

Page.getLayout = function getLayout(page: React.ReactNode) {
  return <PublicLayout>{page}</PublicLayout>;
};

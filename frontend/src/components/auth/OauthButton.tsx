import { Button } from "@/components/ui/button";
import { googleIcon } from "@/components/utility/Icons";
import { useStytch } from "@stytch/nextjs";
import { environment } from "@/environment/load_env";

export const OAuthButton = () => {
  const client = useStytch();
  const handleGoogleSignIn = () => {
    client.oauth.google.start({
      login_redirect_url: `${environment.client_url}/auth/authenticate`,
      signup_redirect_url: `${environment.client_url}/auth/authenticate`,
    });
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full flex items-center justify-center gap-2"
      onClick={handleGoogleSignIn}
    >
      {googleIcon} Continue with Google
    </Button>
  );
};

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const LoginForm = ({
  form,
  onSubmit,
  isPending,
  onBack,
}: {
  form: any;
  onSubmit: (data: any) => Promise<void>;
  isPending: boolean;
  onBack: () => void;
}) => (
  <Form {...form}>
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="max-w-lg w-full space-y-6"
    >
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input
                {...field}
                type="email"
                readOnly
                disabled
                className="bg-muted"
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
                {...field}
                type="password"
                placeholder="Enter your password"
                data-testid="password-input"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <Button
        type="submit"
        className="w-full"
        disabled={isPending}
        data-testid="login-button"
      >
        {isPending ? "Signing In..." : "Sign In"}
      </Button>
      <Button
        type="button"
        variant="link"
        className="w-full text-sm"
        onClick={onBack}
      >
        Use a different email
      </Button>
    </form>
  </Form>
);

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const RegisterForm = ({
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
        name="username"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Username</FormLabel>
            <FormControl>
              <Input
                {...field}
                type="text"
                placeholder="Choose a username"
                data-testid="username-input"
              />
            </FormControl>
            <FormDescription className="text-xs">
              6-14 characters. Letters, numbers, and underscores only.
            </FormDescription>
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
                placeholder="Create a password (min. 6 characters)"
                data-testid="new-password-input"
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
        data-testid="create-account-button"
      >
        {isPending ? "Creating Account..." : "Create Account"}
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

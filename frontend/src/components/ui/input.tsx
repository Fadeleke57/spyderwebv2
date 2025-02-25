import * as React from "react";

import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 caret-violet-500",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

const SearchInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    const [active, setActive] = React.useState(false);
    return (
      <div
        className={cn(
          "rounded-md flex items-center border-2 pl-4 transition-all duration-150 ease-in-out",
          active
            ? "border-foreground shadow-[0_0_10px_rgba(var(--foreground),0.3)] dark:shadow-[0_0_10px_rgba(var(--foreground),0.2)]"
            : "border-input"
        )}
        onClick={() => setActive(true)}
      >
        <Search
          size={16}
          className={cn(
            "transition-colors duration-300",
            active
              ? "text-foreground"
              : "text-muted-foreground dark:text-foreground"
          )}
        />
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md bg-background px-3 py-2 text-sm focus-visible:outline-none file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 autofill:bg-none",
            className
          )}
          ref={ref}
          onFocus={() => setActive(true)}
          onBlur={() => setActive(false)}
          {...props}
        />
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";

export { Input, SearchInput };

import Link from "next/link";
import React, { memo, useState } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { Button } from "../ui/button";
import { Check, Copy } from "lucide-react";
import SimpleTooltip from "../utility/SimpleTooltip";

const CodeBlock = ({ className, match, children, ...props }: any) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    const code = typeof children === "string" ? children : String(children);
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <ScrollArea className="w-full">
        <pre
          {...props}
          className={`${className} text-sm w-full bg-zinc-100 p-3 rounded-lg mt-2 dark:bg-zinc-800`}
        >
          <code className={match[1]}>{children}</code>
        </pre>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <SimpleTooltip content="Copy">
      <Button
        size="sm"
        onClick={handleCopy}
        className="absolute -bottom-4 right-2 h-fit w-fit p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
      >
        <div className="relative w-4 h-4">
          <Copy
            size={16}
            className={`absolute inset-0 transition-all duration-300 ${isCopied ? "opacity-0 scale-50" : "opacity-100 scale-100"}`}
          />
          <Check
            size={16}
            className={`absolute inset-0 transition-all duration-300 ${isCopied ? "opacity-100 scale-100" : "opacity-0 scale-50"}`}
          />
        </div>
      </Button>
      </SimpleTooltip>
    </div>
  );
};

const NonMemoizedMarkdown = ({ children }: { children: string }) => {
  const components: Partial<Components> = {
    // @ts-expect-error
    code: ({ node, inline, className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || "");
      return !inline && match ? (
        <CodeBlock match={match} className={className} {...props}>
          {children}
        </CodeBlock>
      ) : (
        <code
          className={`${className} text-sm bg-zinc-100 dark:bg-zinc-800 py-0.5 px-1 rounded-md`}
          {...props}
        >
          {children}
        </code>
      );
    },
    ol: ({ node, children, ...props }) => {
      return (
        <ol className="list-decimal list-outside ml-4" {...props}>
          {children}
        </ol>
      );
    },
    li: ({ node, children, ...props }) => {
      return (
        <li className="py-1" {...props}>
          {children}
        </li>
      );
    },
    ul: ({ node, children, ...props }) => {
      return (
        <ul className="list-decimal list-outside ml-4" {...props}>
          {children}
        </ul>
      );
    },
    strong: ({ node, children, ...props }) => {
      return (
        <span className="font-semibold" {...props}>
          {children}
        </span>
      );
    },
    a: ({ node, children, ...props }) => {
      return (
        // @ts-expect-error
        <Link
          className="text-blue-500 hover:underline"
          target="_blank"
          rel="noreferrer"
          {...props}
        >
          {children}
        </Link>
      );
    },
    h1: ({ node, children, ...props }) => {
      return (
        <h1 className="text-3xl font-semibold mt-6 mb-2" {...props}>
          {children}
        </h1>
      );
    },
    h2: ({ node, children, ...props }) => {
      return (
        <h2 className="text-2xl font-semibold mt-6 mb-2" {...props}>
          {children}
        </h2>
      );
    },
    h3: ({ node, children, ...props }) => {
      return (
        <h3 className="text-xl font-semibold mt-6 mb-2" {...props}>
          {children}
        </h3>
      );
    },
    h4: ({ node, children, ...props }) => {
      return (
        <h4 className="text-lg font-semibold mt-6 mb-2" {...props}>
          {children}
        </h4>
      );
    },
    h5: ({ node, children, ...props }) => {
      return (
        <h5 className="text-base font-semibold mt-6 mb-2" {...props}>
          {children}
        </h5>
      );
    },
    h6: ({ node, children, ...props }) => {
      return (
        <h6 className="text-sm font-semibold mt-6 mb-2" {...props}>
          {children}
        </h6>
      );
    },
    p: ({ node, children, ...props }) => {
      return (
        <p className="whitespace-pre-wrap break-words" {...props}>
          {children}
        </p>
      );
    },
  };

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {children}
    </ReactMarkdown>
  );
};

export const Markdown = memo(
  NonMemoizedMarkdown,
  (prevProps, nextProps) => prevProps.children === nextProps.children,
);

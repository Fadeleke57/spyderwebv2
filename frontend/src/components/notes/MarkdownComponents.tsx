import { Loader2 } from "lucide-react";
import { Components } from "react-markdown";

export const MarkdownComponents: Components = {
  img: ({ node, ...props }) => {
    const src = props.src || "";
    if (src.startsWith("loading-")) {
      const imageId = src.replace("loading-", "");
      return (
        <span className="inline-flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          {props.alt}
        </span>
      );
    }
    return <img alt="" {...props} className="max-w-full h-auto my-0 py-0" />;
  },
  p: ({ children }) => (
    <p className="whitespace-pre-wrap my-0 py-0">{children}</p>
  ),
  h1: ({ children }) => (
    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl my-0 py-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-3xl font-semibold tracking-tight my-0 py-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-2xl font-semibold tracking-tight my-0 py-0">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="text-xl font-semibold tracking-tight my-0 py-0">
      {children}
    </h4>
  ),
  h5: ({ children }) => (
    <h5 className="text-lg font-semibold tracking-tight my-0 py-0">
      {children}
    </h5>
  ),
  h6: ({ children }) => <h6 className="font-semibold my-0 py-0">{children}</h6>,
  ul: ({ children }) => <ul className="-my-[21px] py-0">{children}</ul>,
  ol: ({ children }) => (
    <ol className="list-decimal list-inside my-0 py-0">{children}</ol>
  ),
  li: ({ children }) => <li className="-my-2 py-0">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 pl-4 italic text-muted-foreground my-0 py-0">
      {children}
    </blockquote>
  ),
  code: ({ children }) => (
    <code className="bg-muted px-1 py-0.5 rounded my-0 py-0">{children}</code>
  ),
  pre: ({ children }) => (
    <pre className="bg-muted p-2 rounded my-0 py-0 overflow-x-auto">
      {children}
    </pre>
  ),
  hr: () => <hr className="border-border my-0 py-0" />,
  a: ({ children, ...props }) => (
    <a
      {...props}
      className="text-violet-40/80 underline hover:text-violet-400 my-0 py-0"
    >
      {children}
    </a>
  ),
  table: ({ children }) => (
    <table className="w-full border-collapse border border-border my-0 py-0">
      {children}
    </table>
  ),
  thead: ({ children }) => (
    <thead className="bg-muted my-0 py-0">{children}</thead>
  ),
  tbody: ({ children }) => <tbody className="my-0 py-0">{children}</tbody>,
  tr: ({ children }) => (
    <tr className="border-b border-border my-0 py-0">{children}</tr>
  ),
  th: ({ children }) => (
    <th className="p-2 text-left font-semibold my-0 py-0">{children}</th>
  ),
  td: ({ children }) => <td className="p-2 my-0 py-0">{children}</td>,
};

import React, { ReactElement } from "react";
import PublicLayout from "@/app/PublicLayout";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { CodeBlock } from "@/components/chat/markdown";
import { cn } from "@/lib/utils";
import { mcp_clients, match } from "@/components/utility/MCPOnboardModal";

function Index() {
  const [selectedClient, setSelectedClient] = React.useState("claude");
  const [isCopied, setIsCopied] = React.useState(false);
  const handleCopy = (children: React.ReactNode) => {
    const text = typeof children === "string" ? children : String(children);
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };
  return (
    <div className="container min-h-screen mx-auto py-16">
      <div className="grid grid-cols-2 gap-8">
        {/* Left Column - Title/Description */}
        <div>
          <h1 className="text-5xl font-[1000] mt-10">
            Build Once. Use Everywhere.
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground mt-4">
            Break free from the constant copy-paste cycle. The siloed nature of
            how you interact with AI is a thing of the past. With{" "}
            <span className="font-semibold text-foreground">
              Spydr Memory MCP
            </span>
            , your knowledge flows seamlessly across{" "}
            <Link
              href="https://claude.ai/download"
              className="hover:underline text-violet-400"
              target="_blank"
            >
              Claude
            </Link>
            ,{" "}
            <Link
              href="https://windsurf.com/"
              className="hover:underline text-violet-400"
              target="_blank"
            >
              Windsurf
            </Link>
            ,{" "}
            <Link
              href="https://cursor.sh/"
              className="hover:underline text-violet-400"
              target="_blank"
            >
              Cursor
            </Link>
            , and every MCP-compatible platform.{" "}
            <span className="font-semibold text-foreground ">Multi-modal,</span>{" "}
            <span className="font-semibold text-foreground ">Efficient,</span>{" "}
            <span className="font-semibold text-foreground ">Simple,</span> and{" "}
            <span className="font-semibold text-foreground ">Free</span>.
          </p>
        </div>
        {/* Right Column - Steps */}
        <div className="flex flex-col gap-2">
          <span className="text-md font-semibold">
            Select the client you&apos;d like to install this for:
          </span>
          <div className="flex flex-wrap gap-4 max-w-2xl mt-4">
            {mcp_clients.map((client, index) => (
              <Card
                className={cn(
                  "relative cursor-pointer transition-all h-[135px] w-[135px] bg-foreground duration-150 ease-in-out overflow-hidden group",
                  selectedClient === client.name &&
                    "border border-violet-400 dark:border-violet-400 border-[3px]"
                )}
                key={index}
                onClick={() => setSelectedClient(client.name)}
              >
                <Image
                  src={client.image}
                  alt={client.name}
                  width={135}
                  height={135}
                  objectFit="cover"
                  className="bg-foreground relative z-0 absolute inset-0"
                />
                <div
                  className={`absolute inset-0 bg-black/70 font-semibold opacity-0 group-hover:opacity-100 scale-0 flex items-center justify-center text-lg text-violet-400 group-hover:scale-100 transition-all z-30 duration-300 origin-bottom-left rounded-tr-md ${selectedClient === client.name ? "opacity-100 scale-100" : ""}`}
                >
                  {client.name}
                </div>
              </Card>
            ))}
          </div>

          <span className="text-md font-semibold mt-4">
            Run the following command:
          </span>
          <CodeBlock match={match} className="mt-2">
            {selectedClient.toLowerCase() === "continue"
              ? "Command line support for continue.dev is currently in development!"
              : `npx -y @spydr/mcp-i https://memory.spydr.dev/sse --client ${selectedClient?.charAt(0).toLowerCase() + selectedClient?.slice(1)}`}
          </CodeBlock>

          <div className="text-md font-semibold mt-4">
            Or paste this into your respective MCP config:
          </div>
          <CodeBlock
            match={match}
            decorations={false}
            className="mt-2"
            fallbackLanguage="json"
          >
            {`"spydr-memory": {
  "command": "npx",
  "args": [
    "-y",
    "mcp-remote@latest",
    "https://memory.spydr.dev/sse",
    "--host",
    "127.0.0.1"
  ]
}`}
          </CodeBlock>
          <span className="text-md font-semibold mt-4">
            And you&apos;re done!{" "}
          </span>
        </div>
      </div>
    </div>
  );
}

Index.getLayout = (page: ReactElement) => {
  return <PublicLayout>{page}</PublicLayout>;
};

export default Index;

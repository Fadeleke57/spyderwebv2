import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CodeBlock } from "../chat/markdown";
import Link from "next/link";
import Image from "next/image";
import { Card } from "../ui/card";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export const mcp_clients = [
  {
    name: "Claude",
    link: "https://claude.ai/login?returnTo=%2F%3F#features",
    image:
      "https://pub-4271c874f759418fbdcd18b0e5cbe024.r2.dev/Claude/claude-logo.png",
  },
  {
    name: "Windsurf",
    link: "https://windsurf.com/",
    image:
      "https://exafunction.github.io//public/brand/windsurf-black-symbol.png",
  },
  {
    name: "Cursor",
    link: "https://cursor.sh/",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTrQ_CU3a6muH84mLfoP6xmM4ZJ9Z6RAXMmdA&s",
  },
  {
    name: "Continue",
    link: "https://continue.dev/",
    image: "https://hub.continue.dev/continue-logo.png",
  },
  {
    name: "Cline",
    link: "https://cline.bot/",
    image:
      "https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/light/cline.png",
  },
  {
    name: "Witsy",
    link: "https://witsyai.com/",
    image: "https://witsyai.com/img/logo.png",
  },
  {
    name: "Encovo",
    link: "https://www.enconvo.com/",
    image: "https://www.enconvo.com/logo.svg",
  },
];

export const match = RegExp("language-(\w+)").exec("language-javascript");
function MCPOnboardModal({ open, setOpen }: { open: boolean; setOpen: any }) {
  
  const [selectedClient, setSelectedClient] = useState<string>("claude");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-10 px-16 max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Introducing Spydr Memory MCP
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="max-w-xl">
          Spydr Memory MCP allows you to create, manage, and orchestrate your
          context to better serve LLM responses with clients like{" "}
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
          , and more.
        </DialogDescription>
        <span className="text-md font-semibold">
          Select the client you&apos;d like to install this for:
        </span>
        <div className="flex flex-wrap gap-4 ">
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
                className={`absolute inset-0 bg-black/70 font-semibold opacity-0 group-hover:opacity-100 scale-0 flex items-center justify-center text-lg text-foreground group-hover:scale-100 transition-all z-30 duration-300 origin-bottom-left rounded-tr-md ${selectedClient === client.name ? "opacity-100 scale-100" : ""}`}
              >
                {client.name}
              </div>
            </Card>
          ))}
        </div>{" "}
        <span className="text-md font-semibold -mb-8">
          Run the following command:
        </span>
        <CodeBlock match={match} className="mt-0">
          {selectedClient.toLowerCase() === "continue"
            ? "Command line support for continue.dev is currently in development!"
            : `npx -y @spydr/mcp-i https://memory.spydr.dev/sse --client ${selectedClient?.charAt(0).toLowerCase() + selectedClient?.slice(1)}`}
        </CodeBlock>
        <DialogFooter className="font-semibold whitespace-pre">
          For the full tutorial or the full config, visit our{" "}
          <Link
            href="https://spydr.dev/help?src=mcp"
            className="hover:underline text-violet-400 flex items-center group"
            target="_blank"
          >
            help center
            <ArrowRight
              strokeWidth={4}
              className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-all ease-linear duration-150"
            />
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default MCPOnboardModal;

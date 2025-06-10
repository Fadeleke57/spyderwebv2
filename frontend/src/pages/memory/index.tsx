import React, { ReactElement } from "react";
import { motion } from "framer-motion";
import PublicLayout from "@/app/PublicLayout";
import { LineShadowText } from "@/components/magicui/line-shadow-text";
import { useTheme } from "next-themes";
import Link from "next/link";
import { toast } from "@/components/ui/use-toast";

import { ArrowRight, Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import Head from "next/head";
import { environment } from "@/environment/load_env";

function Index() {
  const { theme } = useTheme();
  const shadowColor = theme === "dark" ? "white" : "black";
  const [selectedClient, setSelectedClient] = React.useState("Claude");
  const [selectedPackageManager, setSelectedPackageManager] = React.useState({
    name: "npm",
    command: "npx",
  });
  const [installType, setInstallType] = React.useState("CLI");

  const [isCopied, setIsCopied] = React.useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    toast({
      title: "Copied to clipboard",
    });
  };

  const clients = [
    "Claude",
    "Cursor",
    "Windsurf",
    "Cline",
    "Roo-Cline",
    "Witsy",
    "Encovo",
  ];
  const packageManagers = [
    {
      name: "pnpm",
      command: "pnpm dlx",
    },
    {
      name: "npm",
      command: "npx",
    },
    {
      name: "yarn",
      command: "npx",
    },
    {
      name: "bun",
      command: "bun x --bun",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const videoVariants = {
    hidden: { opacity: 0, x: 100 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        delay: 0.3,
      },
    },
  };

  const renderCliInstall = () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-8 h-8 bg-muted rounded-full text-foreground font-bold">
          1
        </div>
        <h2 className="text-md font-semibold">Installation</h2>
      </div>
      <div className="pl-12 flex flex-col gap-4">
        <div className="flex gap-6 border-b">
          {clients.map((client) => (
            <button
              key={client}
              onClick={() => setSelectedClient(client)}
              className={`py-2 text-md font-semibold transition-all duration-200 ease-in-out transform ${
                selectedClient === client
                  ? "border-b-2 border-foreground font-bold text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {client}
            </button>
          ))}
        </div>
        <div
          className="bg-black text-foreground rounded-lg p-4 font-mono relative group cursor-pointer"
          onClick={() =>
            handleCopy(
              `${selectedPackageManager.command} -y @spydr/mcp-i https://memory.spydr.dev/sse --client ${selectedClient.toLowerCase()}`
            )
          }
        >
          <div className="flex gap-4 mb-4 border-b border-slate-700">
            {packageManagers.map((pm, index) => (
              <button
                key={index}
                onClick={() => setSelectedPackageManager(pm)}
                className={`pb-1 transition-all duration-200 ease-in-out ${
                  selectedPackageManager.name === pm.name
                    ? "border-b-2 border-foreground font-bold text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {pm.name}
              </button>
            ))}
          </div>
          <div
            className="text-sm"
            key={`${selectedPackageManager.name}-${selectedClient}`}
          >
            {selectedPackageManager.command} -y @spydr/mcp-i
            https://memory.spydr.dev/sse --client {selectedClient.toLowerCase()}
          </div>
          <Button className="absolute top-2 right-2 h-fit w-fit p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-8 h-8 bg-muted rounded-full text-foreground font-bold">
          2
        </div>
        <h2 className="text-md font-semibold">Refresh the Client</h2>
      </div>
    </div>
  );

  const renderManualInstall = () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-8 h-8 bg-muted rounded-full text-foreground font-bold">
          1
        </div>
        <h2 className="text-md font-semibold">
          Add the following to your MCP config file:
        </h2>
      </div>
      <div
        className="pl-12 relative cursor-pointer group"
        onClick={() =>
          handleCopy(`"spydr-memory": {
  "command": "npx",
  "args": [
    "-y",
    "mcp-remote@latest",
    "https://memory.spydr.dev/sse",
    "--host",
    "127.0.0.1"
  ]
}`)
        }
      >
        <div className="text-sm ">
          <pre className="bg-black text-foreground rounded-lg p-4 font-mono relative">
            <code>
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
            </code>
            <Button className="absolute top-2 right-2 h-fit w-fit p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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
          </pre>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-8 h-8 bg-muted rounded-full text-foreground font-bold">
          2
        </div>
        <h2 className="text-md font-semibold">Refresh the Client</h2>
      </div>
    </div>
  );

  return (
    <motion.div
      className="relative min-h-screen overflow-hidden pl-6 lg:pl-10 py-10 lg:py-32 flex flex-col gap-14 transition-all duration-300"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Head>
        <title>Memory - Spydr</title>
        <meta
          name="description"
          content="Detailed Context Management and Orchestration for your AI applications."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="Memory - Spydr" />
        <meta
          property="og:description"
          content="Detailed Context Management and Orchestration for your AI applications."
        />
        <meta
          property="og:image"
          content={`${environment.client_url}/opengraph-image.png`}
        />
        <meta property="og:url" content={`${environment.client_url}/memory`} />
        <meta property="og:type" content="website" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </Head>
      <motion.div
        className="z-20 absolute top-20 md:top-20 lg:top-34 hidden md:block lg:w-[500px] h-[200px] -right-10"
        variants={videoVariants}
      >
        <span className="text-sm text-muted-foreground font-bold">
          Fine-Grained Context Orchestration
        </span>
        <div className="relative pb-[75%] h-[200px] w-full mt-2">
          <iframe
            src="https://www.loom.com/embed/d8937a0121d4461281f0d26e41fe6b1f?sid=61f79e8d-96d5-4215-995e-f5ee3680a715"
            allowFullScreen
            className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
          ></iframe>
        </div>
      </motion.div>

      <motion.div className="flex flex-col gap-2" variants={itemVariants}>
        <div>
          <h1 className="text-balance text-5xl font-semibold leading-none tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl">
            Build{" "}
            <LineShadowText
              className="italic relative"
              shadowColor={shadowColor}
            >
              Once.
            </LineShadowText>{" "}
            <br />
            Use{" "}
            <LineShadowText className="italic" shadowColor={shadowColor}>
              Anywhere
            </LineShadowText>
          </h1>
          <p className="max-w-3xl text-lg text-muted-foreground mt-4">
            One memory, infinite possibilities. With{" "}
            <span className="font-bold">Spydr Memory MCP</span>, your knowledge
            flows seamlessly across{" "}
            <Link
              href="https://claude.ai/download"
              className="hover:underline text-violet-400 transition-colors duration-200 font-bold"
              target="_blank"
            >
              Claude,
            </Link>{" "}
            <Link
              href="https://windsurf.com/"
              className="hover:underline text-violet-400 transition-colors duration-200 font-bold"
              target="_blank"
            >
              Windsurf,
            </Link>{" "}
            <Link
              href="https://cursor.sh/"
              className="hover:underline text-violet-400 transition-colors duration-200 font-bold"
              target="_blank"
            >
              Cursor,
            </Link>{" "}
            and any other MCP-compatible platform.{" "}
            <span className="font-bold">Multi-Modal,</span>{" "}
            <span className="font-bold">Efficient,</span>{" "}
            <span className="font-bold">Simple,</span> and{" "}
            <span className="font-bold">Free</span>. For help, check out some{" "}
            <Link
              href="/help?src=mcp"
              className="hover:underline group text-violet-400 transition-colors duration-200 font-bold flex items-center gap-2"
              target="_self"
            >
              tutorials{" "}
              <ArrowRight
                strokeWidth={4}
                className="group-hover:translate-x-1 transition-all ease-in-out duration-300"
                size={16}
              />
            </Link>
          </p>
        </div>
      </motion.div>

      <motion.div
        className="max-w-[300px] md:max-w-3xl"
        variants={itemVariants}
      >
        <div className="flex gap-4 border-b mb-4">
          <button
            onClick={() => setInstallType("CLI")}
            className={`text-md font-semibold pb-2 transition-all duration-200 ease-in-out transform ${
              installType === "CLI"
                ? "border-b-2 border-foreground font-bold text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            CLI
          </button>
          <button
            onClick={() => setInstallType("Manual")}
            className={`text-md font-semibold pb-2 transition-all duration-200 ease-in-out transform ${
              installType === "Manual"
                ? "border-b-2 border-foreground font-bold text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Manual
          </button>
        </div>
        <div key={installType}>
          {installType === "CLI" ? renderCliInstall() : renderManualInstall()}
        </div>
      </motion.div>
    </motion.div>
  );
}

Index.getLayout = (page: ReactElement) => {
  return <PublicLayout>{page}</PublicLayout>;
};

export default Index;

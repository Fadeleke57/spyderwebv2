import React from "react";
import "@hackernoon/pixel-icon-library/fonts/iconfont.css";
import { Button } from "../ui/button";
import { useSidebar } from "../ui/sidebar";

function DiscordInvite() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  if (isCollapsed) return null;
  return (
    <Button
      onClick={() => {
        window.open("https://discord.gg/jnr4EXvn", "_blank");
      }}
      className="p-3 py-1 h-fit mb-2 bg-card border dark:bg-violet-400/40 dark:border-violet-200 dark:hover:bg-violet-400/60 rounded-lg w-full border border-border flex flex-col font-semibold"
    >
      <span className="flex items-center gap-2">
        <i className="hn hn-discord"></i> Community
      </span>
      <span className="text-xs text-foreground/80">Join our Discord</span>
    </Button>
  );
}

export default DiscordInvite;

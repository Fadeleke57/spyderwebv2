import React, { useState, useRef } from "react";
import { gsap } from "gsap";
import { ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ConfigFormValues } from "@/types/article";
import { Button } from "@/components/ui/button";
import GraphDemo from "./GraphDemo";
import { Search } from "lucide-react";
import { Input } from "../ui/input";
import { useGSAP } from "@gsap/react";

export default function TerminalDemo() {
  const [config, setConfig] = useState<ConfigFormValues>({
    query: "",
    topic: "",
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [inputVisible, setInputVisible] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  useGSAP(() => {
    if (inputVisible) {
      gsap.to(inputRef.current, {
        width: 230,
        duration: 0.4,
        opacity: 1,
        ease: "power2.out",
      });
      gsap.to(buttonRef.current, {
        translateX: 181,
        duration: 0.4,
        ease: "power2.out",
      });
    } else {
      gsap.to(inputRef.current, {
        width: "0px",
        duration: 0.3,
        opacity: 0,
        ease: "power2.in",
      });
    }
  }, [inputVisible]);

  const handleSearchClick = (e: React.MouseEvent) => {
    const inputValue = inputRef.current?.value;
    if (inputValue && inputValue.trim() !== "") {
      setConfig({ ...config, query: inputValue.trim() });
    }

    if (clickCount === 0) {
      setInputVisible(!inputVisible);
    }
    setClickCount(clickCount + 1);
  };

  return (
    <div
      style={{ height: "80vh" }}
      className="border border-border/50 rounded-xl bg-background p-1.5 text-xs shadow-md w-full"
    >
      <ResizablePanelGroup
        direction="horizontal"
        className="min-h-[200px] w-full rounded-xl border"
      >
        <ResizablePanel defaultSize={75} className="relative">
          <div className="absolute left-3 top-3 bg-background rounded-md flex items-center">
            <div className="relative bg-background rounded-md flex items-center">
              <Button
                ref={buttonRef}
                onClick={handleSearchClick}
                className="z-10"
                type="submit"
              >
                <Search size={16} />
              </Button>
              <Input
                ref={inputRef}
                placeholder="Search anything"
                className="absolute left-0 top-0 w-0 opacity-0"
              />
            </div>
          </div>

          <div className="bg-muted h-full w-full whitespace-nowrap">
            <GraphDemo limit={20} config={config} setConfig={setConfig} />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

import React, { useState, useRef } from "react";
import { gsap } from "gsap";
import { ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ConfigFormValues } from "@/types/article";
import { Button } from "@/components/ui/button";
import GraphDemo from "./GraphDemo";
import { Search } from "lucide-react";
import { Input } from "../ui/input";
import { useGSAP } from "@gsap/react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Info } from "lucide-react";
import Router from "next/router";

export default function TerminalDemo() {
  const [config, setConfig] = useState<ConfigFormValues>({
    query: "",
    topic: "",
  });
  const [graphColor, setGraphColor] = useState<string>("#5ea4ff");

  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [inputVisible, setInputVisible] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const router = Router;

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

  const colorOptions = ["#5ea4ff", "#ff6f61", "#6b5b95", "#88b04b", "#f7cac9"];

  return (
    <div
      style={{ height: "80vh" }}
      className="border border-border/50 rounded-xl bg-background p-1.5 text-xs shadow-md w-full mb-16"
    >
      <ResizablePanelGroup
        direction="horizontal"
        className="min-h-[200px] w-full rounded-xl border"
      >
        <ResizablePanel defaultSize={75} className="relative">
          <div className="absolute left-3 top-3 bg-background rounded-md flex items-center">
            <div className="relative bg-background rounded-md flex items-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      ref={buttonRef}
                      onClick={handleSearchClick}
                      className="z-10"
                      type="submit"
                    >
                      <Search size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Search for anything. Then click on the nodes to see their
                      articles.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Input
                ref={inputRef}
                placeholder="Search anything"
                className="absolute left-0 top-0 w-0 opacity-0"
              />
            </div>
          </div>

          <div className="absolute right-3 top-3">
            <Select onValueChange={(value) => setGraphColor(value)}>
              <SelectTrigger className="w-[180px]">
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: graphColor }}
                ></div>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {colorOptions.map((color) => (
                    <SelectItem
                      key={color}
                      value={color}
                      className="w-auto flex items-center justify-center"
                    >
                      <div
                        className="w-6 h-6 rounded-full"
                        style={{ backgroundColor: color }}
                      ></div>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-muted h-full w-full whitespace-nowrap">
            <GraphDemo
              limit={20}
              config={config}
              setConfig={setConfig}
              color={graphColor}
            />
          </div>

          <div className=" flex w-full bg-background absolute bottom-0 p-6 text-base font-semibold items-center">
            <Info className="text-black mr-2 inline" /> Search a topic, then
            click on the nodes to view insights.
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
      <div className="flex text-center items-center justify-center flex-row gap-4 mt-6">
        <p className="text-base font-semibold">
          Experience the full querying terminal
        </p>
        <Button onClick={() => router.push("/terminal")}>Try Now</Button>
      </div>
    </div>
  );
}

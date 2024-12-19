import React, { useState, useRef } from "react";
import { gsap } from "gsap";
import { Button } from "@/components/ui/button";
import GraphDemo from "./GraphDemo";
import { useGSAP } from "@gsap/react";
import { Info } from "lucide-react";
import Router from "next/router";
import useMediaQuery from "@/hooks/general";

export default function TerminalDemo() {
  const isMobileScreen = useMediaQuery("(max-width: 768px)");

  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [inputVisible, setInputVisible] = useState(false);
  const router = Router;

  useGSAP(() => {
    if (inputVisible) {
      gsap.to(inputRef.current, {
        width: isMobileScreen ? 180 : 230,
        duration: 0.4,
        opacity: 1,
        ease: "power2.out",
      });
      gsap.to(buttonRef.current, {
        translateX: isMobileScreen ? 131 : 181,
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

  return (
    <div
      style={{ height: "80vh" }}
      className="border border-border/50 rounded-xl bg-background p-1.5 text-xs shadow-md w-full mb-16"
    >
      <div className="bg-muted h-full w-full whitespace-nowrap relative">
        <GraphDemo />
        <div className="flex flex-row gap-2 lg:flex-row w-full bg-background absolute bottom-0 p-6 text-base font-semibold justify-center lg:text-left">
          <Info className="text-slate-500 mr-2 lg:inline" />
          <p className="text-slate-500">
            Click on the nodes to view content.
          </p>
        </div>
      </div>
      <div className="lg:flex flex-row mt-6 gap-4 lg:items-center lg:justify-center">
        <p className="text-sm mb-2 lg:mb-0 lg:text-base font-semibold">
          Experience the full <strong>Spydr Web</strong>{" "}
          <a className="decoration-blue-500 underline lg:hidden">here</a>
        </p>
        <Button
          onClick={() => router.push("/auth/login")}
          className="hidden lg:inline"
        >
          Try Now
        </Button>
      </div>
    </div>
  );
}

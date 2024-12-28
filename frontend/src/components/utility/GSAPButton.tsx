import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface AnimatedButtonProps {
  label?: string;
  href?: string;
  onClick?: () => void;
  children?: React.ReactNode;
  classname?: string;
  buttonClassname?: string;
  variant?: "default" | "outline";
  color?: string;
}

const GSAPButton = ({
  label,
  onClick,
  children,
  classname,
  buttonClassname,
  variant = "default",
  color = "primary",
}: AnimatedButtonProps) => {
  const buttonRef = useRef<HTMLAnchorElement>(null);
  const flairRef = useRef<HTMLSpanElement>(null);
  const xSet = useRef<any>();
  const ySet = useRef<any>();

  const colorVariants: Record<string, string> = {
    primary: "bg-amber-500",
    secondary: "bg-blue-500",
  };

  useEffect(() => {
    if (!flairRef.current) return;
    xSet.current = gsap.quickSetter(flairRef.current, "xPercent");
    ySet.current = gsap.quickSetter(flairRef.current, "yPercent");
  }, []);

  const getXY = (e: React.MouseEvent) => {
    if (!buttonRef.current) return { x: 0, y: 0 };

    const { left, top, width, height } =
      buttonRef.current.getBoundingClientRect();
    const xTransformer = gsap.utils.pipe(
      gsap.utils.mapRange(0, width, 0, 100),
      gsap.utils.clamp(0, 100)
    );
    const yTransformer = gsap.utils.pipe(
      gsap.utils.mapRange(0, height, 0, 100),
      gsap.utils.clamp(0, 100)
    );

    return {
      x: xTransformer(e.clientX - left),
      y: yTransformer(e.clientY - top),
    };
  };

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (!flairRef.current || !xSet.current || !ySet.current) return;

    const { x, y } = getXY(e);
    xSet.current(x);
    ySet.current(y);

    gsap.to(flairRef.current, {
      scale: 1,
      duration: 0.4,
      ease: "power2.out",
    });
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    if (!flairRef.current || !xSet.current || !ySet.current) return;

    const { x, y } = getXY(e);
    gsap.killTweensOf(flairRef.current);

    gsap.to(flairRef.current, {
      xPercent: x > 90 ? x + 20 : x < 10 ? x - 20 : x,
      yPercent: y > 90 ? y + 20 : y < 10 ? y - 20 : y,
      scale: 0,
      duration: 0.3,
      ease: "power2.out",
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!flairRef.current || !xSet.current || !ySet.current) return;

    const { x, y } = getXY(e);
    gsap.to(flairRef.current, {
      xPercent: x,
      yPercent: y,
      duration: 0.4,
      ease: "power2",
    });
  };

  return (
    <span
      ref={buttonRef}
      onClick={onClick}
      className={cn(
        `${
          variant === "outline" ? "border" : ""
        } text-sm inline-flex items-center justify-center gap-[0.363636em] relative overflow-hidden px-4 py-[0.6575rem] lg:px-6 lg:py-[0.9375rem] rounded-xl lg:rounded-[6.25rem] text-black dark:text-white text-lg font-semibold leading-[1.04545] tracking-[-0.01em] cursor-pointer no-underline hover:text-black lg:hover:text-white transition-colors duration-150 before:absolute before:inset-0 before:rounded-[6.25rem] before:pointer-events-none`,
        buttonClassname
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      <span
        ref={flairRef}
        className={`absolute inset-0 pointer-events-none scale-0 origin-[0_0] will-change-transform before:absolute before:w-[170%] before:aspect-square before:bg-violet-400 before:rounded-full before:left-0 before:top-0 before:transform before:-translate-x-1/2 before:-translate-y-1/2 before:pointer-events-none`}
      />
      <span
        className={cn(
          "relative text-center transition-colors duration-50",
          classname
        )}
      >
        {children ? children : label}
      </span>
    </span>
  );
};

export default GSAPButton;

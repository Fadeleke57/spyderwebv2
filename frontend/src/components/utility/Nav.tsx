"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { MobileNav } from "./Mobile-Nav";
import Image from "next/image";
import logo from "@/assets/slogonobg.png";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

import useMediaQuery from "@/hooks/general";
import { useRouter } from "next/router";

const components = [
  {
    title: "Walkthrough Video",
    href: "/about/howto",
    description:
      "A quick loom video showing how to get started with the app and its features.",
  },
  {
    title: "API Docs",
    href: "/",
    description: "Still in development. Public documentation for the API.",
  },
  {
    title: "Analytics",
    href: "/",
    description: "How are scores and relevance between articles calculated?",
  },
  {
    title: "Your Contribution",
    href: "/",
    description: "Adding your own articles or contributing to the app.",
  },
];

function NavigationMenuFull() {
  return (
    <NavigationMenu>
      <NavigationMenuList className="hidden md:flex items-center">
        <NavigationMenuLink
          target="_blank"
          className="pt-1 m-0"
          href="https://www.producthunt.com/products/spydr-the-github-for-llm-context?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-spydr"
        >
          <img
            src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=976810&theme=neutral&t=1749756938288"
            alt="Spydr - Github&#0032;for&#0032;LLM&#0032;context&#0046;&#0032;One&#0032;memory&#0044;&#0032;infinite&#0032;possibilities&#0046; | Product Hunt"
            style={{ width: "175px", height: "50px" }}
            width="175"
            height="50"
          />
        </NavigationMenuLink>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          href={"/"}
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";

export function Navbar() {
  const [isMounted, setIsMounted] = useState(false);
  const matches = useMediaQuery("(max-width: 768px)");
  const [showNav, setShowNav] = useState(true);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const logoRef = useRef<HTMLImageElement>(null);
  const router = useRouter();

  useGSAP(() => {
    setIsMounted(true);

    if (logoRef.current && !matches) {
      gsap.fromTo(
        logoRef.current,
        {
          translateY: -100,
          transformOrigin: "top",
        },
        {
          translateY: 0,
          duration: 0.5,
          ease: "power2.out",
        }
      );
    }

    const handleScroll = () => {
      const currentScrollPos = window.pageYOffset;
      const visible = prevScrollPos > currentScrollPos || currentScrollPos < 10;

      setShowNav(visible);
      setPrevScrollPos(currentScrollPos);
    };

    window.addEventListener("scroll", handleScroll);
  }, [prevScrollPos]);

  if (!isMounted) {
    return null;
  }

  const desktopNav = (
    <div
      className={`flex items-center justify-between px-6 lg:px-10 transition ease duration-300 ${
        showNav ? "translate-y-0" : "-translate-y-full"
      } bg-background py-2 fixed top-0 left-0 2xl:left-60 z-50 w-full`}
    >
      <Link href="/">
        <div className="flex gap-2 items-center justify-center rounded-lg rounded-full">
          <Image
            src={logo}
            alt="logo"
            width={36}
            height={36}
            className="rounded-full hover:animate-spin-slow"
            priority
          />
          <div className="grid flex-1 -mt-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold text-3xl tracking-tighter">
              spydr
            </span>
          </div>
          {router.pathname === "/memory" && (
            <span className="text-lg font-semibold font-mono text-neon -mb-[5.7px]">
              memory mcp
            </span>
          )}
        </div>
      </Link>
      <NavigationMenuFull />
    </div>
  );

  return <div className="w-full p-6 lg:p-0">{desktopNav}</div>;
}

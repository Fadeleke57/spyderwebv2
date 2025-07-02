"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import Image from "next/image";
import logo from "@/assets/slogonobg.png";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

import useMediaQuery from "@/hooks/general";
import { useRouter } from "next/router";

const components = [
  {
    title: "Blog",
    href: "/blog",
    description:
      "A quick loom video showing how to get started with the app and its features.",
  },
];

function NavigationMenuFull() {
  return (
    <NavigationMenu>
      <NavigationMenuList className="hidden md:flex items-center">
        {components.map((component) => (
          <ListItem
            key={component.title}
            title={component.title}
            href={component.href}
          />
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, href, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          href={href || "#"}
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-violet-400/30 hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-semibold leading-none">{title}</div>
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
      className={`flex items-center justify-between transition ease duration-300 ${
        showNav ? "translate-y-0" : "-translate-y-full"
      } bg-background py-2 fixed top-0 left-0 px-6 lg:px-10 z-50 w-full`}
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

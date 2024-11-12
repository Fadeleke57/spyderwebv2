"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useUser } from "@/context/UserContext";

import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { MobileNav } from "./Mobile-Nav";
import { useRouter } from "next/router";
import Image from "next/image";
import logo from "@/assets/s_logo.jpg";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

import useMediaQuery from "@/hooks/general";

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
  const { user, logout } = useUser();
  const router = useRouter();

  const handleLogout = async () => {
    logout();
    router.push("/auth/login");
  }
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>About</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <Link
                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                    href="/"
                  >
                    <Image
                      src={logo}
                      alt="logo"
                      className="w-full h-full rounded-md"
                    />
                    <div className="mb-2 mt-4 text-lg font-medium">Spydr</div>
                    <p className="text-sm leading-tight text-muted-foreground">
                      Access to the latest news and information.
                    </p>
                  </Link>
                </NavigationMenuLink>
              </li>
              <ListItem href="/about" title="About Spydr">
                Learn more about what we do and why we&apos;re different
              </ListItem>
              <ListItem href="/about/privacy-policy" title="Privacy Policy">
                Learn about our privacy policy.
              </ListItem>
              <ListItem href="/about/terms-of-service" title="Terms of Service">
                Terms and conditions to using Spydr.
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Getting started</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
              {components.map((component) => (
                <ListItem
                  key={component.title}
                  title={component.title}
                  href={component.href}
                >
                  {component.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/terminal" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Spydr Terminal
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          {user ? (
            <NavigationMenuLink
              className={navigationMenuTriggerStyle()}
              onClick={handleLogout}
            >
              Logout
            </NavigationMenuLink>
          ) : (
            <Link href="/auth/login" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Login
              </NavigationMenuLink>
            </Link>
          )}
        </NavigationMenuItem>
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
      className={`flex items-center justify-between px-10 transition ease duration-300 ${
        showNav ? "translate-y-0" : "-translate-y-full"
      } fixed top-0 left-0 2xl:left-60 bg-white z-50 w-full`}
    >
      <div className="flex items-center gap-2">
        <Link href="/">
          <Image ref={logoRef} src={logo} alt="logo" width={50} height={50} />
        </Link>
        <NavigationMenuFull />
      </div>
    </div>
  );

  const mobileNav = <MobileNav />;

  return (
    <div className="w-full p-6 lg:p-0">{matches ? mobileNav : desktopNav}</div>
  );
}

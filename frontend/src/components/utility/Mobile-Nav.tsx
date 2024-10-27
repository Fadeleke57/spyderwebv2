"use client";

import * as React from "react";
import Link, { LinkProps } from "next/link";
import Image from "next/image";
import logo from "@/assets/s_logo.jpg";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const mainLinks = [
  {
    title: "About",
    href: null,
    subItems: [
      {
        title: "About Spydr",
        href: "/about",
      },
      {
        title: "Privacy Policy",
        href: "/about/privacy-policy",
      },
      {
        title: "Terms of Service",
        href: "/about/terms-of-service",
      },
    ],
  },
  {
    title: "Getting Started",
    href: null,
    subItems: [
      {
        title: "Walkthrough Video",
        href: "/about/howto",
        label:
          "A quick loom video showing how to get started with the app and its features.",
      },
      {
        title: "API Docs",
        href: "/",
        label: "Still in development. Public documentation for the API.",
      },
      {
        title: "Analytics",
        href: "/",
        label: "How are scores and relevance between articles calculated?",
      },
      {
        title: "Your Contribution",
        href: "/",
        label: "Adding your own articles or contributing to the app.",
      },
    ],
  },
  {
    title: "Spydr Terminal",
    href: "/terminal",
    subItems: [],
  },
  {
    title: "Login",
    href: "/auth/login",
    subItems: [],
  },
];

export function MobileNav() {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <ScrollArea className="my-4 h-[calc(100vh-1rem)] pl-6">
          <div className="flex flex-col space-y-2">
            <MobileLink
              href="/"
              className="flex items-center"
              onOpenChange={setOpen}
            >
              <Image
                src={logo}
                alt="Spydr Logo"
                className="w-16 h-16 rounded-lg"
              />
            </MobileLink>
            {mainLinks.map((item, index) => (
              <div key={index} className="flex flex-col space-y-3 pt-6">
                {item.href ? (
                  <MobileLink href={item.href} onOpenChange={setOpen}>
                    <h4 className="font-medium">{item.title}</h4>
                  </MobileLink>
                ) : (
                  <h4 className="font-medium">{item.title}</h4>
                )}
                {item?.subItems?.map((subItem, index) => (
                  <MobileLink
                    key={index}
                    href={subItem.href}
                    onOpenChange={setOpen}
                    className="text-muted-foreground"
                  >
                    {subItem.title}
                  </MobileLink>
                ))}
              </div>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

interface MobileLinkProps extends LinkProps {
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

function MobileLink({
  href,
  onOpenChange,
  className,
  children,
  ...props
}: MobileLinkProps) {
  const router = useRouter();

  if (!href) {
    return <div className={cn(className)}>{children}</div>;
  }

  return (
    <Link
      href={href}
      onClick={(e) => {
        onOpenChange?.(false);
      }}
      className={cn(className)}
      {...props}
    >
      {children}
    </Link>
  );
}

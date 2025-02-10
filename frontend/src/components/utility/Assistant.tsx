import React, { useState } from "react";
import { Search, HelpCircle, Rocket, BookOpen, Keyboard, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import spydrIcon from "@/assets/spydr_icon.svg"
import { DropdownMenu, DropdownMenuContent } from "../ui/dropdown-menu";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import Image from "next/image";
import { useRouter } from "next/router";
import { QuestionMarkCircledIcon } from "@radix-ui/react-icons";

const SpydrAI = () => {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const menuItems = [
    { icon: <Workflow className="h-5 w-5" />, label: "Get Started", onClick: () => {} },
    { icon: <Search className="h-5 w-5" />, label: "Quick Search", onClick: () => {} },
    { icon: <QuestionMarkCircledIcon className="h-5 w-5" />, label: "Need Help?", onClick: () => {} },
  ];

  
  return (
    <div className="fixed bottom-6 right-6 lg:right-16">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild className="bg-zinc-800">
          <Button
            className="h-fit w-fit rounded-full px-4 py-4 hover:bg-zinc-900/95"
          >
            <Image src={spydrIcon} alt="Spydr Logo" className="w-6 h-6" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="w-[250px] lg:w-[400px] p-2 bg-zinc-900/95 border-zinc-800 backdrop-blur-sm"
          align="end"
          side="left"
          sideOffset={10}
          avoidCollisions={false}
        
        >
          <div className="flex flex-col space-y-1">
            {menuItems.map((item, index) => (
              <Button
                key={index}
                variant="ghost"
                className="flex w-full items-center justify-start gap-3 px-3 py-2 text-sm text-zinc-100 hover:bg-white/10"
              >
                {item.icon}
                <span>{item.label}</span>
              </Button>
            ))}

            <div className="my-2 border-t border-zinc-800" />

            <Button
              variant="ghost"
              className="flex w-full items-center justify-start px-3 py-2 text-sm text-zinc-500 hover:bg-white/10"
              onClick={() => router.push("/about/terms-of-service")}
            >
              Terms of Service
            </Button>

            <Button
              variant="ghost"
              className="flex w-full items-center justify-start px-3 py-2 text-sm text-zinc-500 hover:bg-white/10"
              onClick={() => router.push("/about/privacy-policy")}
            >
              Privacy Policy
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default SpydrAI;

import React from "react";
import { useUser } from "@/context/UserContext";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormItem,
  FormField,
  FormMessage,
  FormLabel,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
  SelectGroup,
  SelectLabel,
} from "@radix-ui/react-select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, Search } from "lucide-react";

function SideBar() {
  const { user } = useUser();
  const form = useForm<any>({
    resolver: zodResolver(z.object({})),
  });

  const onSubmit: SubmitHandler<any> = async (data: any) => {};

  if (!user) {
    return <p>Loading...</p>;
  }

  return (
    <div className="flex h-full justify-center px-6 py-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mt-8">
          <div className="">
            <h4 className=" text-xl font-semibold tracking-tight">
              Sypdr Terminal
            </h4>
          </div>

          <FormField
            control={form.control}
            name="search_term"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Search Term</FormLabel>
                <FormControl>
                  <div className="flex w-full max-w-sm items-center space-x-2">
                    <Input placeholder="2024 Election" {...field} />
                    <Button type="submit"><ArrowRight size={16} /></Button>
                  </div>
                </FormControl>
                <FormDescription>
                  Please provide a relevant search term.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
}

export default SideBar;

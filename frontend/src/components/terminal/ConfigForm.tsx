import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { ArrowRight } from "lucide-react";

type FormValues = {
  query: string;
  topic: string;
};

type ConfigFormProps = {
  setIsOpen?: (value: boolean) => void;
  setQuery: (value: string) => void;
};

function ConfigForm({ setIsOpen, setQuery }: ConfigFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(
      z.object({
        query: z.string().min(1, "Please provide a valid search term."),
      })
    ),
  });

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    setQuery(data.query);
    if (setIsOpen) {
      setIsOpen(false);
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mt-3">
          <div className="">
            <h4 className=" text-xl font-semibold tracking-tight">
              Sypdr Terminal
            </h4>
            <p className="text-sm text-muted-foreground">
              Query thousands of articles over the Spydr Terminal.
            </p>
          </div>

          <FormField
            control={form.control}
            name="query"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Search Term</FormLabel>

                <FormControl>
                  <div className="flex w-full max-w-sm items-center space-x-2">
                    <Input placeholder="2024 Election" {...field} />
                    <Button type="submit">
                      <ArrowRight size={16} />
                    </Button>
                  </div>
                </FormControl>
                <FormDescription>
                  Please provide a relevant search term.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            key={"topic"}
            control={form.control}
            name="topic"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Topic</FormLabel>
                <FormControl>
                  <Select disabled>
                    <SelectTrigger className="w-[280px]">
                      <SelectValue placeholder="Select a topic" />
                    </SelectTrigger>
                    <SelectContent>{/* Select Groups */}</SelectContent>
                  </Select>
                </FormControl>
                <FormDescription>
                  Choose a relevant topic.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormMessage>
            <Button type="submit">Save changes</Button>
          </FormMessage>
        </form>
      </Form>
    </>
  );
}

export default ConfigForm;

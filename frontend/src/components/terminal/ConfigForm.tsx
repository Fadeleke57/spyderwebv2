import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { ConfigFormValues } from "@/types/article";

type ConfigFormProps = {
  setIsOpen?: (value: boolean) => void;
  setConfig: (value: ConfigFormValues) => void;
};

function ConfigForm({ setIsOpen, setConfig }: ConfigFormProps) {
  const form = useForm<ConfigFormValues>({
    resolver: zodResolver(
      z.object({
        query: z.string().optional(),
        topic: z.string().optional(),
      })
    ),
  });

  const onSubmit: SubmitHandler<ConfigFormValues> = (data) => {
    setConfig({ query: data.query, topic: data.topic });
    
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
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-[280px]">
                      <SelectValue placeholder="Select a topic" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="None" className="px-4">
                          None
                        </SelectItem>
                        <SelectLabel className="px-4">Politics</SelectLabel>
                        <SelectItem value="Politics" className="px-4">
                          All
                        </SelectItem>
                        <SelectItem value="republican" className="px-4">
                          Republican
                        </SelectItem>
                        <SelectItem value="democrats" className="px-4">
                          Democrats
                        </SelectItem>
                        <SelectItem value="2024 Elections" className="px-4">
                          2024 Elections
                        </SelectItem>
                        <SelectItem value="Kamala Harris" className="px-4">
                          Kamala Harris
                        </SelectItem>
                        <SelectItem value="Donald Trump" className="px-4">
                          Donald Trump
                        </SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel className="px-4">World</SelectLabel>
                        <SelectItem value="World" className="px-4">
                          All
                        </SelectItem>
                        <SelectItem value="Israel-Hamas War" className="px-4">
                          Israel-Hamas War
                        </SelectItem>
                        <SelectItem value="South Korea" className="px-4">
                          South Korea
                        </SelectItem>
                        <SelectItem value="Italy" className="px-4">
                          Italy
                        </SelectItem>
                        <SelectItem value="Germany" className="px-4">
                          Germany
                        </SelectItem>
                        <SelectItem value="Botswana" className="px-4">
                          Botswana
                        </SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel className="px-4">Business</SelectLabel>
                        <SelectItem value="Business" className="px-4">
                          All
                        </SelectItem>
                        <SelectItem value="Economy" className="px-4">
                          Economy
                        </SelectItem>
                        <SelectItem value="Brands" className="px-4">
                          Brands
                        </SelectItem>
                        <SelectItem value="Companies" className="px-4">
                          Companies
                        </SelectItem>
                        <SelectItem
                          value="The Leadership Brief"
                          className="px-4"
                        >
                          Leaders
                        </SelectItem>
                        <SelectItem value="Cryptocurrency" className="px-4">
                          Cryptocurrency
                        </SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel className="px-4">Health</SelectLabel>
                        <SelectItem value="Health" className="px-4">
                          All
                        </SelectItem>
                        <SelectItem value="Disease" className="px-4">
                          Disease
                        </SelectItem>
                        <SelectItem value="COVID-19" className="px-4">
                          COVID-19
                        </SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel className="px-4">Science</SelectLabel>
                        <SelectItem value="Science" className="px-4">
                          All
                        </SelectItem>
                        <SelectItem value="remembrance" className="px-4">
                          Remembrance
                        </SelectItem>
                        <SelectItem value="Space" className="px-4">
                          Space
                        </SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel className="px-4">Climate</SelectLabel>
                        <SelectItem value="Climate" className="px-4">
                          All
                        </SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel className="px-4">
                          Entertainment
                        </SelectLabel>
                        <SelectItem value="Entertainment" className="px-4">
                          All
                        </SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel className="px-4">Tech</SelectLabel>
                        <SelectItem
                          value="Artificial Intelligence"
                          className="px-4"
                        >
                          AI
                        </SelectItem>
                        <SelectItem value="Security" className="px-4">
                          Security
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormDescription>Choose a relevant topic.</FormDescription>
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

import { Button } from "@/components/ui/button";
import { Input, SearchInput } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
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
import { topicsWithSubtopics } from "@/types/topics";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CalendarIcon, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

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
        enableSpydrSearch: z.boolean().optional(),
      })
    ),
  });

  const onSubmit: SubmitHandler<ConfigFormValues> = (data) => {
    setConfig({
      query: data.query,
      topic: data.topic,
      enableSpydrSearch: data.enableSpydrSearch,
    });

    if (setIsOpen) {
      setIsOpen(false);
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-3 w-full">

          <FormField
            control={form.control}
            name="query"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="hidden">Search</FormLabel>
                <FormControl className="flex w-full items-center space-x-2">
                  <SearchInput
                    placeholder="What are you looking for?"
                    {...field}
                  ></SearchInput>
                </FormControl>
                <FormDescription>
                  Find similar and exact matches to your query.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enableSpydrSearch"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormLabel></FormLabel>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    aria-readonly
                    id="ss"
                    className="m-0 p-0"
                  />
                </FormControl>
                <Label htmlFor="ss" className="">
                  Enable Spydr Search
                </Label>
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
                    <div className="flex w-full max-w-md items-center space-x-2">
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a topic" />
                      </SelectTrigger>
                    </div>
                    <SelectContent className="max-h-[300px]">
                      <SelectItem value="None" className="px-4">
                        None
                      </SelectItem>
                      {topicsWithSubtopics.map((topic) => (
                        <SelectGroup key={topic.name}>
                          <SelectLabel className="px-4">
                            {topic.name}
                          </SelectLabel>
                          {topic.subtopics.map((subtopic) => (
                            <SelectItem
                              key={subtopic.value}
                              value={subtopic.value}
                              className="px-4 cursor-pointer"
                            >
                              {subtopic.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormDescription>Choose a relevant topic.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormMessage>
            <Button type="submit">Search</Button>
          </FormMessage>
        </form>
      </Form>
    </>
  );
}

export default ConfigForm;

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/input";
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
import { BucketConfigFormValues } from "@/types/article";
import { Bucket } from "@/types/bucket";
import { useCollectSourcesForBucket } from "@/hooks/generation";

type ConfigFormProps = {
  setIsOpen?: (value: boolean) => void;
  config: BucketConfigFormValues;
  setConfig: (value: BucketConfigFormValues) => void;
  bucket: Bucket;
  refetch: () => void;
};

function BucketConfigForm({ setIsOpen, config, setConfig, bucket, refetch }: ConfigFormProps) {
  const { generateSourcesForBucket, loading, error } = useCollectSourcesForBucket(
    bucket.bucketId,
    config,
  )
  const form = useForm<BucketConfigFormValues>({
    resolver: zodResolver(
      z.object({
        title: z.string().optional(),
        description: z.string().optional(),
      })
    ),
  });

  const onSubmit: SubmitHandler<BucketConfigFormValues> = async (data) => {
    setConfig({
      title: data.title,
      description: data.description,
    });

    await generateSourcesForBucket();
    refetch();

    if (setIsOpen) {
      setIsOpen(false);
    }
  };

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 mt-3 w-full"
        >
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="hidden">Search</FormLabel>
                <FormControl className="flex w-full items-center space-x-2">
                  <SearchInput
                    defaultValue={bucket.name}
                    placeholder="What are you looking for?"
                    {...field}
                  ></SearchInput>
                </FormControl>
                <FormDescription>
                  Find the perfect sources to map your research.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormMessage>
            <Button disabled={loading} type="submit">{loading ? "Curating..." : "Save"}</Button>
          </FormMessage>
        </form>
      </Form>
    </>
  );
}

export default BucketConfigForm;

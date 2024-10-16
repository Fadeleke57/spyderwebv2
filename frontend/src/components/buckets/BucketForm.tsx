import React from "react";
import { Bucket } from "@/types/bucket";
import { PublicUser } from "@/types/user";
import { useUpdateBucket } from "@/hooks/buckets";
import { useToast } from "../ui/use-toast";
import { useRouter } from "next/router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import { TagsPopover } from "../home/TagsPopover";
import { Button } from "../ui/button";
type FormProps = {
  bucket: Bucket;
  user: PublicUser | null;
};

const bucketSchema = z.object({
  name: z.string().min(1, { message: "Claim is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  visibility: z
    .enum(["private", "public", "invite"], {
      required_error: "Visibility is required",
    })
    .optional(),
});

type BucketFormValues = z.infer<typeof bucketSchema>;

function BucketForm({ bucket, user }: FormProps) {
  const isOwner = user?.id === bucket?.userId;
  const { updateBucket, loading } = useUpdateBucket(bucket?.bucketId);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<BucketFormValues>({
    resolver: zodResolver(bucketSchema),
  });
  const onSubmit: SubmitHandler<BucketFormValues> = async (data) => {
    try {
      await updateBucket({
        name: data.name,
        description: data.description,
        private: data.visibility === "private",
      });
    } catch (error: any) {
      toast({
        title: "Error updating bucket",
        description: error.message,
        variant: "destructive",
      });
      return;
    } finally {
      toast({ title: "Bucket updated successfully!" });
      router.push("/buckets");
    }
  };
  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="grid w-full items-start gap-6"
    >
      <fieldset className="grid gap-2 rounded-lg border p-4">
        <legend className="-ml-1 px-1 text-sm font-medium">Information</legend>
        <div className="grid gap-3">
          <div className="grid gap-3">
            <Label htmlFor="name">Claim</Label>
            <Input
              id="name"
              type="text"
              defaultValue={bucket?.name}
              placeholder="Enter a claim, something that can be proven or disproved..."
              {...form.register("name")}
              disabled={!isOwner}
            />
            <small className="text-red-500">
              {form.formState.errors.name?.message}
            </small>
          </div>
        </div>
        <div className="grid gap-3">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Enter a brief description of the claim..."
            className="min-h-[9.5rem]"
            defaultValue={bucket?.description}
            {...form.register("description")}
            disabled={!isOwner}
          />
          <small className="text-red-500">
            {form.formState.errors.description?.message}
          </small>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <TagsPopover bucket={bucket} />
        </div>
      </fieldset>
      <fieldset className="grid gap-6 rounded-lg border p-4">
        <legend className="-ml-1 px-1 text-sm font-medium">Settings</legend>
        <div className="grid gap-3">
          <Label htmlFor="visibility">Privacy</Label>
          <Select
            onValueChange={(value) =>
              form.setValue(
                "visibility",
                value as "private" | "public" | "invite"
              )
            }
            defaultValue={bucket?.private ? "private" : "public"}
          >
            <SelectTrigger id="visibility">
              <SelectValue
                defaultValue={bucket?.private ? "private" : "public"}
                placeholder="Select visibility"
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="private">Private</SelectItem>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="invite">Invite-Only</SelectItem>
            </SelectContent>
          </Select>
          <small className="text-red-500">
            {form.formState.errors.visibility?.message}
          </small>
        </div>
      </fieldset>
      <Button disabled={loading} type="submit">
        {loading ? "Updating..." : "Update"}
      </Button>
    </form>
  );
}

export default BucketForm;

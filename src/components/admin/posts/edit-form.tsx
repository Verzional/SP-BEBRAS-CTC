"use client";

import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { updatePost } from "@/services/post";
import { PostSchema } from "@/types/db/post";
import { Post } from "@/generated/client/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PostEditFormProps {
  post: Post;
}

export function PostEditForm({ post }: PostEditFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof PostSchema>>({
    resolver: zodResolver(PostSchema),
    defaultValues: {
      postNumber: post.postNumber,
      picName: post.picName,
      level: post.level,
    },
  });

  function onSubmit(data: z.infer<typeof PostSchema>) {
    startTransition(async () => {
      try {
        await updatePost(post.id, data);

        toast.success("Post updated successfully!");
        router.push(`/admin/posts/${post.id}`);
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to update post"
        );
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Post</CardTitle>
        <CardDescription>
          Update post information in the database.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="form-post-edit" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            {/* Post Number Field */}
            <Controller
              name="postNumber"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-post-number">
                    Post Number
                  </FieldLabel>
                  <Input
                    {...field}
                    id="form-post-number"
                    aria-invalid={fieldState.invalid}
                    placeholder="Enter post number"
                    autoComplete="off"
                    disabled={isPending}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            {/* PIC Name Field */}
            <Controller
              name="picName"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-post-pic">PIC Name</FieldLabel>
                  <Input
                    {...field}
                    id="form-post-pic"
                    aria-invalid={fieldState.invalid}
                    placeholder="Enter PIC name"
                    autoComplete="off"
                    disabled={isPending}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            {/* Level Select Field */}
            <Controller
              name="level"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Level</FieldLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isPending}
                  >
                    <SelectTrigger aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder="Select a level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SMP">SMP</SelectItem>
                      <SelectItem value="SMA">SMA</SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        {/* Action Buttons */}
        <Field orientation="horizontal">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={isPending}
          >
            Reset
          </Button>
          <Button type="submit" form="form-post-edit" disabled={isPending}>
            Submit
          </Button>
        </Field>
      </CardFooter>
    </Card>
  );
}

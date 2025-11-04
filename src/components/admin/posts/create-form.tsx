"use client";

import { z } from "zod";
import { toast } from "sonner";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { createPost } from "@/services/post";
import { PostSchema } from "@/types/db/post";
import { Level } from "@/generated/client/enums";

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

export function PostCreateForm() {
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof PostSchema>>({
    resolver: zodResolver(PostSchema),
    defaultValues: {
      postNumber: "",
      picName: "",
      level: "SMP" as Level,
    },
  });

  function onSubmit(data: z.infer<typeof PostSchema>) {
    startTransition(async () => {
      const result = await createPost(data);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Post created successfully!");
        form.reset();
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Post</CardTitle>
        <CardDescription>Add a new post to the competition.</CardDescription>
      </CardHeader>
      <CardContent>
        <form id="form-post" onSubmit={form.handleSubmit(onSubmit)}>
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
                  <FieldLabel htmlFor="form-post-pic">
                    PIC Name
                  </FieldLabel>
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
          <Button type="submit" form="form-post" disabled={isPending}>
            Submit
          </Button>
        </Field>
      </CardFooter>
    </Card>
  );
}
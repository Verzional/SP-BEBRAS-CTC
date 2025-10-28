"use client";

import Image from "next/image";
import { z } from "zod";
import { toast } from "sonner";
import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { createQuestion } from "@/services/question";
import { QuestionSchema } from "@/types/db";

import { UploadWidget } from "@/components/layout/upload-widget";
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

export function QuestionCreateForm() {
  const [isPending, startTransition] = useTransition();
  const [imageUrl, setImageUrl] = useState<string>("");
  const [imagePublicId, setImagePublicId] = useState<string>("");

  const form = useForm<z.infer<typeof QuestionSchema>>({
    resolver: zodResolver(QuestionSchema),
    defaultValues: {
      title: "",
      description: "",
      image: "",
      difficulty: "EASY",
    },
  });

  function handleImageUpload(url: string, publicId?: string) {
    setImageUrl(url);
    setImagePublicId(publicId || "");
    form.setValue("image", url);
  }

  function onSubmit(data: z.infer<typeof QuestionSchema>) {
    startTransition(async () => {
      const payload = {
        ...data,
        image: imageUrl || null,
      };

      const result = await createQuestion(payload);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Question created successfully!");
        form.reset();
        setImageUrl("");
        setImagePublicId("");
      }
    });
  }

  return (
    <Card className="w-full sm:max-w-md">
      {/* Card Header */}
      <CardHeader>
        <CardTitle>Create Question</CardTitle>
        <CardDescription>Add a new question to the database.</CardDescription>
      </CardHeader>
      <CardContent>
        <form id="form-question" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            {/* Question Title Field */}
            <Controller
              name="title"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-question-title">
                    Question Title
                  </FieldLabel>
                  <Input
                    {...field}
                    value={field.value}
                    id="form-question-title"
                    aria-invalid={fieldState.invalid}
                    placeholder="Enter question title"
                    autoComplete="off"
                    disabled={isPending}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            {/* Question Description Field */}
            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-question-description">
                    Question Description
                  </FieldLabel>
                  <Input
                    {...field}
                    value={field.value}
                    id="form-question-description"
                    aria-invalid={fieldState.invalid}
                    placeholder="Enter question description"
                    autoComplete="off"
                    disabled={isPending}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            {/* Image Field */}
            <Field>
              <FieldLabel>Question Image (Optional)</FieldLabel>
              <UploadWidget
                onUploadSuccess={handleImageUpload}
                folder="bebras/questions"
                allowedFormats={["png", "jpeg", "jpg"]}
              />
              {imageUrl && (
                <div className="mt-2 flex items-center space-x-2">
                  <Image
                    src={imageUrl}
                    alt="Uploaded"
                    className="w-20 h-20 object-cover rounded border"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageUrl("");
                      setImagePublicId("");
                      form.setValue("image", "");
                    }}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
              )}
            </Field>
            {/* Difficulty Field */}
            <Controller
              name="difficulty"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-question-difficulty">
                    Difficulty
                  </FieldLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isPending}
                  >
                    <SelectTrigger
                      id="form-question-difficulty"
                      className="w-full"
                    >
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EASY">Easy</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HARD">Hard</SelectItem>
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
            onClick={() => {
              form.reset();
              setImageUrl("");
              setImagePublicId("");
            }}
            disabled={isPending}
          >
            Reset
          </Button>
          <Button type="submit" form="form-question" disabled={isPending}>
            Submit
          </Button>
        </Field>
      </CardFooter>
    </Card>
  );
}

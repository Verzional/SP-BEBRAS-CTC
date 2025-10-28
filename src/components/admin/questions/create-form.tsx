"use client";

import Image from "next/image";
import { z } from "zod";
import { toast } from "sonner";
import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { createQuestion } from "@/services/question";
import { saveImageMetadata, deleteImage } from "@/services/image";
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
  const [uploadedImages, setUploadedImages] = useState<
    { url: string; publicId: string }[]
  >([]);

  const form = useForm<z.infer<typeof QuestionSchema>>({
    resolver: zodResolver(QuestionSchema),
    defaultValues: {
      title: "",
      description: "",
      difficulty: "EASY",
    },
  });

  function handleImageUpload(url: string, publicId?: string) {
    if (!publicId) {
      toast.error("Image upload failed: missing public ID.");
      return;
    }

    const newImage = { url, publicId };
    setUploadedImages((prev) => [...prev, newImage]);
    toast.info("Image uploaded, will be linked on submit.");
  }

  async function handleRemoveImage(publicIdToRemove: string) {
    const result = await deleteImage(publicIdToRemove);
    if (result.success) {
      setUploadedImages((prev) =>
        prev.filter((img) => img.publicId !== publicIdToRemove)
      );
      toast.success("Image removed.");
    } else {
      toast.error(result.error || "Failed to remove image.");
    }
  }

  function onSubmit(data: Omit<z.infer<typeof QuestionSchema>, "image">) {
    startTransition(async () => {
      const result = await createQuestion(data);

      if (result.error || !result.question) {
        toast.error(result.error || "Failed to create question.");
        for (const img of uploadedImages) {
          await deleteImage(img.publicId);
        }
        return;
      }

      const questionId = result.question.id;
      let allImagesSaved = true;

      for (const img of uploadedImages) {
        const metaResult = await saveImageMetadata(
          { public_id: img.publicId, secure_url: img.url },
          questionId,
          "question"
        );
        if (!metaResult.success) {
          allImagesSaved = false;
          toast.error(
            `Failed to link image ${img.publicId}: ${metaResult.error}`
          );
        }
      }

      if (allImagesSaved) {
        toast.success("Question created successfully!");
        form.reset();
        setUploadedImages([]);
      } else {
        toast.warning("Question created, but some images failed to link.");
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
              {uploadedImages.length > 0 && (
                <div className="mt-3 space-y-2">
                  {uploadedImages.map((img) => (
                    <div
                      key={img.publicId}
                      className="flex items-center space-x-3 p-2 border rounded-md"
                    >
                      <Image
                        src={img.url}
                        alt="Uploaded"
                        width={60}
                        height={60}
                        className="object-cover rounded border"
                      />
                      <span className="text-sm text-gray-600 flex-1 truncate">
                        {img.publicId.split("/").pop()}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(img.publicId)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium px-2 py-1"
                        disabled={isPending}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
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
              setUploadedImages([]);
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

"use client";

import Image from "next/image";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { updateQuestion } from "@/services/question";
import { saveImageMetadata, deleteImage } from "@/services/image";
import { QuestionSchema } from "@/types/db";
import { Question, Image as ImageType } from "@/generated/client/client";

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

interface QuestionEditFormProps {
  question: Question & { images?: ImageType[] };
}

export function QuestionEditForm({ question }: QuestionEditFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [uploadedImages, setUploadedImages] = useState<
    { url: string; publicId: string }[]
  >([]);
  const [existingImages, setExistingImages] = useState<ImageType[]>(
    question.images || []
  );

  const form = useForm<z.infer<typeof QuestionSchema>>({
    resolver: zodResolver(QuestionSchema),
    defaultValues: {
      title: question.title,
      description: question.description,
      difficulty: question.difficulty,
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

  async function handleRemoveNewImage(publicIdToRemove: string) {
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

  async function handleRemoveExistingImage(imageId: string) {
    const imageToRemove = existingImages.find((img) => img.id === imageId);
    if (!imageToRemove) return;

    const result = await deleteImage(imageToRemove.publicId);
    if (result.success) {
      setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
      toast.success("Image removed.");
    } else {
      toast.error(result.error || "Failed to remove image.");
    }
  }

  function onSubmit(data: z.infer<typeof QuestionSchema>) {
    startTransition(async () => {
      try {
        await updateQuestion(question.id, data);

        let allImagesSaved = true;
        for (const img of uploadedImages) {
          const metaResult = await saveImageMetadata(
            { public_id: img.publicId, secure_url: img.url },
            question.id,
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
          toast.success("Question updated successfully!");
          router.push(`/admin/questions/${question.id}`);
          router.refresh();
        } else {
          toast.warning("Question updated, but some images failed to link.");
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to update question"
        );
      }
    });
  }

  function handleCancel() {
    router.push(`/admin/questions/${question.id}`);
  }

  return (
    <Card className="w-full sm:max-w-md">
      {/* Card Header */}
      <CardHeader>
        <CardTitle>Edit Question</CardTitle>
        <CardDescription>
          Update question information in the database.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="form-question-edit" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            {/* Question Title Field */}
            <Controller
              name="title"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-question-edit-title">
                    Question Title
                  </FieldLabel>
                  <Input
                    {...field}
                    value={field.value}
                    id="form-question-edit-title"
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
                  <FieldLabel htmlFor="form-question-edit-description">
                    Question Description
                  </FieldLabel>
                  <Input
                    {...field}
                    value={field.value}
                    id="form-question-edit-description"
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
            {/* Difficulty Field */}
            <Controller
              name="difficulty"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-question-edit-difficulty">
                    Difficulty
                  </FieldLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isPending}
                  >
                    <SelectTrigger
                      id="form-question-edit-difficulty"
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
            {/* Existing Images */}
            {existingImages.length > 0 && (
              <Field>
                <FieldLabel>Existing Images</FieldLabel>
                <div className="space-y-2">
                  {existingImages.map((img) => (
                    <div
                      key={img.id}
                      className="flex items-center space-x-3 p-2 border rounded-md bg-gray-50"
                    >
                      <Image
                        src={img.url}
                        alt="Question image"
                        width={60}
                        height={60}
                        className="object-cover rounded border"
                      />
                      <span className="text-sm text-gray-600 flex-1 truncate">
                        {img.publicId.split("/").pop()}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingImage(img.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium px-2 py-1"
                        disabled={isPending}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </Field>
            )}
            {/* New Images Upload */}
            <Field>
              <FieldLabel>Add New Images (Optional)</FieldLabel>
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
                        onClick={() => handleRemoveNewImage(img.publicId)}
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
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        {/* Action Buttons */}
        <Field orientation="horizontal">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={isPending}
          >
            Reset
          </Button>
          <Button type="submit" form="form-question-edit" disabled={isPending}>
            Submit
          </Button>
        </Field>
      </CardFooter>
    </Card>
  );
}

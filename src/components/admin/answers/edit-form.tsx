"use client";

import Image from "next/image";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { Check, ChevronsUpDown } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";

import { cn } from "@/lib/utils";
import { updateAnswer } from "@/services/answer";
import { saveImageMetadata, deleteImage } from "@/services/image";
import { AnswerSchema } from "@/types/db";
import {
  Answer,
  Question,
  Image as ImageType,
} from "@/generated/client/client";

import { UploadWidget } from "@/components/layout/upload-widget";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface AnswerEditFormProps {
  answer: Answer & { images?: ImageType[] };
  questions?: Question[];
}

export function AnswerEditForm({
  answer,
  questions = [],
}: AnswerEditFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [uploadedImages, setUploadedImages] = useState<
    { url: string; publicId: string }[]
  >([]);
  const [existingImages, setExistingImages] = useState<ImageType[]>(
    answer.images || []
  );

  const form = useForm<z.infer<typeof AnswerSchema>>({
    resolver: zodResolver(AnswerSchema),
    defaultValues: {
      content: answer.content,
      questionId: answer.questionId,
      isCorrect: answer.isCorrect,
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

  function onSubmit(data: z.infer<typeof AnswerSchema>) {
    startTransition(async () => {
      try {
        await updateAnswer(answer.id, data);

        let allImagesSaved = true;
        for (const img of uploadedImages) {
          const metaResult = await saveImageMetadata(
            { public_id: img.publicId, secure_url: img.url },
            answer.id,
            "answer"
          );
          if (!metaResult.success) {
            allImagesSaved = false;
            toast.error(
              `Failed to link image ${img.publicId}: ${metaResult.error}`
            );
          }
        }

        if (allImagesSaved) {
          toast.success("answer updated successfully!");
          router.push(`/admin/questions`);
          router.refresh();
        } else {
          toast.warning("answer updated, but some images failed to link.");
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to update question"
        );
      }
    });
  }

  function handleCancel() {
    router.push(`/admin/questions`);
  }

  return (
    <Card className="w-full sm:max-w-md">
      <CardHeader>
        <CardTitle>Edit Answer</CardTitle>
        <CardDescription>Update the answer details.</CardDescription>
      </CardHeader>
      <CardContent>
        <form id="form-answer" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            {/* Answer Content Field */}
            <Controller
              name="content"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-answer-content">
                    Answer Content
                  </FieldLabel>
                  <Input
                    {...field}
                    id="form-answer-content"
                    aria-invalid={fieldState.invalid}
                    placeholder="Enter answer content"
                    autoComplete="off"
                    disabled={isPending}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            {/* Question Select Field */}
            <Controller
              name="questionId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Question</FieldLabel>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        aria-invalid={fieldState.invalid}
                        className={cn(
                          "w-full justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                        disabled={isPending}
                      >
                        {field.value
                          ? questions.find(
                              (question) => question.id === field.value
                            )?.title
                          : "Select a question..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search teams..." />
                        <CommandList>
                          <CommandEmpty>No question found.</CommandEmpty>
                          <CommandGroup>
                            {questions.map((question) => (
                              <CommandItem
                                key={question.id}
                                value={question.title}
                                onSelect={() => {
                                  field.onChange(question.id);
                                  setOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value === question.id
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {question.title}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FieldDescription>
                    Search and select the question this answer belongs to.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            {/* Is Correct Switch Field */}
            <Controller
              name="isCorrect"
              control={form.control}
              render={({ field }) => (
                <Field orientation="horizontal">
                  <div className="space-y-0.5">
                    <FieldLabel htmlFor="form-answer-correct">
                      Correct Answer
                    </FieldLabel>
                    <FieldDescription>
                      Mark this answer as the correct answer to the question.
                    </FieldDescription>
                  </div>
                  <Switch
                    id="form-answer-correct"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isPending}
                  />
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
          <Button type="submit" form="form-answer" disabled={isPending}>
            Update
          </Button>
        </Field>
      </CardFooter>
    </Card>
  );
}

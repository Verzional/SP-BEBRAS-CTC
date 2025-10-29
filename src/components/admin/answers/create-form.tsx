"use client";

import Image from "next/image";
import { z } from "zod";
import { toast } from "sonner";
import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { Check, ChevronsUpDown } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";

import { cn } from "@/lib/utils";
import { createAnswer } from "@/services/answer";
import { saveImageMetadata, deleteImage } from "@/services/image";
import { AnswerSchema } from "@/types/db";
import { Question } from "@/generated/client/client";

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

interface AnswerCreateFormProps {
  questions?: Question[];
}

export function AnswerCreateForm({ questions = [] }: AnswerCreateFormProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [uploadedImages, setUploadedImages] = useState<
    { url: string; publicId: string }[]
  >([]);

  const form = useForm<z.infer<typeof AnswerSchema>>({
    resolver: zodResolver(AnswerSchema),
    defaultValues: {
      content: "",
      questionId: "",
      correct: false,
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

  function onSubmit(data: Omit<z.infer<typeof AnswerSchema>, "image">) {
    startTransition(async () => {
      const result = await createAnswer(data);

      if (result.error || !result.answer) {
        toast.error(result.error || "Failed to create answer.");
        for (const img of uploadedImages) {
          await deleteImage(img.publicId);
        }
        return;
      }

      const answerId = result.answer.id;
      let allImagesSaved = true;

      for (const img of uploadedImages) {
        const metaResult = await saveImageMetadata(
          { public_id: img.publicId, secure_url: img.url },
          answerId,
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
        toast.success("Answer created successfully!");
        form.reset();
        setUploadedImages([]);
      } else {
        toast.warning("Answer created, but some images failed to link.");
      }
    });
  }

  return (
    <Card className="w-full sm:max-w-md">
      <CardHeader>
        <CardTitle>Create Answer</CardTitle>
        <CardDescription>Add a new answer to the question.</CardDescription>
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
                        <CommandInput placeholder="Search questions..." />
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
              name="correct"
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
          <Button type="submit" form="form-answer" disabled={isPending}>
            Submit
          </Button>
        </Field>
      </CardFooter>
    </Card>
  );
}

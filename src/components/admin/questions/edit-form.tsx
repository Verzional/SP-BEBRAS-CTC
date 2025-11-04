"use client";

import Image from "next/image";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, X } from "lucide-react";

import { updateQuestion } from "@/services/question";
import { saveImageMetadata, deleteImage } from "@/services/image";
import { QuestionWithAnswersSchema } from "@/types/db/question";
import {
  Question,
  Image as ImageType,
  Answer,
} from "@/generated/client/client";

import { UploadWidget } from "@/components/layout/upload-widget";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
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
  question: Question & {
    images?: ImageType[];
    answers?: (Answer & { images?: ImageType[] })[];
  };
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

  const form = useForm<z.infer<typeof QuestionWithAnswersSchema>>({
    resolver: zodResolver(QuestionWithAnswersSchema),
    defaultValues: {
      title: question.title,
      level: question.level,
      difficulty: question.difficulty,
      questionImages: [],
      answers: (question.answers || []).map((answer) => ({
        content: answer.content || "",
        correct: answer.correct,
        images: [],
      })),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "answers",
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

  function handleAnswerImageUpload(
    answerIndex: number,
    url: string,
    publicId?: string
  ) {
    if (!publicId) {
      toast.error("Image upload failed: missing public ID.");
      return;
    }

    const currentImages = form.getValues(`answers.${answerIndex}.images`) || [];
    form.setValue(`answers.${answerIndex}.images`, [
      ...currentImages,
      { url, publicId },
    ]);
    toast.info("Answer image uploaded.");
  }

  async function handleRemoveAnswerImage(
    answerIndex: number,
    publicIdToRemove: string
  ) {
    const result = await deleteImage(publicIdToRemove);
    if (result.success) {
      const currentImages = form.getValues(`answers.${answerIndex}.images`);
      form.setValue(
        `answers.${answerIndex}.images`,
        currentImages.filter((img) => img.publicId !== publicIdToRemove)
      );
      toast.success("Image removed.");
    } else {
      toast.error(result.error || "Failed to remove image.");
    }
  }

  async function handleRemoveExistingAnswerImage(
    answerIndex: number,
    imageId: string
  ) {
    const answerImages = question.answers?.[answerIndex]?.images;
    const imageToRemove = answerImages?.find((img) => img.id === imageId);
    if (!imageToRemove) return;

    const result = await deleteImage(imageToRemove.publicId);
    if (result.success) {
      // Note: This removes the image from the database immediately
      // The UI will update when the page refreshes or component re-mounts
      toast.success("Image removed.");
    } else {
      toast.error(result.error || "Failed to remove image.");
    }
  }

  function onSubmit(data: z.infer<typeof QuestionWithAnswersSchema>) {
    startTransition(async () => {
      try {
        // Extract question data from form data
        const { title, level, difficulty } = data;
        await updateQuestion(question.id, { title, level, difficulty });

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

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Edit Question</h2>
        <p className="text-muted-foreground">
          Update question information and answers in the database.
        </p>
      </div>

      <form id="form-question-edit" onSubmit={form.handleSubmit(onSubmit)}>
        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT/TOP: Question Details */}
          <Card>
            <CardHeader>
              <CardTitle>Question Details</CardTitle>
              <CardDescription>
                Update the question title, level, and settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                {/* Question Title */}
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

                {/* Question Level */}
                <Controller
                  name="level"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="form-question-edit-level">
                        Level
                      </FieldLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isPending}
                      >
                        <SelectTrigger
                          id="form-question-edit-level"
                          className="w-full"
                        >
                          <SelectValue placeholder="Select level" />
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

                {/* Question Difficulty */}
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
                          className="flex items-center space-x-3 p-2 border rounded-md"
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
            </CardContent>
          </Card>

          {/* RIGHT/BOTTOM: Answers */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle>Answer Options</CardTitle>
                  <CardDescription>
                    Edit answers, mark exactly 1 as correct
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({ content: "", correct: false, images: [] })
                  }
                  disabled={isPending}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <Card key={field.id} className="p-4 bg-muted/30">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        Answer {index + 1}
                      </span>
                      {fields.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => remove(index)}
                          disabled={isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    {/* Answer Content */}
                    <Controller
                      name={`answers.${index}.content`}
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <Input
                            {...field}
                            placeholder="Enter answer content"
                            disabled={isPending}
                          />
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />

                    {/* Correct Toggle */}
                    <Controller
                      name={`answers.${index}.correct`}
                      control={form.control}
                      render={({ field }) => (
                        <Field orientation="horizontal">
                          <FieldLabel className="text-sm">
                            Correct Answer
                          </FieldLabel>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isPending}
                          />
                        </Field>
                      )}
                    />

                    {/* Answer Images */}
                    <Controller
                      name={`answers.${index}.images`}
                      control={form.control}
                      render={({ field: imagesField }) => (
                        <Field>
                          <FieldLabel className="text-sm">
                            Images (Optional)
                          </FieldLabel>

                          <UploadWidget
                            onUploadSuccess={(url, publicId) =>
                              handleAnswerImageUpload(index, url, publicId)
                            }
                            folder={`bebras/answers`}
                            allowedFormats={["png", "jpeg", "jpg"]}
                          />

                          {/* Existing Answer Images */}
                          {question.answers?.[index]?.images &&
                            question.answers[index].images!.length > 0 && (
                              <div className="mt-2 space-y-2">
                                <div className="text-sm text-muted-foreground">
                                  Existing Images:
                                </div>
                                {question.answers[index].images!.map((img) => (
                                  <div key={img.id} className="relative w-full">
                                    <Image
                                      src={img.url}
                                      alt="Existing answer"
                                      width={0}
                                      height={0}
                                      sizes="100vw"
                                      className="w-full h-auto rounded"
                                    />
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleRemoveExistingAnswerImage(
                                          index,
                                          img.id
                                        )
                                      }
                                      className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-80 hover:opacity-100 transition-opacity"
                                      disabled={isPending}
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}

                          {imagesField.value &&
                            imagesField.value.length > 0 && (
                              <div className="mt-2 grid grid-cols-3 gap-2">
                                {imagesField.value.map((img) => (
                                  <div
                                    key={img.publicId}
                                    className="relative group aspect-square"
                                  >
                                    <Image
                                      src={img.url}
                                      alt="Answer"
                                      fill
                                      className="object-cover rounded border"
                                    />
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleRemoveAnswerImage(
                                          index,
                                          img.publicId
                                        )
                                      }
                                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                      disabled={isPending}
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                        </Field>
                      )}
                    />
                  </div>
                </Card>
              ))}

              {/* Form-level errors for answers */}
              {form.formState.errors.answers && (
                <FieldError
                  errors={[
                    {
                      message:
                        form.formState.errors.answers.message ||
                        form.formState.errors.answers.root?.message ||
                        "Invalid answers",
                    },
                  ]}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Bottom Action Bar */}
        <Card className="mt-6">
          <CardContent>
            <Field orientation="horizontal">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset();
                }}
                disabled={isPending}
              >
                Reset Form
              </Button>
              <Button type="submit" disabled={isPending}>
                Update Question & Answers
              </Button>
            </Field>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

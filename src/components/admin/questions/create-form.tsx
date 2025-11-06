"use client";

import Image from "next/image";
import { z } from "zod";
import { toast } from "sonner";
import { useState, useTransition } from "react";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";

import { createQuestion } from "@/services/question";
import { deleteImage } from "@/services/image";
import { QuestionWithAnswersSchema } from "@/types/db/question";

import { UploadWidget } from "@/components/layout/upload-widget";
import { ConfirmDialog } from "@/components/layout/confirm-dialog";
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

export function QuestionCreateForm() {
  const [isPending, startTransition] = useTransition();
  const [questionImages, setQuestionImages] = useState<
    { url: string; publicId: string }[]
  >([]);
  const [showQuestionImageDeleteDialog, setShowQuestionImageDeleteDialog] =
    useState(false);
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);
  const [showAnswerImageDeleteDialog, setShowAnswerImageDeleteDialog] =
    useState(false);
  const [answerImageToDelete, setAnswerImageToDelete] = useState<{
    publicId: string;
    answerIndex: number;
  } | null>(null);

  const form = useForm<z.infer<typeof QuestionWithAnswersSchema>>({
    resolver: zodResolver(QuestionWithAnswersSchema),
    defaultValues: {
      title: "",
      level: "SMP",
      difficulty: "EASY",
      questionImages: [],
      answers: [
        { content: "", correct: false, images: [] },
        { content: "", correct: false, images: [] },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "answers",
  });

  function handleQuestionImageUpload(url: string, publicId?: string) {
    if (!publicId) {
      toast.error("Image upload failed: missing public ID.");
      return;
    }

    const newImage = { url, publicId };
    setQuestionImages((prev) => [...prev, newImage]);
    toast.info("Question image uploaded.");
  }

  async function handleRemoveQuestionImage(publicIdToRemove: string) {
    const result = await deleteImage(publicIdToRemove);
    if (result.success) {
      setQuestionImages((prev) =>
        prev.filter((img) => img.publicId !== publicIdToRemove)
      );
      toast.success("Image removed.");
    } else {
      toast.error(result.error || "Failed to remove image.");
    }
  }

  const handleConfirmQuestionImageDelete = async () => {
    if (imageToDelete) {
      await handleRemoveQuestionImage(imageToDelete);
      setImageToDelete(null);
    }
  };

  const handleConfirmAnswerImageDelete = async () => {
    if (!answerImageToDelete) return;

    const result = await deleteImage(answerImageToDelete.publicId);
    if (result.success) {
      const currentImages = form.getValues(
        `answers.${answerImageToDelete.answerIndex}.images`
      );
      form.setValue(
        `answers.${answerImageToDelete.answerIndex}.images`,
        currentImages.filter(
          (img) => img.publicId !== answerImageToDelete.publicId
        )
      );
      toast.success("Image removed.");
    } else {
      toast.error(result.error || "Failed to remove image.");
    }
    setAnswerImageToDelete(null);
    setShowAnswerImageDeleteDialog(false);
  };

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
    setAnswerImageToDelete({ publicId: publicIdToRemove, answerIndex });
    setShowAnswerImageDeleteDialog(true);
  }

  async function cleanupAllImages() {
    for (const img of questionImages) {
      await deleteImage(img.publicId);
    }

    const answers = form.getValues("answers");
    for (const answer of answers) {
      for (const img of answer.images) {
        await deleteImage(img.publicId);
      }
    }
  }

  function onSubmit(data: z.infer<typeof QuestionWithAnswersSchema>) {
    startTransition(async () => {
      const formData = {
        ...data,
        questionImages,
      };

      const result = await createQuestion(formData);

      if (result.error || !result.question) {
        toast.error(result.error || "Failed to create question.");
        await cleanupAllImages();
        return;
      }

      toast.success("Question created successfully with all answers!");
      form.reset();
      setQuestionImages([]);
    });
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Create Question</h2>
        <p className="text-muted-foreground">
          Add a new question with answers to the database.
        </p>
      </div>

      <form id="form-question" onSubmit={form.handleSubmit(onSubmit)}>
        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT/TOP: Question Details */}
          <Card>
            <CardHeader>
              <CardTitle>Question Details</CardTitle>
              <CardDescription>
                Enter the question title, description, and settings
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

                {/* Level */}
                <Controller
                  name="level"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="form-question-level">
                        Level
                      </FieldLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isPending}
                      >
                        <SelectTrigger
                          id="form-question-level"
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

                {/* Difficulty */}
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

                {/* Round Type */}
                <Controller
                  name="roundType"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="form-question-roundType">
                        Round Type
                      </FieldLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isPending}
                      >
                        <SelectTrigger
                          id="form-question-roundType"
                          className="w-full"
                        >
                          <SelectValue placeholder="Select round type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PRELIMINARY">Preliminary</SelectItem>
                          <SelectItem value="FINAL">Final</SelectItem>
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                {/* Question Images */}
                <Field>
                  <FieldLabel>Question Images (Optional)</FieldLabel>
                  <UploadWidget
                    onUploadSuccess={handleQuestionImageUpload}
                    folder="bebras/questions"
                    allowedFormats={["png", "jpeg", "jpg"]}
                  />
                  {questionImages.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {questionImages.map((img) => (
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
                          <span className="text-sm text-muted-foreground flex-1 truncate">
                            {img.publicId.split("/").pop()}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setImageToDelete(img.publicId);
                              setShowQuestionImageDeleteDialog(true);
                            }}
                            className="text-red-600 hover:text-red-800 transition-colors text-sm font-medium px-2 py-1"
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
                    Add at least 2 answers, mark exactly 1 as correct
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
                          {imagesField.value &&
                            imagesField.value.length > 0 && (
                              <div className="mt-2 space-y-2">
                                {imagesField.value.map((img) => (
                                  <div
                                    key={img.publicId}
                                    className="flex items-center space-x-3 p-2 border rounded-md"
                                  >
                                    <Image
                                      src={img.url}
                                      alt="Answer"
                                      width={60}
                                      height={60}
                                      className="object-cover rounded border"
                                    />
                                    <span className="text-sm text-muted-foreground flex-1 truncate">
                                      {img.publicId.split("/").pop()}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleRemoveAnswerImage(
                                          index,
                                          img.publicId
                                        )
                                      }
                                      className="text-red-600 hover:text-red-800 transition-colors text-sm font-medium px-2 py-1"
                                      disabled={isPending}
                                    >
                                      Remove
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
                  setQuestionImages([]);
                }}
                disabled={isPending}
              >
                Reset Form
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Creating..." : "Create Question & Answers"}
              </Button>
            </Field>
          </CardContent>
        </Card>
      </form>

      <ConfirmDialog
        open={showQuestionImageDeleteDialog}
        onOpenChange={setShowQuestionImageDeleteDialog}
        title="Delete Question Image"
        description="Are you sure you want to delete this question image? This action cannot be undone."
        onConfirm={handleConfirmQuestionImageDelete}
        confirmText="Delete"
        variant="destructive"
      />

      <ConfirmDialog
        open={showAnswerImageDeleteDialog}
        onOpenChange={setShowAnswerImageDeleteDialog}
        title="Delete Answer Image"
        description="Are you sure you want to delete this answer image? This action cannot be undone."
        onConfirm={handleConfirmAnswerImageDelete}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
}

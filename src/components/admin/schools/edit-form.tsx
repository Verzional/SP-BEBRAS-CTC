"use client";

import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { updateSchool } from "@/services/school";
import { SchoolSchema } from "@/types/db";
import { School } from "@/generated/client/client";

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

interface SchoolEditFormProps {
  school: School;
}

export function SchoolEditForm({ school }: SchoolEditFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof SchoolSchema>>({
    resolver: zodResolver(SchoolSchema),
    defaultValues: {
      name: school.name,
      picName: school.picName ?? "",
      picEmail: school.picEmail ?? "",
      address: school.address ?? "",
    },
  });

  function onSubmit(data: z.infer<typeof SchoolSchema>) {
    startTransition(async () => {
      try {
        const payload = {
          ...data,
          picName: data.picName || null,
          picEmail: data.picEmail || null,
          address: data.address || null,
        };

        await updateSchool(school.id, payload);

        toast.success("School updated successfully!");
        router.push(`/admin/schools/${school.id}`);
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to update school"
        );
      }
    });
  }

  function handleCancel() {
    router.push(`/admin/schools/${school.id}`);
  }

  return (
    <Card className="w-full sm:max-w-md">
      {/* Card Header */}
      <CardHeader>
        <CardTitle>Edit School</CardTitle>
        <CardDescription>
          Update school information in the database.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="form-school-edit" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            {/* School Name Field */}
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-school-edit-name">
                    School Name
                  </FieldLabel>
                  <Input
                    {...field}
                    value={field.value}
                    id="form-school-edit-name"
                    aria-invalid={fieldState.invalid}
                    placeholder="Enter school name"
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
                  <FieldLabel htmlFor="form-school-edit-pic-name">
                    PIC Name
                  </FieldLabel>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    id="form-school-edit-pic-name"
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
            {/* PIC Email Field */}
            <Controller
              name="picEmail"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-school-edit-pic-email">
                    PIC Email
                  </FieldLabel>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    id="form-school-edit-pic-email"
                    aria-invalid={fieldState.invalid}
                    placeholder="Enter PIC email"
                    autoComplete="off"
                    disabled={isPending}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            {/* Address Field */}
            <Controller
              name="address"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-school-edit-address">
                    Address
                  </FieldLabel>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    id="form-school-edit-address"
                    aria-invalid={fieldState.invalid}
                    placeholder="Enter school address"
                    autoComplete="off"
                    disabled={isPending}
                  />
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
            onClick={handleCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" form="form-school-edit" disabled={isPending}>
            Save Changes
          </Button>
        </Field>
      </CardFooter>
    </Card>
  );
}

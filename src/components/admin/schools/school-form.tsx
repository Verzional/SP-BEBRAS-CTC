"use client";

import { z } from "zod";
import { toast } from "sonner";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { createSchool } from "@/services/school";
import { SchoolSchema } from "@/types/db";

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

export function SchoolForm() {
  {
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof SchoolSchema>>({
      resolver: zodResolver(SchoolSchema),
      defaultValues: {
        name: "",
        picName: "",
        picEmail: "",
        address: "",
      },
    });

    function onSubmit(data: z.infer<typeof SchoolSchema>) {
      startTransition(async () => {
        const payload = {
          ...data,
          picName: data.picName || null,
          picEmail: data.picEmail || null,
          address: data.address || null,
        };

        const result = await createSchool(payload);

        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success("School created successfully!");
          form.reset();
        }
      });
    }

    return (
      <Card className="w-full sm:max-w-md">
        <CardHeader>
          <CardTitle>Create School</CardTitle>
          <CardDescription>Add a new school to the database.</CardDescription>
        </CardHeader>
        <CardContent>
          <form id="form-school" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-school-name">
                      School Name
                    </FieldLabel>
                    <Input
                      {...field}
                      value={field.value}
                      id="form-school-name"
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
              <Controller
                name="picName"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-school-pic-name">
                      PIC Name
                    </FieldLabel>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      id="form-school-pic-name"
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
              <Controller
                name="picEmail"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-school-pic-email">
                      PIC Email
                    </FieldLabel>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      id="form-school-pic-email"
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
              <Controller
                name="address"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-school-address">
                      Address
                    </FieldLabel>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      id="form-school-address"
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
          <Field orientation="horizontal">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              disabled={isPending}
            >
              Reset
            </Button>
            <Button type="submit" form="form-school" disabled={isPending}>
              Submit
            </Button>
          </Field>
        </CardFooter>
      </Card>
    );
  }
}

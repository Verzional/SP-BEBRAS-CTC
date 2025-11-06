"use client";

import { z } from "zod";
import { toast } from "sonner";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { createRound } from "@/services/round";
import { RoundSchema } from "@/types/db/round";

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

export function RoundCreateForm() {
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof RoundSchema>>({
    resolver: zodResolver(RoundSchema),
    defaultValues: {
      name: "",
    },
  });

  function onSubmit(data: z.infer<typeof RoundSchema>) {
    startTransition(async () => {
      const result = await createRound(data);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Round created successfully!");
        form.reset();
      }
    });
  }

  return (
    <Card>
      {/* Card Header */}
      <CardHeader>
        <CardTitle>Create Round</CardTitle>
        <CardDescription>Add a new round to the database.</CardDescription>
      </CardHeader>
      <CardContent>
        <form id="form-round" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            {/* Round Name Field */}
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-round-name">
                    Round Name
                  </FieldLabel>
                  <Input
                    {...field}
                    value={field.value}
                    id="form-round-name"
                    aria-invalid={fieldState.invalid}
                    placeholder="Enter round name"
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
            onClick={() => form.reset()}
            disabled={isPending}
          >
            Reset
          </Button>
          <Button type="submit" form="form-round" disabled={isPending}>
            Submit
          </Button>
        </Field>
      </CardFooter>
    </Card>
  );
}

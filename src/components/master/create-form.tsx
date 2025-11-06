"use client";

import { z } from "zod";
import { toast } from "sonner";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { createAccount } from "@/services/account";
import { AccountSchema } from "@/types/db/account";

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

export function MasterCreateForm() {
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof AccountSchema>>({
    resolver: zodResolver(AccountSchema),
    defaultValues: {
      username: "",
      name: "",
      password: "",
      role: "ADMIN",
      teamId: undefined,
    },
  });

  function onSubmit(data: z.infer<typeof AccountSchema>) {
    startTransition(async () => {
      try {
        await createAccount(data);
        toast.success("Account created successfully!");
        form.reset();
      } catch (error) {
        toast.error((error as Error).message);
      }
    });
  }

  return (
    <Card>
      {/* Card Header */}
      <CardHeader>
        <CardTitle>Create Admin/Master Account</CardTitle>
        <CardDescription>
          Add a new admin or master account to the system.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="form-master-account" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            {/* Username Field */}
            <Controller
              name="username"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-master-account-username">
                    Username
                  </FieldLabel>
                  <Input
                    {...field}
                    value={field.value}
                    id="form-master-account-username"
                    aria-invalid={fieldState.invalid}
                    placeholder="Enter username"
                    autoComplete="off"
                    disabled={isPending}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            {/* Name Field */}
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-master-account-name">
                    Name
                  </FieldLabel>
                  <Input
                    {...field}
                    value={field.value}
                    id="form-master-account-name"
                    aria-invalid={fieldState.invalid}
                    placeholder="Enter full name"
                    autoComplete="off"
                    disabled={isPending}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            {/* Password Field */}
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-master-account-password">
                    Password
                  </FieldLabel>
                  <Input
                    {...field}
                    value={field.value}
                    type="password"
                    id="form-master-account-password"
                    aria-invalid={fieldState.invalid}
                    placeholder="Enter password"
                    autoComplete="off"
                    disabled={isPending}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            {/* Role Field */}
            <Controller
              name="role"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-master-account-role">
                    Role
                  </FieldLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isPending}
                  >
                    <SelectTrigger
                      id="form-master-account-role"
                      className="w-full"
                    >
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="MASTER">Master</SelectItem>
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
            onClick={() => form.reset()}
            disabled={isPending}
          >
            Reset
          </Button>
          <Button type="submit" form="form-master-account" disabled={isPending}>
            Create Account
          </Button>
        </Field>
      </CardFooter>
    </Card>
  );
}

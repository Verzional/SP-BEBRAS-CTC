"use client";

import { z } from "zod";
import { toast } from "sonner";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { createAccount } from "@/services/account";
import { AccountSchema } from "@/types/db";

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

export function AccountCreateForm() {
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof AccountSchema>>({
    resolver: zodResolver(AccountSchema),
    defaultValues: {
      username: "",
      name: "",
      password: "",
      role: "USER",
    },
  });

  function onSubmit(data: z.infer<typeof AccountSchema>) {
    startTransition(async () => {
      const result = await createAccount(data);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Account created successfully!");
        form.reset();
      }
    });
  }

  return (
    <Card className="w-full sm:max-w-md">
      {/* Card Header */}
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
        <CardDescription>Add a new account to the database.</CardDescription>
      </CardHeader>
      <CardContent>
        <form id="form-account" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            {/* Username Field */}
            <Controller
              name="username"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-account-username">
                    Username
                  </FieldLabel>
                  <Input
                    {...field}
                    value={field.value}
                    id="form-account-username"
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
                  <FieldLabel htmlFor="form-account-name">Full Name</FieldLabel>
                  <Input
                    {...field}
                    value={field.value}
                    id="form-account-name"
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
                  <FieldLabel htmlFor="form-account-password">
                    Password
                  </FieldLabel>
                  <Input
                    {...field}
                    value={field.value}
                    type="password"
                    id="form-account-password"
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
                  <FieldLabel htmlFor="form-account-role">Role</FieldLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isPending}
                  >
                    <SelectTrigger id="form-account-role" className="w-full">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USER">User</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="OPERATOR">Operator</SelectItem>
                      <SelectItem value="JUDGE">Judge</SelectItem>
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
          <Button type="submit" form="form-account" disabled={isPending}>
            Submit
          </Button>
        </Field>
      </CardFooter>
    </Card>
  );
}

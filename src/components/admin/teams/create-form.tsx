"use client";

import { z } from "zod";
import { toast } from "sonner";
import { useState, useTransition } from "react";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import { Check, ChevronsUpDown, Plus, Trash2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";

import { cn } from "@/lib/utils";
import { createTeamWithMembers } from "@/services/team";
import { TeamWithMembersSchema } from "@/types/db/team";
import { School } from "@/generated/client/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TeamCreateFormProps {
  schools?: School[];
}

export function TeamCreateForm({ schools = [] }: TeamCreateFormProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof TeamWithMembersSchema>>({
    resolver: zodResolver(TeamWithMembersSchema),
    defaultValues: {
      name: "",
      level: "SMP",
      schoolId: "",
      members: [{ name: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "members",
  });

  function onSubmit(data: z.infer<typeof TeamWithMembersSchema>) {
    startTransition(async () => {
      const result = await createTeamWithMembers(data);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Team created successfully with all members!");
        form.reset();
      }
    });
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Create Team</h2>
        <p className="text-muted-foreground">
          Add a new team with members to the competition.
        </p>
      </div>

      <form id="form-team" onSubmit={form.handleSubmit(onSubmit)}>
        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT/TOP: Team Details */}
          <Card>
            <CardHeader>
              <CardTitle>Team Details</CardTitle>
              <CardDescription>
                Enter the team name and select the school
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                {/* Team Name Field */}
                <Controller
                  name="name"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="form-team-name">
                        Team Name
                      </FieldLabel>
                      <Input
                        {...field}
                        id="form-team-name"
                        aria-invalid={fieldState.invalid}
                        placeholder="Enter team name"
                        autoComplete="off"
                        disabled={isPending}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                {/* School Select Field */}
                <Controller
                  name="schoolId"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>School</FieldLabel>
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
                              ? schools.find(
                                  (school) => school.id === field.value
                                )?.name
                              : "Select a school..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Search schools..." />
                            <CommandList>
                              <CommandEmpty>No school found.</CommandEmpty>
                              <CommandGroup>
                                {schools.map((school) => (
                                  <CommandItem
                                    key={school.id}
                                    value={school.name}
                                    onSelect={() => {
                                      field.onChange(school.id);
                                      setOpen(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        field.value === school.id
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    {school.name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FieldDescription>
                        Search and select the school this team belongs to.
                      </FieldDescription>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                {/* Level Select Field */}
                <Controller
                  name="level"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="form-team-level">
                        Level
                      </FieldLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isPending}
                      >
                        <SelectTrigger
                          id="form-team-level"
                          className="w-full"
                        >
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SMP">SMP</SelectItem>
                          <SelectItem value="SMA">SMA</SelectItem>
                        </SelectContent>
                      </Select>
                      <FieldDescription>
                        Select the education level for this team.
                      </FieldDescription>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>
            </CardContent>
          </Card>

          {/* RIGHT/BOTTOM: Team Members */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>
                    Add at least 1 member to the team
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ name: "" })}
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
                        Member {index + 1}
                      </span>
                      {fields.length > 1 && (
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

                    {/* Member Name */}
                    <Controller
                      name={`members.${index}.name`}
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <Input
                            {...field}
                            placeholder="Enter member name"
                            disabled={isPending}
                          />
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />
                  </div>
                </Card>
              ))}

              {/* Form-level errors for members */}
              {form.formState.errors.members && (
                <FieldError
                  errors={[
                    {
                      message:
                        form.formState.errors.members.message ||
                        form.formState.errors.members.root?.message ||
                        "Invalid members",
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
                onClick={() => form.reset()}
                disabled={isPending}
              >
                Reset Form
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Creating..." : "Create Team & Members"}
              </Button>
            </Field>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

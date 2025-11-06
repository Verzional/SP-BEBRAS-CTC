"use client";

import { useState, useTransition } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Check, ChevronsUpDown } from "lucide-react";

import { submitFinalScores } from "@/services/final";
import { cn } from "@/lib/utils";
import {
  FinalScoringFormSchema,
  type FinalScoringFormData,
} from "@/types/db/final";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface FinalScoringFormProps {
  rounds: { id: string; name: string }[];
  top5Teams: {
    SMA: { id: string; name: string }[];
    SMP: { id: string; name: string }[];
  };
}

export function FinalScoringForm({ rounds, top5Teams }: FinalScoringFormProps) {
  const [selectedRound, setSelectedRound] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [roundOpen, setRoundOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selectedLevel, setSelectedLevel] = useState<"SMP" | "SMA">("SMP");

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<FinalScoringFormData>({
    resolver: zodResolver(FinalScoringFormSchema),
    defaultValues: {
      level: "SMP",
      roundId: "",
      scores: top5Teams.SMP.map((team) => ({ teamId: team.id, score: 0 })),
    },
  });

  const { fields, replace } = useFieldArray({
    control,
    name: "scores",
  });

  const watchedScores = useWatch({ control, name: "scores" });

  const onSubmit = async (data: FinalScoringFormData) => {
    if (!selectedRound) {
      toast.error("Please select a round");
      return;
    }

    startTransition(async () => {
      const result = await submitFinalScores(data);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Final scores submitted successfully!");
        setSelectedLevel("SMP");
        setValue("level", "SMP");
        setValue("roundId", "");
        setSelectedRound(null);
        replace([]);
      }
    });
  };

  const handleLevelChange = (value: "SMP" | "SMA") => {
    setSelectedLevel(value);
    setValue("level", value);
    const levelTeams = top5Teams[value] || [];
    const scores = levelTeams.map((team) => ({ teamId: team.id, score: 0 }));
    replace(scores);
  };

  const handleRoundSelect = (round: { id: string; name: string }) => {
    setSelectedRound(round);
    setValue("roundId", round.id);
    setRoundOpen(false);
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Final Round Scoring</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Level Selection */}
          <div className="space-y-2">
            <Label htmlFor="level">Team Level</Label>
            <Select value={selectedLevel} onValueChange={handleLevelChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select team level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SMP">SMP (Junior High)</SelectItem>
                <SelectItem value="SMA">SMA (Senior High)</SelectItem>
              </SelectContent>
            </Select>
            {errors.level && (
              <p className="text-sm text-red-600">{errors.level.message}</p>
            )}
          </div>

          {/* Round Selection */}
          <div className="space-y-2">
            <Label>Round</Label>
            <Popover open={roundOpen} onOpenChange={setRoundOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={roundOpen}
                  className="w-full justify-between"
                >
                  {selectedRound ? selectedRound.name : "Select round..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search rounds..." />
                  <CommandList>
                    <CommandEmpty>No rounds found.</CommandEmpty>
                    <CommandGroup>
                      {rounds.map((round) => (
                        <CommandItem
                          key={round.id}
                          value={round.name}
                          onSelect={() => handleRoundSelect(round)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedRound?.id === round.id
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {round.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {errors.roundId && (
              <p className="text-sm text-red-600">{errors.roundId.message}</p>
            )}
          </div>

          {/* Teams and Scores */}
          {fields.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">Top 5 Teams</h3>
                <Badge variant="secondary">{selectedLevel}</Badge>
              </div>

              <div className="space-y-3">
                {fields.map((field, index) => {
                  const team = top5Teams[selectedLevel]?.[index];
                  if (!team) return null;

                  return (
                    <div
                      key={field.id}
                      className="flex items-center gap-4 p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{team.name}</p>
                      </div>
                      <div className="w-24">
                        <Label
                          htmlFor={`scores.${index}.score`}
                          className="text-sm"
                        >
                          Final Score
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          className="mt-1"
                          value={
                            watchedScores?.[index]?.score?.toString() ?? ""
                          }
                          onChange={(e) => {
                            const value = e.target.value;
                            const numValue =
                              value === "" ? 0 : parseInt(value, 10) || 0;
                            setValue(`scores.${index}.score`, numValue);
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isPending || fields.length === 0 || !selectedRound}
            className="w-full"
          >
            {isPending ? "Submitting..." : "Submit Final Scores"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";

interface ScoreEntry {
  round: string;
  score: number;
  judge: string;
}

interface TeamScore {
  teamId: string;
  teamName: string;
  schoolName: string;
  level: "SMP" | "SMA";
  scores: ScoreEntry[];
  totalScore: number;
}

interface TeamScoresProps {
  smpScores: TeamScore[];
  smaScores: TeamScore[];
}

export function TeamScores({ smpScores, smaScores }: TeamScoresProps) {
  const [selectedLevel, setSelectedLevel] = useState<"SMP" | "SMA">("SMP");
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());

  const teamScores = selectedLevel === "SMP" ? smpScores : smaScores;

  const toggleTeam = (teamId: string) => {
    const newExpanded = new Set(expandedTeams);
    if (newExpanded.has(teamId)) {
      newExpanded.delete(teamId);
    } else {
      newExpanded.add(teamId);
    }
    setExpandedTeams(newExpanded);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Team Scores</h1>
        <div className="flex items-center gap-4">
          <label htmlFor="level-select" className="text-sm font-medium">
            Level:
          </label>
          <Select
            value={selectedLevel}
            onValueChange={(value: "SMP" | "SMA") => setSelectedLevel(value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SMP">SMP</SelectItem>
              <SelectItem value="SMA">SMA</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {teamScores.map((team) => (
        <div key={team.teamId} className="border rounded-lg p-4">
          <Collapsible>
            <CollapsibleTrigger
              onClick={() => toggleTeam(team.teamId)}
              className="flex items-center justify-between w-full text-left"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {expandedTeams.has(team.teamId) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  <div>
                    <h2 className="text-lg font-semibold">{team.teamName}</h2>
                    <p className="text-sm text-muted-foreground">{team.schoolName}</p>
                  </div>
                </div>
                <Badge variant="secondary">{team.level}</Badge>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Total Score</div>
                <div className="text-xl font-bold">{team.totalScore}</div>
              </div>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <Table className="mt-4">
                <TableCaption>Score breakdown for {team.teamName} - {team.schoolName}</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Round</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Judge</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {team.scores.map((score, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {score.round}
                      </TableCell>
                      <TableCell>{score.score}</TableCell>
                      <TableCell>{score.judge}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CollapsibleContent>
          </Collapsible>
        </div>
      ))}
    </div>
  );
}

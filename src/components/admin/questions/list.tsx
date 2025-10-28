"use client";

import { useRouter } from "next/navigation";

import { FullQuestion } from "@/types/db";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface QuestionListProps {
  questions: FullQuestion[];
}

const difficultyColors = {
  EASY: "bg-green-500 hover:bg-green-600",
  MEDIUM: "bg-yellow-500 hover:bg-yellow-600",
  HARD: "bg-red-500 hover:bg-red-600",
} as const;

const difficultyLabels = {
  EASY: "Easy",
  MEDIUM: "Medium",
  HARD: "Hard",
} as const;

export function QuestionList({ questions = [] }: QuestionListProps) {
  const router = useRouter();

  return (
    <Table>
      <TableCaption>A list of questions in the database.</TableCaption>
      {/* Table Header */}
      <TableHeader>
        <TableRow>
          <TableHead>Code</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Difficulty</TableHead>
          <TableHead>Images</TableHead>
          <TableHead>Answers</TableHead>
        </TableRow>
      </TableHeader>
      {/* Table Body */}
      <TableBody>
        {questions.map((question) => (
          <TableRow
            key={question.id}
            onClick={() => router.push(`/admin/questions/${question.id}`)}
            className="cursor-pointer"
          >
            <TableCell className="font-medium">#{question.code}</TableCell>
            <TableCell className="max-w-md truncate">
              {question.title}
            </TableCell>
            <TableCell>
              <Badge className={difficultyColors[question.difficulty]}>
                {difficultyLabels[question.difficulty]}
              </Badge>
            </TableCell>
            <TableCell>{question.images?.length || 0}</TableCell>
            <TableCell>{question.answers?.length || 0}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

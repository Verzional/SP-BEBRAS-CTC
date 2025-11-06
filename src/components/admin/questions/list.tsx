"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";

import { FullQuestion } from "@/types/db/question";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface QuestionListProps {
  questions: FullQuestion[];
}

const ITEMS_PER_PAGE = 10;

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
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredQuestions = useMemo(() => {
    if (!searchTerm) return questions;
    return questions.filter((question) =>
      question.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [questions, searchTerm]);

  const totalPages = Math.ceil(filteredQuestions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedQuestions = filteredQuestions.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); 
  };

  return (
    <>
      {/* Search Bar */}
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search questions by title..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Table>
        <TableCaption>A list of questions in the database.</TableCaption>
        {/* Table Header */}
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Level</TableHead>
            <TableHead>Difficulty</TableHead>
            <TableHead>Round Type</TableHead>
            <TableHead>Answers</TableHead>
          </TableRow>
        </TableHeader>
        {/* Table Body */}
        <TableBody>
          {paginatedQuestions.map((question) => (
            <TableRow
              key={question.id}
              onClick={() => router.push(`/admin/questions/${question.id}`)}
              className="cursor-pointer"
            >
              <TableCell className="max-w-md truncate">
                {question.title}
              </TableCell>
              <TableCell>{question.level}</TableCell>
              <TableCell>
                <Badge className={difficultyColors[question.difficulty]}>
                  {difficultyLabels[question.difficulty]}
                </Badge>
              </TableCell>
              <TableCell>{question.roundType}</TableCell>
              <TableCell>{question.answers?.length || 0}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                className={
                  currentPage === 1
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => handlePageChange(page)}
                  isActive={currentPage === page}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  handlePageChange(Math.min(totalPages, currentPage + 1))
                }
                className={
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </>
  );
}

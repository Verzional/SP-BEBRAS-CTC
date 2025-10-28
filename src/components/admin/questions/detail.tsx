"use client";

import Link from "next/link";
import Image from "next/image";

import { Pencil, Trash } from "lucide-react";

import { deleteQuestion } from "@/services/question";
import { difficultyColors, difficultyLabels } from "@/utils/difficulty";
import { FullQuestion } from "@/types/db";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
} from "@/components/ui/card";

interface QuestionDetailProps {
  question: FullQuestion;
}

export function QuestionDetail({ question }: QuestionDetailProps) {
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>{question.title}</CardTitle>
        <CardDescription>View and manage question details</CardDescription>
        {/* Action Buttons */}
        <CardAction>
          <div className="flex gap-2">
            <Button variant="outline" size="icon-sm" asChild>
              <Link href={`/admin/questions/${question.id}/edit`}>
                <Pencil />
              </Link>
            </Button>
            <Button
              variant="destructive"
              size="icon-sm"
              className="hover:cursor-pointer"
              onClick={() => deleteQuestion(question.id)}
            >
              <Trash />
            </Button>
          </div>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Basic Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold leading-none">
              Basic Information
            </h3>
            <dl className="divide-y">
              <div className="grid grid-cols-[120px_1fr] gap-4 py-2">
                <dt className="text-muted-foreground text-sm font-medium">
                  Code
                </dt>
                <dd className="text-sm font-mono">#{question.code}</dd>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-4 py-2">
                <dt className="text-muted-foreground text-sm font-medium">
                  Title
                </dt>
                <dd className="text-sm">{question.title}</dd>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-4 py-2">
                <dt className="text-muted-foreground text-sm font-medium">
                  Description
                </dt>
                <dd className="text-sm">{question.description}</dd>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-4 py-2">
                <dt className="text-muted-foreground text-sm font-medium">
                  Difficulty
                </dt>
                <dd className="text-sm">
                  <Badge className={difficultyColors[question.difficulty]}>
                    {difficultyLabels[question.difficulty]}
                  </Badge>
                </dd>
              </div>
            </dl>
          </div>

          {/* Images Section */}
          {question.images && question.images.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold leading-none">Images</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {question.images.map((image) => (
                  <div
                    key={image.id}
                    className="relative aspect-square border rounded-lg overflow-hidden"
                  >
                    <Image
                      src={image.url}
                      alt={`Question image ${image.id}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Answers Section */}
          {question.answers && question.answers.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold leading-none">
                Answers ({question.answers.length})
              </h3>
              <div className="space-y-2">
                {question.answers.map((answer, index) => (
                  <div
                    key={answer.id}
                    className={`p-3 rounded-md border ${
                      answer.isCorrect
                        ? "bg-green-50 border-green-200"
                        : "bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-muted-foreground">
                            Option {String.fromCharCode(65 + index)}
                          </span>
                          {answer.isCorrect && (
                            <Badge variant="default" className="text-xs">
                              Correct Answer
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm">{answer.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

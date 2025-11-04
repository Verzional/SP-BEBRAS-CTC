"use client";

import Link from "next/link";
import Image from "next/image";
import { Pencil, Trash } from "lucide-react";

import { deleteQuestion } from "@/services/question";
import { difficultyColors, difficultyLabels } from "@/utils/difficulty";
import { FullQuestion } from "@/types/db/question";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardAction,
} from "@/components/ui/card";

interface QuestionDetailProps {
  question: FullQuestion;
}

export function QuestionDetail({ question }: QuestionDetailProps) {
  return (
    <Card className="gap-0">
      <CardHeader className="border-b">
        <CardTitle className="text-lg font-semibold leading-none">{question.title}</CardTitle>
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
            <dl className="divide-y">
              <div className="grid grid-cols-[120px_1fr] gap-4 py-4">
                <dt className="text-muted-foreground text-sm font-medium">
                  Description
                </dt>
                <dd className="text-sm whitespace-pre-wrap">
                  {question.description}
                </dd>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-4 py-4">
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
                  <div key={answer.id} className="p-3 rounded-md border">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-muted-foreground">
                            Option {String.fromCharCode(65 + index)}
                          </span>
                          {answer.correct && (
                            <Badge variant="default" className="text-xs">
                              Correct Answer
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-foreground">
                          {answer.content}
                        </p>
                      </div>
                      {answer.images && answer.images.length > 0 && (
                        <div className="flex gap-2">
                          {answer.images.map((image) => (
                            <div
                              key={image.id}
                              className="relative w-16 h-8 border rounded-lg overflow-hidden"
                            >
                              <Image
                                src={image.url}
                                alt={`Answer image ${image.id}`}
                                fill
                                className="object-contain"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="bg-background"
                        asChild
                      >
                        <Link href={`/admin/answers/${answer.id}/edit`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
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

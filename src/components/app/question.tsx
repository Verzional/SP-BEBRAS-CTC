"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { checkTeamSubmission } from "@/services/question";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";

interface QuestionProps {
  question: {
    id: string;
    title: string;
    description: string;
    code: number;
    difficulty: "EASY" | "MEDIUM" | "HARD";
    answers: {
      id: string;
      content: string;
      correct: boolean;
    }[];
    images: {
      id: string;
      url: string;
      publicId: string;
    }[];
  };
  teamId: string;
}

export function Question({ question, teamId }: QuestionProps) {
  const router = useRouter();
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    correct?: boolean;
    error?: string;
  } | null>(null);

  useEffect(() => {
    if (result) {
      const timer = setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [result, router]);

  const handleSubmit = async () => {
    if (!selectedAnswerId) return;

    setIsSubmitting(true);
    try {
      const response = await checkTeamSubmission(
        teamId,
        question.id,
        selectedAnswerId
      );
      setResult(response);
    } catch {
      setResult({ error: "Failed to submit answer" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (result) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card className="gap-4">
          <CardHeader>
            <CardTitle>Result</CardTitle>
          </CardHeader>
          <CardContent>
            {result.success ? (
              <div className="flex flex-col items-center gap-4 py-8">
                {result.correct ? (
                  <CheckCircle className="w-16 h-16 text-green-500" />
                ) : (
                  <XCircle className="w-16 h-16 text-red-500" />
                )}
                <div
                  className={`text-2xl font-bold text-center ${
                    result.correct ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {result.correct ? "Correct! +points" : "Incorrect -points"}
                </div>
                <p className="text-muted-foreground text-center">
                  Redirecting to dashboard in 2 seconds...
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <div className="text-destructive text-xl font-semibold">
                  {result.error}
                </div>
                <p className="text-muted-foreground mt-4">
                  Redirecting to dashboard in 2 seconds...
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="gap-4">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <h3 className="font-semibold">{question.title}</h3>
            <span
              className={`px-2 py-1 text-xs rounded ${
                question.difficulty === "EASY"
                  ? "bg-green-100 text-green-800"
                  : question.difficulty === "MEDIUM"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {question.difficulty}
            </span>
          </CardTitle>
          <CardDescription className="text-white">
            {question.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {question.images.length > 0 && (
            <div className="space-y-2">
              {question.images.map((image) => (
                <div key={image.id} className="relative w-full h-64">
                  <Image
                    src={image.url}
                    alt="Question image"
                    fill
                    className="object-contain rounded"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2">
            {question.answers.map((answer) => (
              <label
                key={answer.id}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name="answer"
                  value={answer.id}
                  checked={selectedAnswerId === answer.id}
                  onChange={(e) => setSelectedAnswerId(e.target.value)}
                  className="w-4 h-4"
                />
                <span>{answer.content}</span>
              </label>
            ))}
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!selectedAnswerId || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "Submitting..." : "Submit Answer"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

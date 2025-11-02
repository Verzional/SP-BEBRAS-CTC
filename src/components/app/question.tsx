"use client";

import Image from "next/image";
import { useState } from "react";
import { checkTeamSubmission } from "@/services/question";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    correct?: boolean;
    error?: string;
  } | null>(null);

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
        <Card>
          <CardHeader>
            <CardTitle>Result</CardTitle>
          </CardHeader>
          <CardContent>
            {result.success ? (
              <div
                className={`text-lg font-semibold ${
                  result.correct ? "text-green-600" : "text-red-600"
                }`}
              >
                {result.correct ? "Correct! +points" : "Incorrect -points"}
              </div>
            ) : (
              <div className="text-red-600">{result.error}</div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Question #{question.code}
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
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">{question.title}</h3>
            <p className="text-gray-700">{question.description}</p>
          </div>

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
            <h4 className="font-semibold">Answers:</h4>
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

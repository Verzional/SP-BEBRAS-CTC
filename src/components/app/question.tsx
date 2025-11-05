"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { checkTeamSubmission } from "@/services/question";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface QuestionProps {
  question: {
    id: string;
    title: string;
    level: "SMP" | "SMA";
    difficulty: "EASY" | "MEDIUM" | "HARD";
    answers: {
      id: string;
      content: string | null;
      correct: boolean;
      images?: {
        id: string;
        url: string;
        publicId: string;
      }[];
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
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedAnswerId) return;

    setIsSubmitting(true);
    try {
      const response = await checkTeamSubmission(
        teamId,
        question.id,
        selectedAnswerId
      );

      if (response.success) {
        if (response.correct) {
          toast.success("Correct! +points", {
            description: "Redirecting to dashboard...",
          });
        } else {
          toast.error("Incorrect -points", {
            description: "Redirecting to dashboard...",
          });
        }
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } else {
        toast.error(response.error || "Failed to submit answer", {
          description: "Redirecting to dashboard...",
        });
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      }
    } catch {
      toast.error("Failed to submit answer", {
        description: "Redirecting to dashboard...",
      });
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } finally {
      setIsSubmitting(false);
    }
  };

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
        </CardHeader>
        <CardContent className="space-y-4">
          {question.images.length > 0 && (
            <div className="space-y-2">
              {question.images.map((image) => (
                <div
                  key={image.id}
                  className="w-full cursor-pointer"
                  onClick={() => setZoomedImage(image.url)}
                >
                  <Image
                    src={image.url}
                    alt="Question image"
                    width={0}
                    height={0}
                    sizes="100vw"
                    className="w-full h-auto rounded"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2">
            {question.answers.map((answer) => (
              <div key={answer.id} className="cursor-pointer">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="answer"
                    value={answer.id}
                    checked={selectedAnswerId === answer.id}
                    onChange={(e) => setSelectedAnswerId(e.target.value)}
                    className="w-4 h-4"
                  />
                  <div className="flex-1">
                    <span>{answer.content ?? ""}</span>
                    {(answer.images ?? []).length > 0 && (
                      <div className="space-y-2 mt-2">
                        {(answer.images ?? []).map((image) => (
                          <div
                            key={image.id}
                            className="w-full cursor-pointer"
                            onClick={() => setZoomedImage(image.url)}
                          >
                            <Image
                              src={image.url}
                              alt="Answer image"
                              width={0}
                              height={0}
                              sizes="100vw"
                              className="w-full h-auto rounded"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
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

      <Dialog
        open={!!zoomedImage}
        onOpenChange={(open) => !open && setZoomedImage(null)}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{question.title}</DialogTitle>
          </DialogHeader>
          {zoomedImage && (
            <div className="relative w-full h-[80vh]">
              <Image
                src={zoomedImage}
                alt="Zoomed image"
                fill
                className="object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

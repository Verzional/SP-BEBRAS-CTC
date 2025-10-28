import { notFound } from "next/navigation";
import { getAnswerById } from "@/services/answer";
import { getAllQuestions } from "@/services/question";
import { IDParams } from "@/types/id";
import { AnswerEditForm } from "@/components/admin/answers/edit-form";

export default async function AnswerEditPage({ params }: IDParams) {
  const { id } = await params;
  const answer = await getAnswerById(id);
  const questions = await getAllQuestions();

  if (!answer) {
    notFound();
  }

  return <AnswerEditForm answer={answer} questions={questions} />;
}

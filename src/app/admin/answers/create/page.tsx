import { getAllQuestions } from "@/services/question";
import { AnswerCreateForm } from "@/components/admin/answers/create-form";

export default async function CreateAnswerPage() {
  const questions = await getAllQuestions();

  return <AnswerCreateForm questions={questions} />;
}

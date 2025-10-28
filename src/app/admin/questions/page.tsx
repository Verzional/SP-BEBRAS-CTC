import { getAllQuestions } from "@/services/question";
import { QuestionList } from "@/components/admin/questions/list";

export default async function QuestionsPage() {
  const questions = await getAllQuestions();

  return <QuestionList questions={questions} />;
}

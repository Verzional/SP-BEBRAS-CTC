import { notFound } from "next/navigation";
import { getQuestionById } from "@/services/question";
import { IDParams } from "@/types/id";
import { QuestionEditForm } from "@/components/admin/questions/edit-form";

export default async function QuestionEditPage({ params }: IDParams) {
  const { id } = await params;
  const question = await getQuestionById(id);

  if (!question) {
    notFound();
  }

  return <QuestionEditForm question={question} />;
}

import { notFound } from "next/navigation";
import { getQuestionById } from "@/services/question";
import { IDParams } from "@/types/id";
import { QuestionDetail } from "@/components/admin/questions/detail";

export default async function QuestionDetailPage({
  params,
}: IDParams) {
  const { id } = await params;
  const question = await getQuestionById(id);

  if (!question) {
    notFound();
  }

  return <QuestionDetail question={question} />;
}

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getQuestionById } from "@/services/question";
import { IDParams } from "@/types/id";
import { Question } from "@/components/app/question";

export default async function QuestionPage({ params }: IDParams) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user?.teamId) {
    redirect("/dashboard");
  }

  const question = await getQuestionById(id);

  if (!question) {
    return <div>Question not found</div>;
  }

  return <Question question={question} teamId={session.user.teamId} />;
}

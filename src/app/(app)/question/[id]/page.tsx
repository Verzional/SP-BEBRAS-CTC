import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getQuestionById, hasTeamAnswered } from "@/services/question";
import { IDParams } from "@/types/id";
import { Question } from "@/components/app/question";
import { ContestGuard } from "@/components/layout/contest-guard";

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

  const answeredCheck = await hasTeamAnswered(session.user.teamId, id);

  if (answeredCheck.error) {
    return <div>Error checking submission status</div>;
  }

  if (answeredCheck.hasAnswered) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Question Already Answered</h1>
          <p className="text-muted-foreground">
            You have already submitted an answer for this question.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ContestGuard />
      <Question question={question} teamId={session.user.teamId} />
    </>
  );
}

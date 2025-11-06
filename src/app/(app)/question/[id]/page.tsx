import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getQuestionById, hasTeamRecentlyAnswered } from "@/services/question";
import { IDParams } from "@/types/id";
import { Question } from "@/components/app/question";
import { ContestGuard } from "@/components/layout/contest-guard";
import { Role } from "@/generated/client/enums";

export default async function QuestionPage({ params }: IDParams) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user) {
    redirect("/auth/login");
  }

  const isAdminOrMaster =
    session.user.role === Role.ADMIN || session.user.role === Role.MASTER;

  if (!session.user.teamId && !isAdminOrMaster) {
    redirect("/dashboard");
  }

  const question = await getQuestionById(id);

  if (!question) {
    return <div>Question not found</div>;
  }

  if (!isAdminOrMaster) {
    const answeredCheck = await hasTeamRecentlyAnswered(session.user.teamId!, id, 10000);

    if (answeredCheck.error) {
      return <div>Error checking submission status</div>;
    }

    if (answeredCheck.hasAnswered && !answeredCheck.isRecent) {
      return (
        <div className="max-w-2xl mx-auto p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">
              Question Already Answered
            </h1>
            <p className="text-muted-foreground">
              You have already submitted an answer for this question.
            </p>
          </div>
        </div>
      );
    }
  }

  return (
    <>
      <Question question={question} teamId={session.user.teamId || ""} />
      <ContestGuard />
    </>
  );
}

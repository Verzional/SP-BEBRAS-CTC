import { getQuestionById } from "@/services/question";

export default async function QuestionPage({
  params,
}: {
  params: { code: string };
}) {
  const question = await getQuestionById(params.code);

  if (!question) {
    return <h1>Question not found.</h1>;
  }

  return (
    <div>
      <h2>
        {question.title} ({question.difficulty})
      </h2>
      <p>{question.description}</p>
      <ul>
        {question.answers.map((answer) => (
          <li key={answer.id}>{answer.content}</li>
        ))}
      </ul>
    </div>
  );
}

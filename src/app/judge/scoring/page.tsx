import { getAllRounds } from "@/services/round";
import { getTop5TeamsByScoreAndLevel } from "@/services/team";
import { FinalScoringForm } from "@/components/judge/final-scoring-form";

export default async function JudgeScoringPage() {
  const [rounds, top5SMA, top5SMP] = await Promise.all([
    getAllRounds(),
    getTop5TeamsByScoreAndLevel("SMA"),
    getTop5TeamsByScoreAndLevel("SMP"),
  ]);

  return (
    <FinalScoringForm
      rounds={rounds}
      top5Teams={{ SMA: top5SMA, SMP: top5SMP }}
    />
  );
}

import { getTopTeamScoresByLevel } from "@/services/final";
import { TeamScores } from "@/components/judge/team-scores";

export default async function JudgeScoresPage() {
  const [smpScores, smaScores] = await Promise.all([
    getTopTeamScoresByLevel("SMP"),
    getTopTeamScoresByLevel("SMA"),
  ]);

  return <TeamScores smpScores={smpScores} smaScores={smaScores} />;
}
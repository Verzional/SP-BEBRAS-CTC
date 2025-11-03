import { Leaderboard } from "@/components/app/leaderboard";
import { ContestGuard } from "@/components/layout/contest-guard";

export default function LeaderboardPage() {
  return (
    <>
      <ContestGuard />
      <Leaderboard />
    </>
  );
}

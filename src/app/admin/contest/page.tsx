import { getActiveContest } from "@/services/contest";
import { ContestButtons } from "@/components/admin/contest/contest-buttons";
import { ContestTimer } from "@/components/admin/contest/contest-timer";

export const dynamic = 'force-dynamic';

export default async function ContestPage() {
  const initialContestState = await getActiveContest();

  return (
    <>
      <ContestTimer />
      <ContestButtons initialContestState={initialContestState} />
    </>
  );
}

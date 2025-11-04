import { getActiveContest } from "@/services/contest";
import { ContestStatus } from "@/generated/client/enums";
import { Home } from "@/components/app/home";

export default async function HomePage() {
  const contest = await getActiveContest();
  const status = contest?.status ?? ContestStatus.PENDING;

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Home status={status} />
    </div>
  );
}
  
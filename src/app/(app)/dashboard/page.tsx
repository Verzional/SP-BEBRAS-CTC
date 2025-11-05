import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getTeamById, getTeamRank } from "@/services/team";
import { Dashboard } from "@/components/app/dashboard";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.teamId) {
    redirect("/auth/login");
  }

  const team = await getTeamById(session.user.teamId);

  if (!team) {
    return <div>Team not found</div>;
  }

  const rank = await getTeamRank(session.user.teamId);

  return (
    <>
      <Dashboard team={team} rank={rank ?? undefined} />
    </>
  );
}

import { auth } from "@/auth";
import { getTeamById, getTeamRank } from "@/services/team";
import { Dashboard } from "@/components/app/dashboard";
import { ContestGuard } from "@/components/layout/contest-guard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.teamId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p>
            You are not assigned to a team yet. Please contact an administrator
            to assign you to a team.
          </p>
        </div>
      </div>
    );
  }

  const team = await getTeamById(session.user.teamId);

  if (!team) {
    return <div>Team not found</div>;
  }

  const rank = await getTeamRank(session.user.teamId);

  return (
    <>
      <ContestGuard />
      <Dashboard team={team} rank={rank ?? undefined} />
    </>
  );
}

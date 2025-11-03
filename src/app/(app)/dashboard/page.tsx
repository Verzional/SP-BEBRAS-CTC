import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getTeamById } from "@/services/team";
import { Dashboard } from "@/components/app/dashboard";
import { ContestGuard } from "@/components/layout/contest-guard";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.teamId) {
    redirect("/auth/login");
  }

  const team = await getTeamById(session.user.teamId);

  if (!team) {
    return <div>Team not found</div>;
  }

  return (
    <>
      <ContestGuard />
      <Dashboard team={team} />
    </>
  );
}

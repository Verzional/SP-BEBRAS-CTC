import { auth } from "@/auth";
import { getTeamById } from "@/services/team";
import { Dashboard } from "@/components/app/dashboard";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.teamId) {
    // User doesn't have a team, redirect to login or show message
    redirect("/auth/login");
  }

  const team = await getTeamById(session.user.teamId);

  if (!team) {
    return <div>Team not found</div>;
  }

  return <Dashboard team={team} />;
}

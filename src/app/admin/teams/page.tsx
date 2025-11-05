import { getAllTeams } from "@/services/team";
import { TeamList } from "@/components/admin/teams/list";

export const dynamic = 'force-dynamic';

export default async function TeamsPage() {
  const teams = await getAllTeams();

  return <TeamList teams={teams} />;
}

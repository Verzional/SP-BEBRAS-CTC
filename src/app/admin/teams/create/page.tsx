import { getAllSchools } from "@/services/school";
import { TeamForm } from "@/components/admin/teams/team-form";

export default async function CreateTeamPage() {
  const schools = await getAllSchools();

  return <TeamForm schools={schools} />;
}

import { getAllSchools } from "@/services/school";
import { TeamCreateForm } from "@/components/admin/teams/create-form";

export default async function CreateTeamPage() {
  const schools = await getAllSchools();

  return <TeamCreateForm schools={schools} />;
}
  
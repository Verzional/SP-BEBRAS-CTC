import { getAllSchools } from "@/services/school";
import { TeamCreateForm } from "@/components/admin/teams/create-form";

export const dynamic = 'force-dynamic';

export default async function CreateTeamPage() {
  const schools = await getAllSchools();

  return <TeamCreateForm schools={schools} />;
}
  
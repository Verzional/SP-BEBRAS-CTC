import { notFound } from "next/navigation";
import { getTeamById } from "@/services/team";
import { getAllSchools } from "@/services/school";
import { IDParams } from "@/types/id";
import { TeamEditForm } from "@/components/admin/teams/edit-form";

export default async function TeamEditPage({ params }: IDParams) {
  const { id } = await params;
  const team = await getTeamById(id);
  const schools = await getAllSchools();

  if (!team) {
    notFound();
  }

  return <TeamEditForm team={team} schools={schools} />;
}

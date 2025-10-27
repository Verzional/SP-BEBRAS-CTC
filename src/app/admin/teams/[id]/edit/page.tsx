import { notFound } from "next/navigation";
import { getTeamById } from "@/services/team";
import { getAllSchools } from "@/services/school";
import { TeamEditForm } from "@/components/admin/teams/edit-form";

interface TeamEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function TeamEditPage({ params }: TeamEditPageProps) {
  const { id } = await params;
  const team = await getTeamById(id);
  const schools = await getAllSchools();

  if (!team) {
    notFound();
  }

  return <TeamEditForm team={team} schools={schools} />;
}

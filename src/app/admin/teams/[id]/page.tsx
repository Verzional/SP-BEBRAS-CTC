import { notFound } from "next/navigation";
import { getTeamById } from "@/services/team";
import { IDParams } from "@/types/id";
import { TeamDetail } from "@/components/admin/teams/detail";

export default async function TeamDetailPage({ params }: IDParams) {
  const { id } = await params;
  const team = await getTeamById(id);

  if (!team) {
    notFound();
  }

  return <TeamDetail team={team} />;
}

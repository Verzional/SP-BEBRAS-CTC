import { notFound } from "next/navigation";
import { getTeamById } from "@/services/team";
import { TeamDetail } from "@/components/admin/teams/detail";

interface TeamDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function TeamDetailPage({ params }: TeamDetailPageProps) {
  const { id } = await params;
  const team = await getTeamById(id);

  if (!team) {
    notFound();
  }

  return <TeamDetail team={team} />;
}

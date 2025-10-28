import { getAllTeams } from "@/services/team";
import { MemberCreateForm } from "@/components/admin/members/create-form";

export default async function CreateMemberPage() {
  const teams = await getAllTeams();

  return <MemberCreateForm teams={teams} />;
}

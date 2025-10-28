import { getAllTeams } from "@/services/team";
import { AccountCreateForm } from "@/components/auth/register-form";

export default async function CreateAccountPage() {
  const teams = await getAllTeams();

  return <AccountCreateForm teams={teams} />;
}

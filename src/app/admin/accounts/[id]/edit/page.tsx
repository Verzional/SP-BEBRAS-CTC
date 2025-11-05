import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getAccountById } from "@/services/account";
import { getAllTeams } from "@/services/team";
import { IDParams } from "@/types/id";
import { AccountEditForm } from "@/components/admin/accounts/edit-form";

export default async function EditAccountPage({ params }: IDParams) {
  const session = await auth();

  if (!session || !["ADMIN", "MASTER"].includes(session.user.role)) {
    notFound();
  }

  const { id } = await params;
  const account = await getAccountById(id);

  if (!account) {
    notFound();
  }

  const teams = await getAllTeams();

  const accountData = {
    ...account,
    teamId: account.teamId || undefined,
    team: account.team
      ? { id: account.team.id, name: account.team.name }
      : null,
  };

  return (
    <div className="container mx-auto py-8">
      <AccountEditForm account={accountData} teams={teams} />
    </div>
  );
}

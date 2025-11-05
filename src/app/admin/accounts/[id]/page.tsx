import { notFound } from "next/navigation";
import { getAccountById } from "@/services/account";
import { IDParams } from "@/types/id";
import { AccountDetail } from "@/components/admin/accounts/detail";

export const dynamic = "force-dynamic";

export default async function AccountDetailPage({ params }: IDParams) {
  const { id } = await params;
  const account = await getAccountById(id);

  if (!account) {
    notFound();
  }

  return <AccountDetail account={account} />;
}

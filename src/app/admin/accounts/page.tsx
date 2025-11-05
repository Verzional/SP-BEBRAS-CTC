import { getAllAccounts } from "@/services/account";
import { AccountList } from "@/components/admin/accounts/list";

export const dynamic = 'force-dynamic';

export default async function AccountsPage() {
  const accounts = await getAllAccounts();

  return <AccountList accounts={accounts} />;
}

import Link from "next/link";
import { checkAdmin } from "@/lib/session";
import { Dashboard } from "@/components/app/dashboard/dashboard";

export default async function DashboardPage() {
  const isAdmin = await checkAdmin();

  if (!isAdmin) {
    return (
      <div>
        <Dashboard />
      </div>
    );
  }

  return (
    <>
      <Link href="/admin" className="text-blue-500 underline">
        Admin Panel
      </Link>
    </>
  );
}

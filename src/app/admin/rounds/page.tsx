import { getAllRounds } from "@/services/round";
import { RoundList } from "@/components/admin/rounds/list";
import { Pagination } from "@/components/layout/pagination";

export default async function RoundsPage() {
  const rounds = await getAllRounds();

  return (
    <>
      <RoundList rounds={rounds} /> <Pagination />
    </>
  );
}

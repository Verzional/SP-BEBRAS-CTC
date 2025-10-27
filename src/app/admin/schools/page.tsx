import { getAllSchools } from "@/services/school";
import { SchoolList } from "@/components/admin/schools/list";
import { Pagination } from "@/components/layout/pagination";

export default async function SchoolsPage() {
  const schools = await getAllSchools();

  return (
    <>
      <SchoolList schools={schools} /> <Pagination />
    </>
  );
}

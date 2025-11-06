import { getAllSchools } from "@/services/school";
import { SchoolList } from "@/components/admin/schools/list";

export default async function SchoolsPage() {
  const schools = await getAllSchools();

  return (
    <>
      <SchoolList schools={schools} /> 
    </>
  );
}

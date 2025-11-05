import { notFound } from "next/navigation";
import { getSchoolById } from "@/services/school";
import { IDParams } from "@/types/id";
import { SchoolDetail } from "@/components/admin/schools/detail";

export default async function SchoolDetailPage({
  params,
}: IDParams) {
  const { id } = await params;
  const school = await getSchoolById(id);

  if (!school) {
    notFound();
  }

  return <SchoolDetail school={school} />;
}

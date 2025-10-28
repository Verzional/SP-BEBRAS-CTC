import { notFound } from "next/navigation";
import { getSchoolById } from "@/services/school";
import { IDParams } from "@/types/id";
import { SchoolEditForm } from "@/components/admin/schools/edit-form";

export default async function SchoolEditPage({ params }: IDParams) {
  const { id } = await params;
  const school = await getSchoolById(id);

  if (!school) {
    notFound();
  }

  return <SchoolEditForm school={school} />;
}

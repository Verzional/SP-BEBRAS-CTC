import { getSchoolById } from "@/services/school";
import { notFound } from "next/navigation";
import { SchoolEditForm } from "@/components/admin/schools/school-edit-form";

interface SchoolEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function SchoolEditPage({
  params,
}: SchoolEditPageProps) {
  const { id } = await params;
  const school = await getSchoolById(id);

  if (!school) {
    notFound();
  }

  return <SchoolEditForm school={school} />;
}

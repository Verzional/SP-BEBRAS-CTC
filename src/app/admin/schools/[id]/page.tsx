import { getSchoolById } from "@/services/school";
import { notFound } from "next/navigation";
import { SchoolDetail } from "@/components/admin/schools/school-detail";

interface SchoolDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function SchoolDetailPage({
  params,
}: SchoolDetailPageProps) {
  const { id } = await params;
  const school = await getSchoolById(id);

  if (!school) {
    notFound();
  }

  return <SchoolDetail school={school} />;
}
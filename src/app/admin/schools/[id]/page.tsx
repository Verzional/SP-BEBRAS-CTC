import { notFound } from "next/navigation";
import { getSchoolById } from "@/services/school";
import { SchoolDetail } from "@/components/admin/schools/detail";

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

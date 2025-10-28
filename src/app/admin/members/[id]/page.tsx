import { notFound } from "next/navigation";
import { getMemberById } from "@/services/member";
import { IDParams } from "@/types/id";
import { MemberDetail } from "@/components/admin/members/detail";

export default async function MemberDetailPage({ params }: IDParams) {
  const { id } = await params;
  const member = await getMemberById(id);

  if (!member) {
    notFound();
  }

  return <MemberDetail member={member} />;
}

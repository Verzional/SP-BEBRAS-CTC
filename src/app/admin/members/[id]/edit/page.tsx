import { notFound } from "next/navigation";
import { getMemberById } from "@/services/member";
import { IDParams } from "@/types/id";
import { MemberEditForm } from "@/components/admin/members/edit-form";

export default async function memberEditPage({ params }: IDParams) {
  const { id } = await params;
  const member = await getMemberById(id);

  if (!member) {
    notFound();
  }

  return <MemberEditForm member={member} />;
}

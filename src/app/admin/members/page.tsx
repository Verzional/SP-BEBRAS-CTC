import { getAllMembers } from "@/services/member";
import { MemberList } from "@/components/admin/members/list";

export default async function MembersPage() {
  const members = await getAllMembers();

  return <MemberList members={members} />;
}

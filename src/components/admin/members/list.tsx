"use client";

import { useRouter } from "next/navigation";

import { FullMember } from "@/types/db";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface MemberListProps {
  members: FullMember[];
}

export function MemberList({ members = [] }: MemberListProps) {
  const router = useRouter();

  return (
    <Table>
      <TableCaption>A list of members in the database.</TableCaption>
      {/* Table Header */}
      <TableHeader>
        <TableRow>
          <TableHead>No</TableHead>
          <TableHead>Member Name</TableHead>
          <TableHead>Team Name</TableHead>
        </TableRow>
      </TableHeader>
      {/* Table Body */}
      <TableBody>
        {members.map((member, index) => (
          <TableRow
            key={member.id}
            onClick={() => router.push(`/admin/members/${member.id}`)}
          >
            <TableCell>{index + 1}</TableCell>
            <TableCell>{member.name}</TableCell>
            <TableCell>{member.team?.name ?? "-"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

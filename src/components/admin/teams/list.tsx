"use client";

import { useRouter } from "next/navigation";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FullTeam } from "@/types/db";
import { QRCode } from "@/components/admin/core/qr-code";

interface TeamListProps {
  teams: FullTeam[];
}

export function TeamList({ teams = [] }: TeamListProps) {
  const router = useRouter();

  return (
    <Table>
      <TableCaption>A list of teams in the database.</TableCaption>
      {/* Table Header */}
      <TableHeader>
        <TableRow>
          <TableHead>No</TableHead>
          <TableHead>Team Name</TableHead>
          <TableHead>School Name</TableHead>
          <TableHead>QR Code</TableHead>
        </TableRow>
      </TableHeader>
      {/* Table Body */}
      <TableBody>
        {teams.map((team, index) => (
          <TableRow
            key={team.id}
            onClick={() => router.push(`/admin/teams/${team.id}`)}
          >
            <TableCell>{index + 1}</TableCell>
            <TableCell>{team.name}</TableCell>
            <TableCell>{team.school.name}</TableCell>
            <TableCell>
              <QRCode team={team} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

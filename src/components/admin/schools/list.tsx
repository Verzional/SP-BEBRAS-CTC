"use client";

import { useRouter } from "next/navigation";

import { School } from "@/generated/client/client";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface SchoolListProps {
  schools: School[];
}

export function SchoolList({ schools = [] }: SchoolListProps) {
  const router = useRouter();

  return (
    <Table>
      <TableCaption>A list of schools in the database.</TableCaption>
      {/* Table Header */}
      <TableHeader>
        <TableRow>
          <TableHead>No</TableHead>
          <TableHead>School Name</TableHead>
          <TableHead>PIC Name</TableHead>
          <TableHead>PIC Email</TableHead>
          <TableHead>Address</TableHead>
        </TableRow>
      </TableHeader>
      {/* Table Body */}
      <TableBody>
        {schools.map((school, index) => (
          <TableRow
            key={school.id}
            onClick={() => router.push(`/admin/schools/${school.id}`)}
          >
            <TableCell>{index + 1}</TableCell>
            <TableCell>{school.name}</TableCell>
            <TableCell>{school.picName}</TableCell>
            <TableCell>{school.picEmail}</TableCell>
            <TableCell>{school.address}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

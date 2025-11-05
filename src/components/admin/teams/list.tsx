"use client";

import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { FullTeam } from "@/types/db/team";
import { QRCode } from "@/components/admin/core/qr-code";

interface TeamListProps {
  teams: FullTeam[];
}

const ITEMS_PER_PAGE = 10;

export function TeamList({ teams = [] }: TeamListProps) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTeams = useMemo(() => {
    if (!searchTerm) return teams;
    return teams.filter((team) =>
      team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.school.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [teams, searchTerm]);

  const totalPages = Math.ceil(filteredTeams.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedTeams = filteredTeams.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  return (
    <>
      {/* Search Bar */}
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search teams by name or school..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="max-w-sm"
        />
      </div>

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
          {paginatedTeams.map((team, index) => (
            <TableRow
              key={team.id}
              onClick={() => router.push(`/admin/teams/${team.id}`)}
              className="cursor-pointer"
            >
              <TableCell>{startIndex + index + 1}</TableCell>
              <TableCell>{team.name}</TableCell>
              <TableCell>{team.school.name}</TableCell>
              <TableCell>
                <QRCode team={team} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                className={
                  currentPage === 1
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => handlePageChange(page)}
                  isActive={currentPage === page}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  handlePageChange(Math.min(totalPages, currentPage + 1))
                }
                className={
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </>
  );
}
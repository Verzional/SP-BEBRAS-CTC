"use client";

import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";

import { School } from "@/generated/client/client";

import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface SchoolListProps {
  schools: School[];
}

const ITEMS_PER_PAGE = 10;

interface SchoolListProps {
  schools: School[];
}

export function SchoolList({ schools = [] }: SchoolListProps) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSchools = useMemo(() => {
    if (!searchTerm) return schools;
    return schools.filter((school) =>
      school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (school.picName && school.picName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [schools, searchTerm]);

  const totalPages = Math.ceil(filteredSchools.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedSchools = filteredSchools.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  return (
    <>
      {/* Search Bar */}
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search schools by name or PIC name..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="max-w-sm"
        />
      </div>

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
          {paginatedSchools.map((school, index) => (
            <TableRow
              key={school.id}
              onClick={() => router.push(`/admin/schools/${school.id}`)}
              className="cursor-pointer"
            >
              <TableCell>{startIndex + index + 1}</TableCell>
              <TableCell>{school.name}</TableCell>
              <TableCell>{school.picName}</TableCell>
              <TableCell>{school.picEmail}</TableCell>
              <TableCell>{school.address}</TableCell>
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

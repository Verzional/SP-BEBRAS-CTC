"use client";

import { useState, useMemo, useTransition } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

import { deleteRound } from "@/services/round";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { ConfirmDialog } from "@/components/layout/confirm-dialog";

interface RoundListProps {
  rounds: { id: string; name: string }[];
}

const ITEMS_PER_PAGE = 10;

export function RoundList({ rounds = [] }: RoundListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roundToDelete, setRoundToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredRounds = useMemo(() => {
    if (!searchTerm) return rounds;
    return rounds.filter((round) =>
      round.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [rounds, searchTerm]);

  const totalPages = Math.ceil(filteredRounds.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedRounds = filteredRounds.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleDeleteClick = (round: { id: string; name: string }) => {
    setRoundToDelete(round);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!roundToDelete) return;

    startTransition(async () => {
      try {
        await deleteRound(roundToDelete.id);
        toast.success("Round deleted successfully!");
        // Optionally refresh the list or update state
      } catch (error) {
        toast.error("Failed to delete round: " + (error as Error).message);
      }
    });
  };

  return (
    <>
      {/* Search Bar */}
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search rounds by name..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Table>
        <TableCaption>A list of rounds in the database.</TableCaption>
        {/* Table Header */}
        <TableHeader>
          <TableRow>
            <TableHead>No</TableHead>
            <TableHead>Round Name</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        {/* Table Body */}
        <TableBody>
          {paginatedRounds.map((round, index) => (
            <TableRow key={round.id}>
              <TableCell>{startIndex + index + 1}</TableCell>
              <TableCell>{round.name}</TableCell>
              <TableCell>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteClick(round)}
                  disabled={isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
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

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Round"
        description={`Are you sure you want to delete "${roundToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        variant="destructive"
      />
    </>
  );
}

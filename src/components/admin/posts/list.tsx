"use client";

import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";

import { Post } from "@/generated/client/client";

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

interface PostListProps {
  posts: Post[];
}

const ITEMS_PER_PAGE = 10;

interface PostListProps {
  posts: Post[];
}

export function PostList({ posts = [] }: PostListProps) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPosts = useMemo(() => {
    if (!searchTerm) return posts;
    return posts.filter((post) =>
      post.postNumber.toString().includes(searchTerm.toLowerCase()) ||
      post.picName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [posts, searchTerm]);

  const totalPages = Math.ceil(filteredPosts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

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
          placeholder="Search posts by number or PIC name..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Table>
        <TableCaption>A list of posts in the database.</TableCaption>
        {/* Table Header */}
        <TableHeader>
          <TableRow>
            <TableHead>No</TableHead>
            <TableHead>Post Number</TableHead>
            <TableHead>PIC Name</TableHead>
            <TableHead>Level</TableHead>
          </TableRow>
        </TableHeader>
        {/* Table Body */}
        <TableBody>
          {paginatedPosts.map((post, index) => (
            <TableRow
              key={post.id}
              onClick={() => router.push(`/admin/posts/${post.id}`)}
              className="cursor-pointer"
            >
              <TableCell>{startIndex + index + 1}</TableCell>
              <TableCell>{post.postNumber}</TableCell>
              <TableCell>{post.picName}</TableCell>
              <TableCell>{post.level}</TableCell>
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
"use client";

import { useRouter } from "next/navigation";

import { Post } from "@/generated/client/client";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PostListProps {
  posts: Post[];
}

export function PostList({ posts = [] }: PostListProps) {
  const router = useRouter();

  return (
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
        {posts.map((post, index) => (
          <TableRow
            key={post.id}
            onClick={() => router.push(`/admin/posts/${post.id}`)}
          >
            <TableCell>{index + 1}</TableCell>
            <TableCell>{post.postNumber}</TableCell>
            <TableCell>{post.picName}</TableCell>
            <TableCell>{post.level}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
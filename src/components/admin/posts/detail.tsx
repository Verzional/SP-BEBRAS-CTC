"use client";

import Link from "next/link";
import { Pencil, Trash } from "lucide-react";

import { deletePost } from "@/services/post";
import { Post } from "@/generated/client/client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
} from "@/components/ui/card";

interface PostDetailProps {
  post: Post;
}

export function PostDetail({ post }: PostDetailProps) {
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Post #{post.postNumber}</CardTitle>
        <CardDescription>View and manage post details</CardDescription>
        {/* Action Buttons */}
        <CardAction>
          <div className="flex gap-2">
            <Button variant="outline" size="icon-sm" asChild>
              <Link href={`/admin/posts/${post.id}/edit`}>
                <Pencil />
              </Link>
            </Button>
            <Button
              variant="destructive"
              size="icon-sm"
              className="hover:cursor-pointer"
              onClick={() => deletePost(post.id)}
            >
              <Trash />
            </Button>
          </div>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Post Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold leading-none">
              Post Information
            </h3>
            <div className="divide-y">
              <div className="grid grid-cols-[120px_1fr] gap-4 py-2">
                <dt className="text-muted-foreground text-sm font-medium">
                  Post Number
                </dt>
                <dd className="text-sm">{post.postNumber}</dd>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-4 py-2">
                <dt className="text-muted-foreground text-sm font-medium">
                  PIC Name
                </dt>
                <dd className="text-sm">{post.picName}</dd>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-4 py-2">
                <dt className="text-muted-foreground text-sm font-medium">
                  Level
                </dt>
                <dd className="text-sm">{post.level}</dd>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

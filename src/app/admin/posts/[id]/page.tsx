import { notFound } from "next/navigation";
import { getPostById } from "@/services/post";
import { IDParams } from "@/types/id";
import { PostDetail } from "@/components/admin/posts/detail";

export const dynamic = 'force-dynamic';

export default async function PostDetailPage({ params }: IDParams) {
  const { id } = await params;
  const post = await getPostById(id);

  if (!post) {
    notFound();
  }

  return <PostDetail post={post} />;
}

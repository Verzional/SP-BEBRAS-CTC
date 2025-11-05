import { notFound } from "next/navigation";
import { getPostById } from "@/services/post";
import { IDParams } from "@/types/id";
import { PostEditForm } from "@/components/admin/posts/edit-form";

export const dynamic = 'force-dynamic';

export default async function EditPostPage({ params }: IDParams) {
  const { id } = await params;
  const post = await getPostById(id);

  if (!post) {
    notFound();
  }

  return <PostEditForm post={post} />;
}

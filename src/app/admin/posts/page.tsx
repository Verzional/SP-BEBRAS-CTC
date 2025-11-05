import { getAllPosts } from "@/services/post";
import { PostList } from "@/components/admin/posts/list";

export const dynamic = 'force-dynamic';

export default async function PostsPage() {
  const posts = await getAllPosts();

  return <PostList posts={posts} />;
}

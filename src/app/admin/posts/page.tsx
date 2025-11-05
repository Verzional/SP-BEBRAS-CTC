import { getAllPosts } from "@/services/post";
import { PostList } from "@/components/admin/posts/list";

export default async function PostsPage() {
  const posts = await getAllPosts();

  return <PostList posts={posts} />;
}

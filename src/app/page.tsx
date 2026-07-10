import { getBlogPostList } from "@/utilts/fileUtils";
import RecentPostsDesktop from "@/components/RecentPostsDesktop";

export default async function Home() {
  const posts = await getBlogPostList();

  const postsByLastModified = posts.slice().sort((a, b) => {
    return b.modifiedAt.getTime() - a.modifiedAt.getTime();
  });

  return (
    <RecentPostsDesktop
      posts={postsByLastModified.map((post) => ({
        title: post.title,
        path: post.path,
        modifiedAt: post.modifiedAt.toISOString(),
      }))}
    />
  );
}

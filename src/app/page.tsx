import { getBlogPostList } from "@/utilts/fileUtils";
import { PostsList } from "./PostsList";

export default async function Home() {
  const posts = await getBlogPostList();

  return (
    <section>
      <h1 className="text-lg font-bold">Recent posts:</h1>
      <PostsList posts={posts} />
    </section>
  );
}

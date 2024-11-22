import { getBlogPostList } from "@/utilts/fileUtils";
import Link from "next/link";

export default async function Home() {
  const posts = await getBlogPostList();

  return (
    <section>
      <h1 className="text-lg font-bold">Recent posts:</h1>
      <ul className="flex flex-col gap-y-2 mt-3">
        {posts.map((post) => {
          return (
            <Link
              href={post.path}
              className="bg-white h-full text-black p-4 rounded-sm"
              key={post.path}
            >
              {post.title}
            </Link>
          );
        })}
      </ul>
    </section>
  );
}

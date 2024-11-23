import { getBlogPostList } from "@/utilts/fileUtils";
import Link from "next/link";

export default async function Home() {
  const posts = await getBlogPostList();

  const postsByLastModified = (posts ?? []).toSorted((a, b) => {
    return b.modifiedAt.getTime() - a.modifiedAt.getTime();
  });

  return (
    <section>
      <h1 className="text-lg font-bold">Recent posts:</h1>
      <ul className="flex flex-col gap-y-2 mt-3">
        {postsByLastModified.map((post) => {
          return (
            <Link
              href={post.path}
              className="bg-white h-full text-black p-4 rounded-sm"
              key={post.path}
            >
              <p>{post.title}</p>
              <p>{`Last modified at ${post.createdAt.toLocaleDateString()}`}</p>
            </Link>
          );
        })}
      </ul>
    </section>
  );
}

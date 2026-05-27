import { getBlogPostList } from "@/utilts/fileUtils";
import Link from "next/link";

export default async function Home() {
  const posts = await getBlogPostList();

  // toSorted fails in github actions. switched to old approach
  const postsByLastModified = posts.slice().sort((a, b) => {
    return b.modifiedAt.getTime() - a.modifiedAt.getTime();
  });

  return (
    <section className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 shadow-lg">
      <h1 className="text-lg font-bold text-slate-900">Recent posts:</h1>
      <ul className="flex flex-col gap-y-2 mt-3">
        {postsByLastModified.map((post) => {
          return (
            <Link
              href={post.path}
              className="bg-white/30 backdrop-blur-sm h-full text-slate-900 p-4 rounded-xs border border-white/20 hover:bg-white/40 transition-colors"
              key={post.path}
            >
              <p className="font-medium">{post.title}</p>
              <p className="text-slate-600 text-sm">{`Last modified at ${post.modifiedAt.toDateString()}`}</p>
            </Link>
          );
        })}
      </ul>
    </section>
  );
}

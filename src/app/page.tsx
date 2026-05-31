import { getBlogPostList } from "@/utilts/fileUtils";
import GlassContainer from "@/components/GlassContainer";
import Link from "next/link";

export default async function Home() {
  const posts = await getBlogPostList();

  const postsByLastModified = posts.slice().sort((a, b) => {
    return b.modifiedAt.getTime() - a.modifiedAt.getTime();
  });

  return (
    <GlassContainer as="section" className="p-6">
      <h1 className="text-lg font-bold text-[var(--text-primary)]">Recent posts:</h1>
      <ul className="flex flex-col gap-y-2 mt-3">
        {postsByLastModified.map((post) => {
          return (
            <Link
              href={post.path}
              className="bg-white/30 backdrop-blur-sm h-full text-[var(--text-primary)] p-4 rounded-xs border border-white/20 hover:bg-white/40 transition-colors"
              key={post.path}
            >
              <p className="font-medium">{post.title}</p>
              <p className="text-[var(--text-muted)] text-sm">{`Last modified at ${post.modifiedAt.toDateString()}`}</p>
            </Link>
          );
        })}
      </ul>
    </GlassContainer>
  );
}

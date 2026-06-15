import { getBlogPostList } from "@/utilts/fileUtils";
import GlassContainer from "@/components/GlassContainer";
import Link from "next/link";

export default async function Home() {
  const posts = await getBlogPostList();

  const postsByLastModified = posts.slice().sort((a, b) => {
    return b.modifiedAt.getTime() - a.modifiedAt.getTime();
  });

  return (
    <GlassContainer as="section" className="glass-panel p-6">
      <h1 className="text-lg font-bold text-[var(--text-primary)]">Recent posts:</h1>
      <ul className="mt-3 flex flex-col gap-y-2">
        {postsByLastModified.map((post) => {
          return (
            <li key={post.path}>
              <GlassContainer
                as={Link}
                href={post.path}
                className="glass-panel glass-interactive block h-full p-4 text-[var(--text-primary)]"
              >
                <p className="font-medium">{post.title}</p>
                <p className="text-sm text-[var(--text-muted)]">{`Last modified at ${post.modifiedAt.toDateString()}`}</p>
              </GlassContainer>
            </li>
          );
        })}
      </ul>
    </GlassContainer>
  );
}

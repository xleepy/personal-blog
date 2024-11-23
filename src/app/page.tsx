import { getBlogPostList } from "@/utilts/fileUtils";
import Link from "next/link";
import { useRouter } from "next/router";

export default async function Home() {
  const router = useRouter();
  const posts = await getBlogPostList();

  if (router.isFallback) {
    return <p>Loading...</p>;
  }

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

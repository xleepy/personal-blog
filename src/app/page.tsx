import { getBlogPostList, Post } from "@/utilts/fileUtils";
import Link from "next/link";
import { Suspense, use, useMemo } from "react";

type PostsListProps = {
  postsPromise: Promise<Post[]>;
};

const PostsList = ({ postsPromise }: PostsListProps) => {
  const posts = use(postsPromise);

  const postsByLastModified = posts.toSorted((a, b) => {
    return b.modifiedAt.getTime() - a.modifiedAt.getTime();
  });

  return (
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
  );
};

export default async function Home() {
  const postsPromise = useMemo(() => {
    return getBlogPostList();
  }, []);

  return (
    <section>
      <h1 className="text-lg font-bold">Recent posts:</h1>
      <Suspense fallback={<p>Loading....</p>}>
        <PostsList postsPromise={postsPromise} />
      </Suspense>
    </section>
  );
}

"use client";

import { Post } from "@/utilts/fileUtils";
import Link from "next/link";

type PostsListProps = {
  posts: Post[];
};

export const PostsList = ({ posts }: PostsListProps) => {
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

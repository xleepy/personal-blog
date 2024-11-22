import PomodoroPost, { frontmatter } from "@/markdown/posts/pomodoro.mdx";
import { getBlogPostList } from "@/utilts/fileUtils";
import { MDXProps } from "mdx/types";
import { ReactNode } from "react";

export const metadata = {
  title: frontmatter.title,
};

const ComponentsMap: Record<string, (props: MDXProps) => ReactNode> = {
  pomodoro: PomodoroPost,
};

export default async function Page({
  params,
}: {
  params: { postSlug: string };
}) {
  const { postSlug } = await params;
  const Component = ComponentsMap[postSlug];
  return <Component />;
}

// Return a list of `params` to populate the [slug] dynamic segment
export async function generateStaticParams() {
  const posts = await getBlogPostList();

  return posts.map((post) => ({
    postSlug: post.path,
  }));
}

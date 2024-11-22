import { getBlogPostList, getPostMetadata } from "@/utilts/fileUtils";
import { MDXProps } from "mdx/types";
import { lazy, ReactNode, Suspense } from "react";

const ComponentsMap: Record<string, (props: MDXProps) => ReactNode> = {
  pomodoro: lazy(() => import("@/markdown/posts/pomodoro.mdx")),
};

type Params = {
  postSlug: string;
};

type Props = {
  params: Params;
};

export default async function Page({ params }: Props) {
  const { postSlug } = await params;
  const Component = ComponentsMap[postSlug];
  return (
    <Suspense fallback={"Loading..."}>
      <Component />
    </Suspense>
  );
}

// Return a list of `params` to populate the [slug] dynamic segment
export async function generateStaticParams() {
  const posts = await getBlogPostList();

  return posts.map((post) => ({
    postSlug: post.path,
  }));
}

export async function generateMetadata({ params }: Props) {
  const { postSlug } = await params;
  const metadata = await getPostMetadata(`${postSlug}.mdx`);
  return {
    title: metadata.title,
  };
}

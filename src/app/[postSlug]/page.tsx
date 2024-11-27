import { getBlogPostList, getPostMetadata } from "@/utilts/fileUtils";
import { lazy, Suspense } from "react";

const getComponentsMap = async () => {
  const posts = await getBlogPostList();
  return Object.fromEntries(
    posts.map((post) => [
      post.path,
      lazy(() => import(`@/markdown/posts/${post.path}.mdx`)),
    ])
  );
};

type Params = {
  postSlug: string;
};

type Props = {
  params: Promise<Params>;
};

export default async function Page({ params }: Props) {
  const { postSlug } = await params;
  const ComponentsMap = await getComponentsMap();
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

import FirstPost, { frontmatter } from "@/markdown/posts/firstPost.mdx";

export const metadata = {
  title: frontmatter.title,
};

export default function Page() {
  return <FirstPost />;
}

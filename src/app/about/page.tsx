import About, { frontmatter } from "@/markdown/about.mdx";

export const metadata = {
  title: frontmatter.title,
};

export default function Page() {
  return <About />;
}

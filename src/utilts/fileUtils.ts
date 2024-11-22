import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";

type Post = {
  title: string;
  path: string;
};

export async function getBlogPostList(): Promise<Post[]> {
  const fileNames = await readDirectory("src/markdown/posts");

  const blogPosts = [];

  for (const fileName of fileNames) {
    const rawContent = await readFile(`src/markdown/posts/${fileName}`);

    const { data: frontmatter } = matter(rawContent);

    blogPosts.push({
      slug: fileName.replace(".mdx", ""),
      ...frontmatter,
    });
  }

  return blogPosts as unknown as Post[];
}

export function readFile(localPath: string) {
  return fs.readFile(path.join(process.cwd(), localPath), "utf8");
}

function readDirectory(localPath: string) {
  return fs.readdir(path.join(process.cwd(), localPath));
}

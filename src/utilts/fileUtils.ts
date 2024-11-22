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
    const metadata = await getPostMetadata(fileName);

    blogPosts.push({
      slug: fileName.replace(".mdx", ""),
      ...metadata,
    });
  }

  return blogPosts as unknown as Post[];
}

export const getPostMetadata = async (post: string) => {
  const rawContent = await readFile(`src/markdown/posts/${post}`);

  const { data: frontmatter } = matter(rawContent);
  return frontmatter;
};

export function readFile(localPath: string) {
  return fs.readFile(path.join(process.cwd(), localPath), "utf8");
}

function readDirectory(localPath: string) {
  return fs.readdir(path.join(process.cwd(), localPath));
}

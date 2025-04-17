import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";

export type Post = {
  title: string;
  path: string;
  createdAt: Date;
  modifiedAt: Date;
};

export async function getBlogPostList(): Promise<Post[]> {
  const fileNames = await readDirectory("src/markdown/posts");

  const blogPosts: Post[] = [];

  for (const fileName of fileNames) {
    const metadata = await getPostMetadata(fileName);
    const stats = await readFileMetadata(`src/markdown/posts/${fileName}`);
    const createdAt = new Date(stats.birthtime);
    const modifiedAt = new Date(stats.mtime);

    blogPosts.push({
      title: metadata.title,
      path: fileName.replace(".mdx", ""),
      createdAt,
      modifiedAt,
    });
  }

  return blogPosts as unknown as Post[];
}

export const getPostMetadata = async (post: string) => {
  const rawContent = await readFile(`src/markdown/posts/${post}`);

  const { data: frontmatter } = matter(rawContent);
  return frontmatter;
};

function readFileMetadata(localPath: string) {
  return fs.stat(path.join(process.cwd(), localPath), {});
}

export function readFile(localPath: string) {
  return fs.readFile(path.join(process.cwd(), localPath), "utf8");
}

function readDirectory(localPath: string) {
  return fs.readdir(path.join(process.cwd(), localPath));
}

import { getBlogPostList } from "@/utilts/fileUtils";
import Link from "next/link";

export default async function Home() {
  const posts = await getBlogPostList();

  return (
    <ul className="">
      {posts.map((post, idx) => {
        return (
          <li key={idx}>
            <Link href={post.path}>{post.title}</Link>
          </li>
        );
      })}
    </ul>
  );
}

import PomodoroPost, { frontmatter } from "@/markdown/posts/pomodoro.mdx";

export const metadata = {
  title: frontmatter.title,
};

export default function Page() {
  return <PomodoroPost />;
}

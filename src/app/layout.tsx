import type { Metadata } from "next";
import "./globals.css";
import Desktop from "@/components/Desktop";
import { AppCanvas } from "@/components/AppCanvas";
import WeatherWidget from "@/components/WeatherWidget";
import { WeatherProvider } from "@/components/WeatherProvider";
import { getBlogPostList } from "@/utilts/fileUtils";

export const metadata: Metadata = {
  title: "My Blog 98",
  description: "A personal blog inspired by the Windows 98 desktop",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const posts = await getBlogPostList();
  const recentPosts = posts
    .sort((a, b) => b.modifiedAt.getTime() - a.modifiedAt.getTime())
    .map(({ title, path, modifiedAt }) => ({
      title,
      path,
      modifiedAt: modifiedAt.toISOString(),
    }));

  return (
    <html lang="en" className="h-full w-full">
      <body className="win98-page min-h-full w-full">
        <WeatherProvider>
          <Desktop posts={recentPosts}>{children}</Desktop>
          <AppCanvas />
          <WeatherWidget />
        </WeatherProvider>
      </body>
    </html>
  );
}

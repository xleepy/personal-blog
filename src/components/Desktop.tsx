"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import Header from "@/components/Header";
import Minesweeper from "@/components/Minesweeper";
import Paint from "@/components/Paint";
import RecentPostsExplorer, { type RecentPost } from "@/components/RecentPostsExplorer";
import {
  desktopAppTitles,
  DesktopWindowsContext,
  type DesktopAppId,
  type DesktopWindowId,
  type OpenWindow,
} from "@/components/desktop-windows";

const taskbarOrder: DesktopWindowId[] = ["recent-posts", "page", "minesweeper", "paint"];

type DesktopState = {
  pathname: string;
  windows: OpenWindow[];
};

export default function Desktop({ posts, children }: { posts: RecentPost[]; children: ReactNode }) {
  const pathname = usePathname().replace(/\/$/, "") || "/";
  const pageTitle = pathname === "/about"
    ? "About Me"
    : posts.find((post) => `/${post.path}` === pathname)?.title;

  const [desktop, setDesktop] = useState<DesktopState>(() => ({
    pathname,
    windows: pageTitle ? [{ id: "page", minimized: false }] : [],
  }));
  let { windows } = desktop;

  // Navigating to a document opens it in front while leaving desktop apps in place.
  if (pathname !== desktop.pathname) {
    const apps = windows.filter(({ id }) => id !== "page");
    windows = pageTitle ? [...apps, { id: "page", minimized: false }] : apps;
    setDesktop({ pathname, windows });
  }

  const activeWindowId = windows.findLast(({ minimized }) => !minimized)?.id;

  const activateWindow = (id: DesktopWindowId) => {
    if (activeWindowId === id) return;
    setDesktop((current) => ({
      ...current,
      windows: [...current.windows.filter((entry) => entry.id !== id), { id, minimized: false }],
    }));
  };

  const minimizeWindow = (id: DesktopWindowId) => {
    setDesktop((current) => ({
      ...current,
      windows: current.windows.map((entry) => entry.id === id ? { ...entry, minimized: true } : entry),
    }));
  };

  const closeWindow = (id: DesktopAppId) => {
    setDesktop((current) => ({
      ...current,
      windows: current.windows.filter((entry) => entry.id !== id),
    }));
  };

  const restorePage = (href: string) => {
    if (pathname === href && pageTitle) activateWindow("page");
  };

  const explorer = windows.find(({ id }) => id === "recent-posts");
  const tasks = taskbarOrder.flatMap((id) => {
    if (!windows.some((entry) => entry.id === id)) return [];
    const title = id === "page" ? pageTitle : desktopAppTitles[id];
    return title ? [{ id, title }] : [];
  });

  return (
    <DesktopWindowsContext value={{ windows, activeWindowId, activateWindow, minimizeWindow }}>
      <main className="win98-desktop-area" aria-label="Blog desktop">
        <div className="win98-desktop-icons">
          <button
            type="button"
            className="win98-desktop-shortcut"
            onClick={() => activateWindow("recent-posts")}
            aria-expanded={Boolean(explorer && !explorer.minimized)}
          >
            <span aria-hidden="true" className="win98-folder-icon"><span /></span>
            <span className="win98-shortcut-label">Recent Posts</span>
          </button>
          <Link
            href="/about"
            className="win98-desktop-shortcut"
            aria-current={pathname === "/about" ? "page" : undefined}
            onNavigate={() => restorePage("/about")}
          >
            <span aria-hidden="true" className="win98-computer-icon"><span /></span>
            <span className="win98-shortcut-label">About Me</span>
          </Link>
        </div>
        {explorer && (
          <RecentPostsExplorer
            posts={posts}
            onClose={() => closeWindow("recent-posts")}
            onOpenPost={restorePage}
          />
        )}
        {children}
        {windows.some(({ id }) => id === "minesweeper") && (
          <Minesweeper onClose={() => closeWindow("minesweeper")} />
        )}
        {windows.some(({ id }) => id === "paint") && (
          <Paint onClose={() => closeWindow("paint")} />
        )}
      </main>
      <Header tasks={tasks} onOpenAbout={() => restorePage("/about")} />
    </DesktopWindowsContext>
  );
}

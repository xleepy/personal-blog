"use client";

import Link from "next/link";
import { useState } from "react";
import { useDraggableWindow } from "@/hooks/useDraggableWindow";

export type RecentPost = {
  title: string;
  path: string;
  modifiedAt: string;
};

type RecentPostsDesktopProps = {
  posts: RecentPost[];
};

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));

export default function RecentPostsDesktop({ posts }: RecentPostsDesktopProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { windowRef, windowStyle, titlebarProps, resizeHandleProps } =
    useDraggableWindow({ minWidth: 420, minHeight: 300 });

  return (
    <section className="win98-desktop-area" aria-label="Blog desktop">
      <div className="win98-desktop-icons">
        <button
          type="button"
          className={`win98-desktop-shortcut ${isOpen ? "is-selected" : ""}`}
          onClick={() => setIsOpen(true)}
          aria-expanded={isOpen}
          aria-controls="recent-posts-window"
        >
          <span aria-hidden="true" className="win98-folder-icon">
            <span />
          </span>
          <span className="win98-shortcut-label">Recent Posts</span>
        </button>

        <Link href="/about" className="win98-desktop-shortcut">
          <span aria-hidden="true" className="win98-computer-icon">
            <span />
          </span>
          <span className="win98-shortcut-label">About Me</span>
        </Link>
      </div>

      {!isOpen && (
        <div className="win98-desktop-hint" role="status">
          Click the Recent Posts folder to open it.
        </div>
      )}

      {isOpen && (
        <section
          ref={windowRef}
          style={windowStyle}
          id="recent-posts-window"
          className="win98-window win98-explorer-window"
          aria-label="Recent Posts Explorer"
        >
          <div {...titlebarProps}>
            <div className="win98-titlebar-label">
              <span aria-hidden="true" className="win98-titlebar-icon" />
              <span className="truncate">Recent Posts - Exploring</span>
            </div>
            <div className="win98-titlebar-actions">
              <button
                type="button"
                className="win98-caption-button"
                aria-label="Minimize Recent Posts"
                onClick={() => setIsOpen(false)}
              >
                _
              </button>
              <button
                type="button"
                className="win98-caption-button"
                aria-label="Maximize Recent Posts"
                disabled
              >
                □
              </button>
              <button
                type="button"
                className="win98-caption-button"
                aria-label="Close Recent Posts"
                onClick={() => setIsOpen(false)}
              >
                ×
              </button>
            </div>
          </div>

          <div className="win98-menu-bar" aria-label="Explorer menu">
            <span><u>F</u>ile</span>
            <span><u>E</u>dit</span>
            <span><u>V</u>iew</span>
            <span><u>G</u>o</span>
            <span><u>F</u>avorites</span>
            <span><u>H</u>elp</span>
          </div>

          <div className="win98-toolbar" aria-hidden="true">
            <span className="win98-toolbar-button">←<small>Back</small></span>
            <span className="win98-toolbar-button is-disabled">→<small>Forward</small></span>
            <span className="win98-toolbar-divider" />
            <span className="win98-toolbar-button">↑<small>Up</small></span>
          </div>

          <div className="win98-address-bar">
            <span>Address</span>
            <div className="win98-address-input">
              <span aria-hidden="true" className="win98-mini-folder" />
              C:\My Blog\Recent Posts
            </div>
          </div>

          <div className="win98-explorer-content">
            <aside className="win98-explorer-sidebar">
              <div className="win98-sidebar-cloud" aria-hidden="true" />
              <h1>Recent Posts</h1>
              <p>These are the latest files published on my blog.</p>
            </aside>

            <div className="win98-file-pane">
              <table className="win98-file-list">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Date Modified</th>
                    <th>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post) => (
                    <tr key={post.path}>
                      <td>
                        <Link href={`/${post.path}`} className="win98-file-link">
                          <span aria-hidden="true" className="win98-document-icon" />
                          <span>{post.title}</span>
                        </Link>
                      </td>
                      <td>{formatDate(post.modifiedAt)}</td>
                      <td>Blog Post</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="win98-status-bar">
            <span>{posts.length} object{posts.length === 1 ? "" : "s"}</span>
            <span>My Computer</span>
          </div>
          <div {...resizeHandleProps} />
        </section>
      )}
    </section>
  );
}

"use client";

import Link from "next/link";
import Win98WindowShell from "@/components/Win98WindowShell";

export type RecentPost = {
  title: string;
  path: string;
  modifiedAt: string;
};

type RecentPostsExplorerProps = {
  posts: RecentPost[];
  onClose: () => void;
  onOpenPost: (href: string) => void;
};

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));

export default function RecentPostsExplorer({ posts, onClose, onOpenPost }: RecentPostsExplorerProps) {
  return (
    <Win98WindowShell
      windowId="recent-posts"
      title="Recent Posts - Exploring"
      label="Recent Posts"
      className="win98-explorer-window"
      minWidth={420}
      minHeight={300}
      closeAction={{ onClick: onClose }}
    >
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
                    <Link
                      href={`/${post.path}`}
                      className="win98-file-link"
                      onNavigate={() => onOpenPost(`/${post.path}`)}
                    >
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
    </Win98WindowShell>
  );
}

"use client";

import type { CSSProperties, ReactNode } from "react";
import Win98WindowShell from "@/components/Win98WindowShell";

type Win98WindowProps = {
  title: string;
  label: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  initialHeight?: CSSProperties["height"];
};

export default function Win98Window({
  title,
  label,
  children,
  className = "",
  contentClassName = "",
  initialHeight,
}: Win98WindowProps) {
  return (
    <Win98WindowShell
      windowId="page"
      title={title}
      label={label}
      className={`win98-page-window ${className}`}
      minWidth={320}
      minHeight={220}
      initialHeight={initialHeight}
      closeAction={{ href: "/" }}
    >
      <div className="win98-menu-bar" aria-label="Window menu">
        <span><u>F</u>ile</span>
        <span><u>E</u>dit</span>
        <span><u>V</u>iew</span>
        <span><u>H</u>elp</span>
      </div>
      <div className={`win98-window-content ${contentClassName}`}>{children}</div>
    </Win98WindowShell>
  );
}

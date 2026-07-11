"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import Win98WindowShell from "@/components/Win98WindowShell";

type Win98WindowProps = {
  title: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  initialHeight?: CSSProperties["height"];
};

export default function Win98Window({
  title,
  children,
  className = "",
  contentClassName = "",
  initialHeight,
}: Win98WindowProps) {
  return (
    <Win98WindowShell
      title={title}
      className={`win98-resizable-window ${className}`}
      minWidth={320}
      minHeight={220}
      initialHeight={initialHeight}
      captionActionsAriaHidden
      captionActions={
        <>
          <span className="win98-caption-button">_</span>
          <span className="win98-caption-button">□</span>
          <Link href="/" className="win98-caption-button" tabIndex={-1}>
            ×
          </Link>
        </>
      }
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

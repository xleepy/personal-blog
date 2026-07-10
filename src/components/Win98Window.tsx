"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { useDraggableWindow } from "@/hooks/useDraggableWindow";

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
  const { windowRef, windowStyle, titlebarProps, resizeHandleProps } =
    useDraggableWindow({ minWidth: 320, minHeight: 220, initialHeight });

  return (
    <section ref={windowRef} style={windowStyle} className={`win98-window win98-resizable-window ${className}`}>
      <div {...titlebarProps}>
        <div className="win98-titlebar-label">
          <span aria-hidden="true" className="win98-titlebar-icon" />
          <span className="truncate">{title}</span>
        </div>
        <div className="win98-titlebar-actions" aria-hidden="true">
          <span className="win98-caption-button">_</span>
          <span className="win98-caption-button">□</span>
          <Link href="/" className="win98-caption-button" tabIndex={-1}>
            ×
          </Link>
        </div>
      </div>
      <div className="win98-menu-bar" aria-label="Window menu">
        <span><u>F</u>ile</span>
        <span><u>E</u>dit</span>
        <span><u>V</u>iew</span>
        <span><u>H</u>elp</span>
      </div>
      <div className={`win98-window-content ${contentClassName}`}>{children}</div>
      <div {...resizeHandleProps} />
    </section>
  );
}

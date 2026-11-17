"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { type DesktopWindowId, useDesktopWindows } from "@/components/desktop-windows";
import { useDraggableWindow } from "@/hooks/useDraggableWindow";

type Win98WindowShellProps = {
  windowId: DesktopWindowId;
  title: string;
  label: string;
  children: ReactNode;
  closeAction: { href: string } | { onClick: () => void };
  titleIcon?: ReactNode;
  minWidth?: number;
  minHeight?: number;
  initialHeight?: CSSProperties["height"];
  className?: string;
};

export default function Win98WindowShell({
  windowId,
  title,
  label,
  children,
  closeAction,
  titleIcon = <span aria-hidden="true" className="win98-titlebar-icon" />,
  minWidth = 280,
  minHeight = 180,
  initialHeight,
  className = "",
}: Win98WindowShellProps) {
  const { windows, activeWindowId, activateWindow, minimizeWindow } = useDesktopWindows();
  const stackIndex = windows.findIndex(({ id }) => id === windowId);
  const { windowRef, windowStyle, titlebarProps, resizeHandleProps } =
    useDraggableWindow({ minWidth, minHeight, initialHeight });

  const focusWindow = () => activateWindow(windowId);
  const closeButtonProps = {
    className: "win98-caption-button",
    "aria-label": `Close ${label}`,
  };

  return (
    <section
      id={`${windowId}-window`}
      ref={windowRef}
      style={{ ...windowStyle, zIndex: stackIndex + 1 }}
      className={`win98-window ${className}`}
      aria-label={label}
      data-active={activeWindowId === windowId}
      hidden={windows[stackIndex]?.minimized}
      onPointerDownCapture={focusWindow}
      onFocusCapture={focusWindow}
    >
      <div {...titlebarProps}>
        <div className="win98-titlebar-label">
          {titleIcon}
          <span className="truncate">{title}</span>
        </div>
        <div className="win98-titlebar-actions">
          <button
            type="button"
            className="win98-caption-button"
            aria-label={`Minimize ${label}`}
            onClick={() => minimizeWindow(windowId)}
          >
            _
          </button>
          {"href" in closeAction ? (
            <Link href={closeAction.href} {...closeButtonProps}>×</Link>
          ) : (
            <button type="button" onClick={closeAction.onClick} {...closeButtonProps}>×</button>
          )}
        </div>
      </div>
      {children}
      <div {...resizeHandleProps} />
    </section>
  );
}

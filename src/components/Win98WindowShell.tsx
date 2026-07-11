"use client";

import type {
  ComponentPropsWithoutRef,
  CSSProperties,
  ReactNode,
} from "react";
import { useDraggableWindow } from "@/hooks/useDraggableWindow";

type Win98WindowShellProps = Omit<
  ComponentPropsWithoutRef<"section">,
  "children" | "title"
> & {
  title: ReactNode;
  children: ReactNode;
  captionActions?: ReactNode;
  captionActionsAriaHidden?: boolean;
  titleIcon?: ReactNode;
  minWidth?: number;
  minHeight?: number;
  initialHeight?: CSSProperties["height"];
};

export default function Win98WindowShell({
  title,
  children,
  captionActions,
  captionActionsAriaHidden = false,
  titleIcon = <span aria-hidden="true" className="win98-titlebar-icon" />,
  minWidth = 280,
  minHeight = 180,
  initialHeight,
  className = "",
  style,
  ...sectionProps
}: Win98WindowShellProps) {
  const { windowRef, windowStyle, titlebarProps, resizeHandleProps } =
    useDraggableWindow({ minWidth, minHeight, initialHeight });

  return (
    <section
      ref={windowRef}
      style={{ ...windowStyle, ...style }}
      className={`win98-window ${className}`}
      {...sectionProps}
    >
      <div {...titlebarProps}>
        <div className="win98-titlebar-label">
          {titleIcon}
          <span className="truncate">{title}</span>
        </div>
        {captionActions && (
          <div
            className="win98-titlebar-actions"
            aria-hidden={captionActionsAriaHidden || undefined}
          >
            {captionActions}
          </div>
        )}
      </div>
      {children}
      <div {...resizeHandleProps} />
    </section>
  );
}

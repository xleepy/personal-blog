"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";

type Position = {
  x: number;
  y: number;
};

type Size = {
  width: number;
  height: number;
};

type DraggableWindowOptions = {
  minWidth?: number;
  minHeight?: number;
  initialHeight?: CSSProperties["height"];
};

type DragState = {
  pointerId: number;
  startX: number;
  startY: number;
  origin: Position;
  bounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
};

let topWindowZIndex = 100;

export function useDraggableWindow({
  minWidth = 280,
  minHeight = 180,
  initialHeight,
}: DraggableWindowOptions = {}) {
  const windowRef = useRef<HTMLElement>(null);
  const dragState = useRef<DragState | null>(null);
  const listenerCleanupRef = useRef<(() => void) | null>(null);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [size, setSize] = useState<Size>();
  const [zIndex, setZIndex] = useState<number>();
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  const bringToFront = () => {
    topWindowZIndex += 1;
    setZIndex(topWindowZIndex);
  };

  useEffect(() => () => listenerCleanupRef.current?.(), []);

  const onPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.button !== 0) return;
    if ((event.target as Element).closest(".win98-titlebar-actions")) return;

    const windowElement = windowRef.current;
    if (!windowElement) return;

    const rect = windowElement.getBoundingClientRect();
    const taskbarHeight = 44;
    dragState.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      origin: position,
      bounds: {
        minX: Math.min(0, -rect.left),
        maxX: Math.max(0, window.innerWidth - rect.right),
        minY: Math.min(0, -rect.top),
        maxY: Math.max(0, window.innerHeight - taskbarHeight - rect.bottom),
      },
    };

    event.preventDefault();
    bringToFront();
    setIsDragging(true);

    const onWindowPointerMove = (pointerEvent: PointerEvent) => {
      const drag = dragState.current;
      if (!drag || drag.pointerId !== pointerEvent.pointerId) return;

      const deltaX = Math.min(
        drag.bounds.maxX,
        Math.max(drag.bounds.minX, pointerEvent.clientX - drag.startX),
      );
      const deltaY = Math.min(
        drag.bounds.maxY,
        Math.max(drag.bounds.minY, pointerEvent.clientY - drag.startY),
      );
      setPosition({ x: drag.origin.x + deltaX, y: drag.origin.y + deltaY });
    };

    const finishDrag = (pointerEvent: PointerEvent) => {
      if (dragState.current?.pointerId !== pointerEvent.pointerId) return;
      dragState.current = null;
      setIsDragging(false);
      listenerCleanupRef.current?.();
    };

    listenerCleanupRef.current?.();
    listenerCleanupRef.current = () => {
      window.removeEventListener("pointermove", onWindowPointerMove);
      window.removeEventListener("pointerup", finishDrag);
      window.removeEventListener("pointercancel", finishDrag);
      listenerCleanupRef.current = null;
    };
    window.addEventListener("pointermove", onWindowPointerMove);
    window.addEventListener("pointerup", finishDrag);
    window.addEventListener("pointercancel", finishDrag);
  };

  const onResizePointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.button !== 0) return;
    const windowElement = windowRef.current;
    if (!windowElement) return;

    const rect = windowElement.getBoundingClientRect();
    const taskbarHeight = 44;
    const maximumWidth = Math.max(160, window.innerWidth - rect.left);
    const maximumHeight = Math.max(120, window.innerHeight - taskbarHeight - rect.top);
    const minimumWidth = Math.min(minWidth, maximumWidth);
    const minimumHeight = Math.min(minHeight, maximumHeight);
    const pointerId = event.pointerId;
    const startX = event.clientX;
    const startY = event.clientY;

    event.preventDefault();
    event.stopPropagation();
    bringToFront();
    setIsResizing(true);

    const onWindowPointerMove = (pointerEvent: PointerEvent) => {
      if (pointerEvent.pointerId !== pointerId) return;
      setSize({
        width: Math.min(
          maximumWidth,
          Math.max(minimumWidth, rect.width + pointerEvent.clientX - startX),
        ),
        height: Math.min(
          maximumHeight,
          Math.max(minimumHeight, rect.height + pointerEvent.clientY - startY),
        ),
      });
    };

    const finishResize = (pointerEvent: PointerEvent) => {
      if (pointerEvent.pointerId !== pointerId) return;
      setIsResizing(false);
      listenerCleanupRef.current?.();
    };

    listenerCleanupRef.current?.();
    listenerCleanupRef.current = () => {
      window.removeEventListener("pointermove", onWindowPointerMove);
      window.removeEventListener("pointerup", finishResize);
      window.removeEventListener("pointercancel", finishResize);
      listenerCleanupRef.current = null;
    };
    window.addEventListener("pointermove", onWindowPointerMove);
    window.addEventListener("pointerup", finishResize);
    window.addEventListener("pointercancel", finishResize);
  };

  const windowStyle: CSSProperties = {
    translate: `${position.x}px ${position.y}px`,
    zIndex,
    ...(!size && initialHeight ? { height: initialHeight } : {}),
    ...(size
      ? {
          width: `${size.width}px`,
          height: `${size.height}px`,
          maxWidth: "none",
          maxHeight: "none",
        }
      : {}),
  };

  const resizeHandleStyle: CSSProperties = {
    position: "absolute",
    zIndex: 5,
    right: 2,
    bottom: 2,
    width: 17,
    height: 17,
    overflow: "hidden",
    background:
      "linear-gradient(135deg, transparent 0 48%, #fff 49% 55%, transparent 56%), linear-gradient(135deg, transparent 0 65%, #808080 66% 72%, transparent 73%), linear-gradient(135deg, transparent 0 81%, #000 82% 88%, transparent 89%)",
    cursor: "nwse-resize",
    touchAction: "none",
  };

  return {
    windowRef,
    windowStyle,
    resizeHandleProps: {
      onPointerDown: onResizePointerDown,
      className: `win98-resize-handle${isResizing ? " is-resizing" : ""}`,
      style: resizeHandleStyle,
      "aria-hidden": true,
    },
    titlebarProps: {
      onPointerDown,
      className: `win98-titlebar${isDragging ? " is-dragging" : ""}`,
    },
  };
}

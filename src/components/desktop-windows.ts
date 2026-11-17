"use client";

import { createContext, useContext } from "react";

export const desktopAppTitles = {
  "recent-posts": "Recent Posts",
  minesweeper: "Minesweeper",
  paint: "Paint",
};

export type DesktopAppId = keyof typeof desktopAppTitles;
export type DesktopWindowId = DesktopAppId | "page";

export type OpenWindow = {
  id: DesktopWindowId;
  minimized: boolean;
};

type DesktopWindows = {
  windows: OpenWindow[];
  activeWindowId: DesktopWindowId | undefined;
  activateWindow: (id: DesktopWindowId) => void;
  minimizeWindow: (id: DesktopWindowId) => void;
};

export const DesktopWindowsContext = createContext<DesktopWindows | null>(null);

export function useDesktopWindows() {
  const desktop = useContext(DesktopWindowsContext);
  if (!desktop) throw new Error("Windows must be rendered inside the desktop.");
  return desktop;
}

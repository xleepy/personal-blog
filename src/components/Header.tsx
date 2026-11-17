"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertTriangle } from "react-feather";
import Win98Clock from "@/components/Win98Clock";
import {
  type DesktopAppId,
  type DesktopWindowId,
  useDesktopWindows,
} from "@/components/desktop-windows";

const locationDisclaimer =
  "Your location is requested to load local weather visuals. Coordinates are sent to the weather API and are not stored by this site; if unavailable, Prague weather is used.";

type HeaderProps = {
  tasks: { id: DesktopWindowId; title: string }[];
  onOpenAbout: () => void;
};

export default function Header({ tasks, onOpenAbout }: HeaderProps) {
  const [isStartOpen, setIsStartOpen] = useState(false);
  const { activeWindowId, activateWindow, minimizeWindow } = useDesktopWindows();

  const openApp = (id: DesktopAppId) => {
    activateWindow(id);
    setIsStartOpen(false);
  };

  return (
    <header className="win98-taskbar">
      {isStartOpen && (
        <div id="start-menu" className="win98-start-menu" role="menu">
          <div className="win98-start-menu-banner" aria-hidden="true"><strong>My</strong><span>Blog</span></div>
          <div className="win98-start-menu-items">
            <button type="button" role="menuitem" className="win98-start-menu-item" onClick={() => openApp("recent-posts")}>
              <span aria-hidden="true" className="win98-menu-folder" />
              <span><strong>Recent Posts</strong><small>Browse the latest blog entries</small></span>
            </button>
            <Link href="/about" role="menuitem" className="win98-start-menu-item" onNavigate={() => {
              onOpenAbout();
              setIsStartOpen(false);
            }}>
              <span aria-hidden="true" className="win98-menu-computer">▣</span>
              <span><strong>About Me</strong><small>Open author information</small></span>
            </Link>
            <div className="win98-start-menu-rule" />
            <button type="button" role="menuitem" className="win98-start-menu-item" onClick={() => openApp("minesweeper")}>
              <span aria-hidden="true" className="win98-menu-app-icon win98-menu-mine">✹</span>
              <span><strong>Minesweeper</strong><small>Find the hidden mines</small></span>
            </button>
            <button type="button" role="menuitem" className="win98-start-menu-item" onClick={() => openApp("paint")}>
              <span aria-hidden="true" className="win98-menu-app-icon">🎨</span>
              <span><strong>Paint</strong><small>Draw something pixel-perfect</small></span>
            </button>
            <div className="win98-start-menu-rule" />
            <button type="button" role="menuitem" className="win98-start-menu-item" onClick={() => setIsStartOpen(false)}>
              <span aria-hidden="true" className="win98-menu-app-icon">⏻</span>
              <span><strong>Close Menu...</strong></span>
            </button>
          </div>
        </div>
      )}

      <nav className="win98-taskbar-navigation" aria-label="Taskbar">
        <button
          type="button"
          className="win98-taskbar-button win98-start-button"
          onClick={() => setIsStartOpen((current) => !current)}
          aria-expanded={isStartOpen}
          aria-controls={isStartOpen ? "start-menu" : undefined}
        >
          <span aria-hidden="true" className="win98-logo">
            <i /><i /><i /><i />
          </span>
          Start
        </button>
        <span className="win98-taskbar-divider" aria-hidden="true" />
        <div className="win98-taskbar-windows" role="group" aria-label="Open windows">
          {tasks.map(({ id, title }) => {
            const active = activeWindowId === id;
            return (
              <button
                key={id}
                type="button"
                className="win98-taskbar-button win98-running-button"
                aria-controls={`${id}-window`}
                aria-pressed={active}
                title={title}
                onClick={() => {
                  setIsStartOpen(false);
                  if (active) minimizeWindow(id);
                  else activateWindow(id);
                }}
              >
                <span className="truncate">{title}</span>
              </button>
            );
          })}
        </div>
        <div className="win98-location-notice group relative">
          <button
            type="button"
            aria-label="Location usage disclaimer"
            aria-describedby="location-disclaimer"
            className="win98-taskbar-button win98-warning-button"
          >
            <AlertTriangle aria-hidden="true" size={16} />
          </button>
          <div
            id="location-disclaimer"
            className="win98-tooltip pointer-events-none absolute bottom-full right-0 mb-2 w-72 p-3 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
          >
            {locationDisclaimer}
          </div>
        </div>
        <Win98Clock />
      </nav>
    </header>
  );
}

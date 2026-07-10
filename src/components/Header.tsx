"use client";

import Link from "next/link";
import { AlertTriangle } from "react-feather";
import Win98Clock from "@/components/Win98Clock";
import Minesweeper from "@/components/Minesweeper";
import Paint from "@/components/Paint";
import { useState } from "react";

const locationDisclaimer =
  "Your location is requested to load local weather visuals. Coordinates are sent to the weather API and are not stored by this site; if unavailable, Prague weather is used.";

export default function Header() {
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [openApps, setOpenApps] = useState({ minesweeper: false, paint: false });

  const openApp = (app: keyof typeof openApps) => {
    setOpenApps((current) => ({ ...current, [app]: true }));
    setIsStartOpen(false);
  };

  const closeApp = (app: keyof typeof openApps) => {
    setOpenApps((current) => ({ ...current, [app]: false }));
  };

  return (
    <>
      {openApps.minesweeper && <Minesweeper onClose={() => closeApp("minesweeper")} />}
      {openApps.paint && <Paint onClose={() => closeApp("paint")} />}

      <header className="win98-taskbar">
        {isStartOpen && (
          <div id="start-menu" className="win98-start-menu" role="menu">
            <div className="win98-start-menu-banner" aria-hidden="true"><strong>My</strong><span>Blog</span></div>
            <div className="win98-start-menu-items">
              <Link href="/" role="menuitem" className="win98-start-menu-item" onClick={() => setIsStartOpen(false)}>
                <span aria-hidden="true" className="win98-menu-folder" />
                <span><strong>Recent Posts</strong><small>Browse the latest blog entries</small></span>
              </Link>
              <Link href="/about" role="menuitem" className="win98-start-menu-item" onClick={() => setIsStartOpen(false)}>
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

        <nav className="flex min-w-0 flex-1 items-center gap-1 pr-28 sm:pr-48" aria-label="Main navigation">
        <button
          type="button"
          className="win98-taskbar-button win98-start-button"
          onClick={() => setIsStartOpen((current) => !current)}
          aria-expanded={isStartOpen}
          aria-controls="start-menu"
        >
          <span aria-hidden="true" className="win98-logo">
            <i /><i /><i /><i />
          </span>
          Start
        </button>
        <span className="win98-taskbar-divider" aria-hidden="true" />
        <Link href="/" className="win98-taskbar-button">
          <span aria-hidden="true" className="win98-taskbar-folder" />
          Home
        </Link>
        <Link href="/about" className="win98-taskbar-button win98-about-taskbar-button">
          About Me
        </Link>
        {openApps.minesweeper && (
          <button type="button" className="win98-taskbar-button win98-running-button" onClick={() => openApp("minesweeper")}>✹ Minesweeper</button>
        )}
        {openApps.paint && (
          <button type="button" className="win98-taskbar-button win98-running-button" onClick={() => openApp("paint")}>🎨 Paint</button>
        )}
        <div className="group relative ml-auto hidden sm:block">
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
    </>
  );
}

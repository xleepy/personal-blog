"use client";

import { useEffect, useState } from "react";
import { useDraggableWindow } from "@/hooks/useDraggableWindow";

const BOARD_SIZE = 8;
const MINE_COUNT = 10;
const MINES = new Set([3, 9, 14, 22, 27, 37, 42, 49, 54, 61]);

type GameStatus = "playing" | "won" | "lost";

type MinesweeperProps = {
  onClose: () => void;
};

const getNeighbors = (index: number) => {
  const row = Math.floor(index / BOARD_SIZE);
  const column = index % BOARD_SIZE;
  const neighbors: number[] = [];

  for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
    for (let columnOffset = -1; columnOffset <= 1; columnOffset += 1) {
      if (rowOffset === 0 && columnOffset === 0) continue;
      const nextRow = row + rowOffset;
      const nextColumn = column + columnOffset;
      if (
        nextRow >= 0 &&
        nextRow < BOARD_SIZE &&
        nextColumn >= 0 &&
        nextColumn < BOARD_SIZE
      ) {
        neighbors.push(nextRow * BOARD_SIZE + nextColumn);
      }
    }
  }

  return neighbors;
};

const getAdjacentMineCount = (index: number) =>
  getNeighbors(index).filter((neighbor) => MINES.has(neighbor)).length;

export default function Minesweeper({ onClose }: MinesweeperProps) {
  const [opened, setOpened] = useState<Set<number>>(() => new Set());
  const [flagged, setFlagged] = useState<Set<number>>(() => new Set());
  const [status, setStatus] = useState<GameStatus>("playing");
  const [seconds, setSeconds] = useState(0);
  const { windowRef, windowStyle, titlebarProps, resizeHandleProps } =
    useDraggableWindow({ minWidth: 244, minHeight: 345 });

  useEffect(() => {
    if (status !== "playing") return;
    const interval = window.setInterval(
      () => setSeconds((current) => Math.min(current + 1, 999)),
      1000,
    );
    return () => window.clearInterval(interval);
  }, [status]);

  const reset = () => {
    setOpened(new Set());
    setFlagged(new Set());
    setStatus("playing");
    setSeconds(0);
  };

  const openCell = (index: number) => {
    if (status !== "playing" || flagged.has(index) || opened.has(index)) return;

    if (MINES.has(index)) {
      setOpened((current) => new Set(current).add(index));
      setStatus("lost");
      return;
    }

    const nextOpened = new Set(opened);
    const queue = [index];

    while (queue.length > 0) {
      const current = queue.shift();
      if (current === undefined || nextOpened.has(current) || MINES.has(current)) continue;
      nextOpened.add(current);
      if (getAdjacentMineCount(current) === 0) {
        getNeighbors(current).forEach((neighbor) => {
          if (!nextOpened.has(neighbor) && !flagged.has(neighbor)) queue.push(neighbor);
        });
      }
    }

    setOpened(nextOpened);
    if (nextOpened.size === BOARD_SIZE * BOARD_SIZE - MINE_COUNT) setStatus("won");
  };

  const toggleFlag = (event: React.MouseEvent, index: number) => {
    event.preventDefault();
    if (status !== "playing" || opened.has(index)) return;
    setFlagged((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else if (next.size < MINE_COUNT) next.add(index);
      return next;
    });
  };

  const face = status === "won" ? "😎" : status === "lost" ? "😵" : "🙂";

  return (
    <section ref={windowRef} style={windowStyle} className="win98-window win98-app-window win98-minesweeper-window" role="dialog" aria-label="Minesweeper">
      <div {...titlebarProps}>
        <div className="win98-titlebar-label">
          <span aria-hidden="true" className="win98-mine-title-icon">✹</span>
          Minesweeper
        </div>
        <div className="win98-titlebar-actions">
          <button className="win98-caption-button" type="button" aria-label="Close Minesweeper" onClick={onClose}>×</button>
        </div>
      </div>
      <div className="win98-menu-bar"><span><u>G</u>ame</span><span><u>H</u>elp</span></div>
      <div className="minesweeper-game">
        <div className="minesweeper-scoreboard">
          <span className="minesweeper-counter">{String(MINE_COUNT - flagged.size).padStart(3, "0")}</span>
          <button type="button" className="minesweeper-face" onClick={reset} aria-label="New game">{face}</button>
          <span className="minesweeper-counter">{String(seconds).padStart(3, "0")}</span>
        </div>
        <div className="minesweeper-board" aria-label="Minesweeper board">
          {Array.from({ length: BOARD_SIZE * BOARD_SIZE }, (_, index) => {
            const isOpen = opened.has(index);
            const isMine = MINES.has(index);
            const adjacentMines = getAdjacentMineCount(index);
            const showMine = isMine && (status === "lost" || isOpen);
            const value = showMine ? "✹" : flagged.has(index) ? "⚑" : isOpen && adjacentMines > 0 ? adjacentMines : "";

            return (
              <button
                key={index}
                type="button"
                className={`minesweeper-cell ${isOpen ? "is-open" : ""} ${showMine && isOpen ? "is-exploded" : ""} minesweeper-value-${adjacentMines}`}
                onClick={() => openCell(index)}
                onContextMenu={(event) => toggleFlag(event, index)}
                aria-label={`Row ${Math.floor(index / BOARD_SIZE) + 1}, column ${(index % BOARD_SIZE) + 1}${flagged.has(index) ? ", flagged" : ""}`}
              >
                {value}
              </button>
            );
          })}
        </div>
        <p className="minesweeper-help">Left-click to reveal · Right-click to flag</p>
      </div>
      <div {...resizeHandleProps} />
    </section>
  );
}

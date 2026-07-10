"use client";

import { useRef, useState } from "react";
import { useDraggableWindow } from "@/hooks/useDraggableWindow";

const COLORS = [
  "#000000", "#808080", "#800000", "#808000", "#008000", "#008080", "#000080", "#800080",
  "#ffffff", "#c0c0c0", "#ff0000", "#ffff00", "#00ff00", "#00ffff", "#0000ff", "#ff00ff",
];

type PaintProps = {
  onClose: () => void;
};

export default function Paint({ onClose }: PaintProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef({ x: 0, y: 0 });
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(4);
  const { windowRef, windowStyle, titlebarProps, resizeHandleProps } =
    useDraggableWindow({ minWidth: 480, minHeight: 360 });

  const getPoint = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const bounds = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - bounds.left) / bounds.width) * canvas.width,
      y: ((event.clientY - bounds.top) / bounds.height) * canvas.height,
    };
  };

  const startDrawing = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawingRef.current = true;
    lastPointRef.current = getPoint(event);
    canvas.setPointerCapture(event.pointerId);
  };

  const draw = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !drawingRef.current) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const point = getPoint(event);
    context.beginPath();
    context.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    context.lineTo(point.x, point.y);
    context.strokeStyle = color;
    context.lineWidth = brushSize;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.stroke();
    lastPointRef.current = point;
  };

  const stopDrawing = () => {
    drawingRef.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (canvas && context) context.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <section ref={windowRef} style={windowStyle} className="win98-window win98-app-window win98-paint-window" role="dialog" aria-label="Paint">
      <div {...titlebarProps}>
        <div className="win98-titlebar-label"><span aria-hidden="true">🎨</span>untitled - Paint</div>
        <div className="win98-titlebar-actions">
          <button className="win98-caption-button" type="button" aria-label="Close Paint" onClick={onClose}>×</button>
        </div>
      </div>
      <div className="win98-menu-bar"><span><u>F</u>ile</span><span><u>E</u>dit</span><span><u>V</u>iew</span><span><u>I</u>mage</span><span><u>O</u>ptions</span><span><u>H</u>elp</span></div>
      <div className="paint-workspace">
        <aside className="paint-tools" aria-label="Paint tools">
          {[2, 4, 8, 14].map((size) => (
            <button
              key={size}
              type="button"
              className={`paint-tool ${brushSize === size ? "is-active" : ""}`}
              onClick={() => setBrushSize(size)}
              aria-label={`${size} pixel brush`}
              aria-pressed={brushSize === size}
            >
              <span style={{ width: size, height: size }} />
            </button>
          ))}
          <button type="button" className="paint-clear-button" onClick={clearCanvas}>Clear</button>
        </aside>
        <div className="paint-canvas-scroll">
          <canvas
            ref={canvasRef}
            width={720}
            height={420}
            className="paint-canvas"
            onPointerDown={startDrawing}
            onPointerMove={draw}
            onPointerUp={stopDrawing}
            onPointerCancel={stopDrawing}
            onPointerLeave={stopDrawing}
            aria-label="Drawing canvas"
          />
        </div>
      </div>
      <div className="paint-palette-bar">
        <div className="paint-current-color" style={{ backgroundColor: color }} aria-label={`Current color ${color}`} />
        <div className="paint-palette" aria-label="Color palette">
          {COLORS.map((paletteColor) => (
            <button
              key={paletteColor}
              type="button"
              style={{ backgroundColor: paletteColor }}
              className={color === paletteColor ? "is-active" : ""}
              onClick={() => setColor(paletteColor)}
              aria-label={`Use color ${paletteColor}`}
              aria-pressed={color === paletteColor}
            />
          ))}
        </div>
      </div>
      <div {...resizeHandleProps} />
    </section>
  );
}

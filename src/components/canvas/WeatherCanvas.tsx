import { createRoot, extend } from '@react-three/fiber';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  CircleGeometry, Color, Fog, InstancedMesh, Mesh, MeshBasicMaterial,
  PlaneGeometry, ShaderMaterial, SphereGeometry, WebGLRenderer,
} from 'three';

extend({ CircleGeometry, Color, Fog, InstancedMesh, Mesh, MeshBasicMaterial, PlaneGeometry, ShaderMaterial, SphereGeometry });

const CONTEXT_ATTRIBUTES = {
  alpha: true,
  antialias: true,
  failIfMajorPerformanceCaveat: true,
  powerPreference: 'low-power',
} as const;

export function WeatherCanvas({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [root, setRoot] = useState<ReturnType<typeof createRoot> | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Own the actual render surface so failure can fall back to the enclosing CSS sky.
    const canvas = document.createElement('canvas');
    canvas.className = 'block';
    container.append(canvas);

    let disposed = false;
    let context: WebGLRenderingContext | WebGL2RenderingContext | null = null;
    let renderer: WebGLRenderer | undefined;
    let surface: ReturnType<typeof createRoot> | undefined;
    let observer: ResizeObserver | undefined;
    let resize: (() => void) | undefined;

    const dispose = () => {
      if (disposed) return;
      disposed = true;
      observer?.disconnect();
      if (resize) window.removeEventListener('resize', resize);
      surface?.unmount();
      renderer?.dispose();
      if (!surface) context?.getExtension('WEBGL_lose_context')?.loseContext();
      canvas.remove();
    };

    const measure = () => {
      const width = Math.max(1, container.clientWidth);
      const height = Math.max(1, container.clientHeight);
      return {
        size: { width, height, top: 0, left: 0 },
        dpr: window.devicePixelRatio || 1,
      };
    };

    const initialize = async () => {
      try {
        const workingContext = canvas.getContext('webgl2', CONTEXT_ATTRIBUTES);
        if (!workingContext || !('getExtension' in workingContext)) {
          dispose();
          return;
        }

        context = workingContext;
        renderer = new WebGLRenderer({ canvas, context });
        surface = createRoot(canvas);
        await surface.configure({
          ...measure(),
          gl: renderer,
          frameloop: 'demand',
          camera: { position: [0, 0, 0], fov: 60 },
        });
        if (disposed) return;

        const store = surface.render(null);
        resize = () => {
          const { size, dpr } = measure();
          store.getState().setDpr(dpr);
          store.getState().setSize(size.width, size.height);
        };
        observer = new ResizeObserver(resize);
        observer.observe(container);
        window.addEventListener('resize', resize);
        setRoot(surface);
      } catch (error) {
        dispose();
        console.warn('Weather canvas initialization failed', error);
      }
    };

    const frame = window.requestAnimationFrame(() => void initialize());
    return () => {
      window.cancelAnimationFrame(frame);
      dispose();
    };
  }, []);

  useEffect(() => { root?.render(children); }, [root, children]);

  return <div className="absolute inset-0" ref={containerRef} />;
}

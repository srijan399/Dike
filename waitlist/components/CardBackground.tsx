'use client';

import { memo, useMemo, useState, useEffect, useRef } from "react";
import { GrainGradient } from "@paper-design/shaders-react";

interface CardBackgroundProps {
  index?: number;
  variant?: "default" | "subtle" | "vibrant";
  className?: string;
}

const colorVariations = [
  ["#D00613", "#FF4E00", "#FFBF02", "#FF8C00", "#FFD369"],
  ["#B30000", "#FF6B35", "#FFC857", "#FFBF02", "#D9381E"],
  ["#8C1C13", "#D9381E", "#FF7A00", "#FFC300", "#FF924C"],
  ["#D00613", "#FF4500", "#FF7518", "#FFBF02", "#FF9E0B"],
];

type GradientConfig = {
  colors: string[];
  noise: number;
  intensity: number;
  offsetX: number;
  offsetY: number;
};

const configCache = new Map<string, GradientConfig>();

function getConfig(index: number, variant: "default" | "subtle" | "vibrant"): GradientConfig {
  const cacheKey = `${index}-${variant}`;
  if (configCache.has(cacheKey)) {
    return configCache.get(cacheKey)!;
  }

  const baseIndex = index % colorVariations.length;
  const colors = colorVariations[baseIndex];

  const noiseVariations = [0.35, 0.4, 0.45, 0.5];
  const intensityVariations = [0.12, 0.14, 0.16, 0.18];

  let noise = noiseVariations[baseIndex % noiseVariations.length];
  let intensity = intensityVariations[baseIndex % intensityVariations.length];

  if (variant === "subtle") {
    noise *= 0.7;
    intensity *= 0.8;
  } else if (variant === "vibrant") {
    noise *= 1.15;
    intensity *= 1.25;
  }

  const offsetX = 0.44 + ((index * 0.07) % 0.18);
  const offsetY = 1 + ((index * 0.11) % 0.26);

  const config = {
    colors,
    noise: Math.min(noise, 0.8),
    intensity: Math.min(intensity, 0.25),
    offsetX,
    offsetY,
  };

  configCache.set(cacheKey, config);
  return config;
}

// Global WebGL context manager
class WebGLContextManager {
  private activeContexts = new Set<number>();
  private readonly MAX_CONTEXTS = 8; // Limit concurrent WebGL contexts
  private readonly CONTEXT_TIMEOUT = 3000; // 3s timeout before allowing reuse

  canCreateContext(index: number): boolean {
    // Always allow first few cards (above fold)
    if (index < 6) return true;
    
    // If under limit, allow
    if (this.activeContexts.size < this.MAX_CONTEXTS) {
      return true;
    }
    
    return false;
  }

  registerContext(index: number): void {
    this.activeContexts.add(index);
  }

  unregisterContext(index: number): void {
    this.activeContexts.delete(index);
  }

  getActiveCount(): number {
    return this.activeContexts.size;
  }
}

const contextManager = new WebGLContextManager();

const useIsVisible = (
  ref: React.RefObject<HTMLElement | null>,
  index: number,
  options?: IntersectionObserverInit
) => {
  const [shouldRender, setShouldRender] = useState(index < 6); // Only first 6 render immediately
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isRegisteredRef = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Cleanup previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    // Unregister when component unmounts or becomes invisible
    const cleanup = () => {
      if (isRegisteredRef.current) {
        contextManager.unregisterContext(index);
        isRegisteredRef.current = false;
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isIntersecting = entry.isIntersecting;
        const isNearViewport = entry.intersectionRatio > 0.1 || 
                              entry.boundingClientRect.top < window.innerHeight + 400;

        if (isIntersecting && isNearViewport) {
          // Check if we can create a context
          if (contextManager.canCreateContext(index)) {
            setShouldRender(true);
            if (!isRegisteredRef.current) {
              contextManager.registerContext(index);
              isRegisteredRef.current = true;
            }
          }
        } else {
          // Aggressively unmount when far off-screen
          const distanceFromViewport = Math.abs(entry.boundingClientRect.top - window.innerHeight);
          if (distanceFromViewport > 800) {
            setShouldRender(false);
            cleanup();
          }
        }
      },
      {
        rootMargin: "200px 0px 200px 0px", // Larger margin for better prediction
        threshold: [0, 0.1, 0.5, 1],
        ...options,
      }
    );

    observer.observe(element);
    observerRef.current = observer;

    // Initial check
    if (index < 6 && !isRegisteredRef.current) {
      contextManager.registerContext(index);
      isRegisteredRef.current = true;
    }

    return () => {
      cleanup();
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [ref, index, options]);

  return shouldRender;
};

const CardBackground = memo(function CardBackground({
  index = 0,
  variant = "default",
  className = "",
}: CardBackgroundProps) {
  const config = useMemo(() => getConfig(index, variant), [index, variant]);
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldRender = useIsVisible(containerRef, index);

  const gradientElement = useMemo(() => {
    if (!shouldRender) return null;
    
    return (
      <GrainGradient
        key={`gradient-${index}-${variant}`}
        width="100%"
        height="100%"
        colors={config.colors}
        colorBack="#000a0f"
        softness={0.7}
        intensity={config.intensity}
        noise={config.noise}
        shape="wave"
        speed={0}
        frame={0}
        offsetX={config.offsetX}
        offsetY={config.offsetY}
      />
    );
  }, [shouldRender, config, index, variant]);

  const overlayElement = useMemo(
    () => <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-transparent to-black/40" />,
    []
  );

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden ${className}`}
    >
      {gradientElement}
      {overlayElement}
    </div>
  );
},
(prevProps, nextProps) =>
  prevProps.index === nextProps.index &&
  prevProps.variant === nextProps.variant &&
  prevProps.className === nextProps.className);

CardBackground.displayName = "CardBackground";

export default CardBackground;


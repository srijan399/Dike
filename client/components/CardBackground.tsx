'use client'

import { GrainGradient } from '@paper-design/shaders-react';
import { useMemo, memo, useState, useEffect, useRef } from 'react';

interface CardBackgroundProps {
    index?: number;
    variant?: 'default' | 'subtle' | 'vibrant';
    className?: string;
}

const colorVariations = [
    ["#c6750c", "#beae60", "#d7cbc6", "#2b00ff", "#33cc99"],
    ["#c6750c", "#beae60", "#d7cbc6", "#2b00ff", "#33cc99"],
    ["#c6750c", "#beae60", "#d7cbc6", "#2b00ff", "#33cc99"],
    ["#c6750c", "#beae60", "#d7cbc6", "#2b00ff", "#33cc99"],
];

// Pre-compute static configs for common indices to avoid recalculation
const configCache = new Map<string, {
    colors: string[];
    noise: number;
    intensity: number;
    offsetX: number;
    offsetY: number;
}>();

function getConfig(index: number, variant: 'default' | 'subtle' | 'vibrant') {
    const cacheKey = `${index}-${variant}`;
    if (configCache.has(cacheKey)) {
        return configCache.get(cacheKey)!;
    }

    const baseIndex = index % colorVariations.length;
    const colors = colorVariations[baseIndex];
    
    // Vary noise and intensity based on index and variant
    const noiseVariations = [0.3, 0.4, 0.5, 0.6];
    const intensityVariations = [0.1, 0.12, 0.15, 0.18];
    
    let noise = noiseVariations[baseIndex % noiseVariations.length];
    let intensity = intensityVariations[baseIndex % intensityVariations.length];
    
    // Adjust based on variant
    if (variant === 'subtle') {
        noise *= 0.7;
        intensity *= 0.8;
    } else if (variant === 'vibrant') {
        noise *= 1.2;
        intensity *= 1.3;
    }
    
    // Vary offset slightly for each card - use modulo to ensure consistent values
    const offsetX = 0.44 + ((index * 0.1) % 0.2);
    const offsetY = 1 + ((index * 0.15) % 0.3);
    
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

// Intersection Observer for visibility-based rendering
// Once a gradient is rendered, keep it rendered to avoid flicker
const useIsVisible = (ref: React.RefObject<HTMLElement | null>, options?: IntersectionObserverInit) => {
    const [shouldRender, setShouldRender] = useState(false);
    const hasRenderedRef = useRef(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        // If already rendered, keep it rendered
        if (hasRenderedRef.current) {
            setShouldRender(true);
            return;
        }

        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setShouldRender(true);
                hasRenderedRef.current = true;
                // Once rendered, we can disconnect to save resources
                observer.disconnect();
            }
        }, {
            rootMargin: '100px', // Start loading well before visible
            threshold: 0.01,
            ...options,
        });

        observer.observe(element);

        return () => {
            observer.disconnect();
        };
    }, [ref, options]);

    return shouldRender;
};

const CardBackground = memo(function CardBackground({ index = 0, variant = 'default', className = '' }: CardBackgroundProps) {
    const config = useMemo(() => getConfig(index, variant), [index, variant]);
    const containerRef = useRef<HTMLDivElement>(null);
    
    // Render first 12 cards immediately (above the fold), use intersection observer for rest
    const shouldRenderImmediately = index < 12;
    const isVisible = useIsVisible(containerRef);
    const shouldRender = shouldRenderImmediately || isVisible;

    return (
        <div 
            ref={containerRef}
            className={`absolute inset-0 rounded-xl overflow-hidden ${className}`}
        >
            {shouldRender && (
                <GrainGradient
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
            )}
        </div>
    );
}, (prevProps, nextProps) => {
    // Custom comparison to prevent unnecessary rerenders
    return (
        prevProps.index === nextProps.index &&
        prevProps.variant === nextProps.variant &&
        prevProps.className === nextProps.className
    );
});

CardBackground.displayName = 'CardBackground';

export default CardBackground;


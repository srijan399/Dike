'use client'

import { GrainGradient } from '@paper-design/shaders-react';
import { useMemo } from 'react';

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

// Generate slight color variations by shifting hues
function shiftColors(colors: string[], shift: number): string[] {
    // For simplicity, we'll use the same colors but vary intensity/noise instead
    // The visual difference comes from noise/intensity/offset variations
    return colors;
}

export default function CardBackground({ index = 0, variant = 'default', className = '' }: CardBackgroundProps) {
    const config = useMemo(() => {
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
        
        // Vary offset slightly for each card
        const offsetX = 0.44 + (index * 0.1) % 0.2;
        const offsetY = 1 + (index * 0.15) % 0.3;
        
        return {
            colors,
            noise: Math.min(noise, 0.8),
            intensity: Math.min(intensity, 0.25),
            offsetX,
            offsetY,
        };
    }, [index, variant]);

    return (
        <div className={`absolute inset-0 rounded-xl overflow-hidden ${className}`}>
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
                frame={10000}
                offsetX={config.offsetX}
                offsetY={config.offsetY}
            />
        </div>
    );
}


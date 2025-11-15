'use client'

import { GrainGradient } from '@paper-design/shaders-react';

export default function PageBackground() {
    return (
        <div className="fixed inset-0 z-0">
            <GrainGradient
                width="100%"
                height="100%"
                colors={["#c6750c", "#beae60", "#d7cbc6", "#2b00ff", "#33cc99"]}
                colorBack="#000a0f"
                softness={0.7}
                intensity={0.15}
                noise={0.25}
                shape="wave"
                speed={1}
                offsetX={0.44}
                offsetY={1}
            />
        </div>
    );
}


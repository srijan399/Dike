"use client"

import { GrainGradient } from '@paper-design/shaders-react'
import { memo } from 'react'

const GrainGradientComponent = memo(function GrainGradientComponent() {
  return (
    <GrainGradient
      width="100%"
      height="100%"
      colors={["#702d00", "#88ddae"]}
      colorBack="#140a00"
      softness={0.1}
      intensity={0.34}
      frame={0}
      noise={0.3}
      shape="sphere"
      speed={0}
      scale={0.5}
    />
  )
})

GrainGradientComponent.displayName = 'GrainGradientComponent'

export default GrainGradientComponent
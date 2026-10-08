import React from 'react';
import { FluidGradientText } from '../ui/FluidGradientText';

/**
 * FluidGradientTextShowcase
 * 
 * Sleek monochromatic brand signature directly attached to the bottom edge.
 * No box, no border, no separate container card—seamlessly integrated with the footer.
 */
export default function FluidGradientTextShowcase() {
  return (
    <div className="relative w-full pt-8 pb-0 select-none overflow-hidden flex justify-center opacity-90 hover:opacity-100 transition-opacity duration-500 -mb-2">
      <FluidGradientText text="ChemSpace" svgViewBoxWidth={1200} svgViewBoxHeight={220} />
    </div>
  );
}

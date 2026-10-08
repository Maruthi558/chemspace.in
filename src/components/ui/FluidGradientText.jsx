import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { useTheme } from '../../context/ThemeContext';

/**
 * FluidGradientText
 * 
 * Sleek monochromatic architectural typography attached flush to the bottom edge.
 * Renders the massive top half of "ChemSpace" peeking out in crisp black & white / metallic outline
 * with interactive fluid specular cursor lighting.
 */
export function FluidGradientText({
  text = 'ChemSpace',
  svgViewBoxWidth = 1200,
  svgViewBoxHeight = 220,
  className = '',
}) {
  const containerRef = useRef(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const gradientX1Raw = useMotionValue(0.5);
  const gradientX1 = useSpring(
    useTransform(gradientX1Raw, [0, 1], [0, svgViewBoxWidth]),
    {
      stiffness: 100,
      damping: 20,
    }
  );

  const handleMouseMove = (event) => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    if (containerRect.width > 0) {
      gradientX1Raw.set(
        (event.clientX - containerRect.left) / containerRect.width
      );
    }
  };

  const handleMouseLeave = () => {
    gradientX1Raw.set(0.5);
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden flex items-end justify-center select-none ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <svg
        className="w-full h-auto max-h-48 sm:max-h-64 md:max-h-72 select-none pointer-events-none translate-y-[36%]"
        viewBox={`0 0 ${svgViewBoxWidth} ${svgViewBoxHeight}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          stroke={isDark ? 'rgba(255, 255, 255, 0.22)' : 'rgba(0, 0, 0, 0.22)'}
          strokeWidth="2.5"
          fill="url(#chemspace_monochrome_fluid_gradient)"
          style={{
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            fontSize: '220px',
            fontWeight: '900',
            letterSpacing: '-0.05em',
          }}
        >
          {text}
        </text>

        <defs>
          <motion.linearGradient
            id="chemspace_monochrome_fluid_gradient"
            x1={gradientX1}
            y1="0"
            x2={svgViewBoxWidth / 2}
            y2={svgViewBoxHeight}
            gradientUnits="userSpaceOnUse"
          >
            {isDark ? (
              <>
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.03" />
                <stop offset="45%" stopColor="#ffffff" stopOpacity="0.55" />
                <stop offset="55%" stopColor="#ffffff" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.03" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#0f172a" stopOpacity="0.04" />
                <stop offset="45%" stopColor="#0f172a" stopOpacity="0.45" />
                <stop offset="55%" stopColor="#0f172a" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0.04" />
              </>
            )}
          </motion.linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export default FluidGradientText;

import React from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';

export function FluidGradientText({
  text = 'ChemSpace',
  svgViewBoxWidth = 1200,
  svgViewBoxHeight = 300,
  className = '',
}) {
  const gradientX1Raw = useMotionValue(0.5);
  const gradientX1 = useSpring(
    useTransform(gradientX1Raw, [0, 1], [0, svgViewBoxWidth]),
    {
      stiffness: 150,
      damping: 25,
    }
  );

  const handleMouseMove = (event) => {
    const containerRect = event.currentTarget.getBoundingClientRect();
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
      className={`relative w-full h-full overflow-hidden after:absolute after:bottom-0 after:h-px after:w-full after:bg-current/15 ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <svg
        className="w-full h-full translate-y-[37.5%] select-none"
        viewBox={`0 0 ${svgViewBoxWidth} ${svgViewBoxHeight}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          stroke="currentColor"
          strokeOpacity="0.12"
          strokeWidth="2"
          fill="url(#fluid_gradient_text_linear)"
          style={{
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            fontSize: svgViewBoxHeight,
            fontWeight: '900',
            letterSpacing: '-0.03em',
          }}
        >
          {text}
        </text>
        <defs>
          <motion.linearGradient
            id="fluid_gradient_text_linear"
            x1={gradientX1}
            y1="0"
            x2={svgViewBoxWidth / 2}
            y2={svgViewBoxHeight}
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.625" stopColor="currentColor" stopOpacity="0" />
            <stop offset="1" stopColor="currentColor" />
          </motion.linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export default FluidGradientText;

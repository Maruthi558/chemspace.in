import React, { useEffect, useImperativeHandle, forwardRef } from 'react';
import { motion, useAnimation } from 'motion/react';

/**
 * ChevronsUpDownIcon
 * 
 * Animated chevrons icon that seamlessly morphs between up and down directions.
 * Supports both imperative ref control (.startAnimation(), .stopAnimation())
 * and declarative `open` / `isExpanded` prop control.
 */
export const ChevronsUpDownIcon = forwardRef(function ChevronsUpDownIcon(
  {
    duration = 0.25,
    className = '',
    open,
    isExpanded,
    size = 20,
    ...props
  },
  forwardedRef
) {
  const controls = useAnimation();
  const effectiveRef = props.ref || forwardedRef;
  const isOpen = typeof open === 'boolean' ? open : typeof isExpanded === 'boolean' ? isExpanded : undefined;

  useImperativeHandle(effectiveRef, () => {
    return {
      startAnimation: () => controls.start('animate'),
      stopAnimation: () => controls.start('normal'),
      toggleAnimation: (state) => controls.start(state ? 'animate' : 'normal'),
    };
  });

  useEffect(() => {
    if (typeof isOpen === 'boolean') {
      if (isOpen) {
        controls.start('animate');
      } else {
        controls.start('normal');
      }
    }
  }, [isOpen, controls]);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={`shrink-0 ${className}`}
      {...props}
    >
      <motion.path
        d="M7 15L12 20L17 15"
        variants={{
          normal: {
            d: 'M7 15L12 20L17 15',
          },
          animate: {
            d: 'M7 20L12 15L17 20',
          },
        }}
        initial={isOpen ? 'animate' : 'normal'}
        animate={controls}
        transition={{
          duration,
          ease: [0.4, 0.0, 0.2, 1],
        }}
      />
      <motion.path
        d="M7 9L12 4L17 9"
        variants={{
          normal: {
            d: 'M7 9L12 4L17 9',
          },
          animate: {
            d: 'M7 4L12 9L17 4',
          },
        }}
        initial={isOpen ? 'animate' : 'normal'}
        animate={controls}
        transition={{
          duration,
          ease: [0.4, 0.0, 0.2, 1],
        }}
      />
    </svg>
  );
});

export default ChevronsUpDownIcon;

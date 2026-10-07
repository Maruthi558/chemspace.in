import React from 'react';
import { AnimatePresence, motion } from 'motion/react';

/**
 * IconSwap: Animate icon swaps with scale, blur, and fade transitions using spring physics.
 */
export function IconSwap(props) {
  return <AnimatePresence mode="popLayout" initial={false} {...props} />;
}

export function IconSwapItem({
  as: Component = motion.div,
  className = '',
  ...props
}) {
  return (
    <Component
      initial={{ opacity: 0, scale: 0.25, filter: 'blur(4px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 0.25, filter: 'blur(4px)' }}
      transition={{
        type: 'spring',
        duration: 0.3,
        bounce: 0,
      }}
      className={className}
      {...props}
    />
  );
}

export default IconSwap;

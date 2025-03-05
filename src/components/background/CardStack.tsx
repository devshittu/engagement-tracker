'use client';

import { motion } from 'framer-motion';

export function CardStack() {
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      {[...Array(3)].map((_, idx) => {
        const scale = 0.95 - idx * 0.05; // layering effect
        const blur = 2 + idx * 2;
        return (
          <motion.div
            key={idx}
            className="absolute w-3/4 h-3/4 bg-gray-200 rounded-xl shadow-xl"
            style={{ filter: `blur(${blur}px)` }}
            initial={{ scale: scale, opacity: 0 }}
            animate={{ opacity: 0.5, scale: scale }}
          />
        );
      })}
    </div>
  );
}

// src/components/Avatar.tsx
import Image from 'next/image';
import React from 'react';

type AvatarProps = {
  src: string;
  size?: 'sm' | 'md' | 'lg';
};

export const Avatar: React.FC<AvatarProps> = ({ src, size = 'md' }) => {
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  return (
    <Image
      className={`relative rounded-full border-2 border-white saturate-0 ${sizes[size]}`}
      src={src}
      width="256"
      height="256"
      alt="Avatar"
    />
  );
};

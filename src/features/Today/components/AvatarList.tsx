'use client';

import React from 'react';
import { Avatar } from './Avatar';

type AvatarListProps = {
  avatars: string[];
  additionalCount?: number;
};

export const AvatarList: React.FC<AvatarListProps> = ({
  avatars,
  additionalCount = 0,
}) => {
  return (
    <ul className="flex items-center">
      {avatars.map((src, index) => (
        <li key={index}>
          <Avatar src={src} />
        </li>
      ))}
      {additionalCount > 0 && (
        <li className="-ml-5">
          <span className="relative grid place-items-center rounded-full h-12 w-12 border-2 border-white bg-orange-200 text-stone-700 font-regular">
            +{additionalCount}
          </span>
        </li>
      )}
    </ul>
  );
};

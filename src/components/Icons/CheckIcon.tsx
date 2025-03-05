// src/components/Icons/CheckIcon.tsx
import React from 'react';
import { BaseIcon } from './BaseIcon';

type CheckIconProps = {
  size?: number;
};

export const CheckIcon: React.FC<CheckIconProps> = ({ size }) => (
  <BaseIcon size={size} viewBox="0 0 24 24">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </BaseIcon>
);

// src/components/Icons/AlertIcon.tsx
import React from 'react';
import { BaseIcon } from './BaseIcon';

type AlertIconProps = {
  size?: number;
};

export const AlertIcon: React.FC<AlertIconProps> = ({ size }) => (
  <BaseIcon size={size} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </BaseIcon>
);

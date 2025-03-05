// src/components/Icons/ClockIcon.tsx
import React from 'react';
import { BaseIcon } from './BaseIcon';

type ClockIconProps = {
  size?: number;
};

export const ClockIcon: React.FC<ClockIconProps> = ({ size }) => (
  <BaseIcon size={size} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </BaseIcon>
);

// src/components/Icons/BaseIcon.tsx
import React from 'react';

type BaseIconProps = React.SVGProps<SVGSVGElement> & {
  size?: number;
  className?: string;
};

export const BaseIcon: React.FC<BaseIconProps> = ({
  size = 24,
  children,
  className,
  ...props
}) => (
  <svg
    width={size}
    height={size}
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    {children}
  </svg>
);

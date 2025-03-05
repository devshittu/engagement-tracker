'use client';

import Image from 'next/image';
import React from 'react';

type CalloutVariant = 1 | 2 | 3;

type CalloutProps = {
  heading: string;
  subheading: React.ReactNode;
  linkText?: string;
  url?: string;
  variant?: CalloutVariant;
};

type VariantConfig = {
  className: string;
  image: string;
};

const variants: Record<CalloutVariant, VariantConfig> = {
  1: {
    className:
      'lg:col-span-2 lg:grid-cols-2 bg-gradient-to-br from-green-300 to-yellow-100',
    image:
      'https://cdn3d.iconscout.com/3d/premium/thumb/abstract-shape-8079078-6656490.png?f=webp',
  },
  2: {
    className: 'bg-gradient-to-br from-orange-300 to-yellow-100',
    image:
      'https://cdn3d.iconscout.com/3d/premium/thumb/abstract-shape-8079089-6656501.png?f=webp',
  },
  3: {
    className: 'bg-gradient-to-br from-red-300 to-yellow-100',
    image:
      'https://cdn3d.iconscout.com/3d/premium/thumb/abstract-shape-8085298-6656614.png?f=webp',
  },
};

export const Callout: React.FC<CalloutProps> = ({
  heading,
  subheading,
  linkText,
  url,
  variant = 1,
}) => {
  const { className, image } = variants[variant];

  return (
    <div className={`grid ${className}`}>
      <div className="flex flex-col gap-2 p-6">
        <h3 className="text-xl text-stone-800">{heading}</h3>
        <p className="text-stone-800 font-light">{subheading}</p>
        {url && linkText && (
          <a
            className="self-start mt-6 lg:mt-auto px-4 py-2 border border-stone-800 text-xs font-bold tracking-wide text-stone-800 uppercase hover:text-stone-900 hover:border-stone-900"
            href={url}
          >
            {linkText}
          </a>
        )}
      </div>
      <Image
        className="ml-auto mt-auto object-left-top object-none max-w-64 max-h-64"
        src={image}
        width="300"
        height="300"
        alt=""
      />
    </div>
  );
};

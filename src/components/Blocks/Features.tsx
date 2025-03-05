'use client';

import React, { useState, useRef, useEffect, MouseEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Transition from '@/components/Transition/Transition';

//-----------------//
//    Subcomponents
//-----------------//

/** Props for the SectionHeader component. */
export interface SectionHeaderProps {
  title: string;
  description: string;
}

/** Renders the top heading + description of the features section. */
export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  description,
}) => {
  return (
    <div className="max-w-3xl mx-auto text-center pb-12 md:pb-16">
      <h1 className="h2 mb-4 text-base-content" data-aos="zoom-y-out">
        {title}
      </h1>
      <p className="text-xl text-gray-600">{description}</p>
    </div>
  );
};

/** Props for each TabButton. */
export interface TabButtonProps {
  index: number;
  activeTab: number;
  onClick: (e: MouseEvent<HTMLAnchorElement>, index: number) => void;
  title: string;
  description: string;
  iconSvgPath: string;
}

/** Renders a single tab button. */
export const TabButton: React.FC<TabButtonProps> = ({
  index,
  activeTab,
  onClick,
  title,
  description,
  iconSvgPath,
}) => {
  const isActive = activeTab === index;
  return (
    <a
      className={`flex items-center text-lg p-5 rounded border transition duration-300 ease-in-out mb-3 ${
        !isActive
          ? 'bg-white shadow-md border-gray-200 hover:shadow-lg'
          : 'bg-gray-200 border-transparent'
      }`}
      href="#0"
      onClick={(e) => onClick(e, index)}
    >
      <div>
        <div className="font-bold leading-snug tracking-tight mb-1 text-base-content">
          {title}
        </div>
        <div className="text-gray-600">{description}</div>
      </div>
      <div className="flex justify-center items-center w-8 h-8 bg-white rounded-full shadow flex-shrink-0 ml-3">
        <svg
          className="w-3 h-3 fill-current"
          viewBox="0 0 12 12"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d={iconSvgPath} />
        </svg>
      </div>
    </a>
  );
};

/** Props for each TabContent. */
export interface TabContentProps {
  index: number;
  activeTab: number;
  imageSrc: string;
  imageAlt: string;
  floatSrc: string;
  floatAlt: string;
  width?: number;
  height?: number;
  floatWidth?: number;
  floatHeight?: number;
}

/** Renders a single tab content item with Transition. */
export const TabContent: React.FC<TabContentProps> = ({
  index,
  activeTab,
  imageSrc,
  imageAlt,
  floatSrc,
  floatAlt,
  width = 500,
  height = 462,
  floatWidth = 500,
  floatHeight = 44,
}) => {
  return (
    <Transition
      show={activeTab === index}
      appear
      className="w-full"
      enter="transition ease-in-out duration-700 transform order-first"
      enterStart="opacity-0 translate-y-16"
      enterEnd="opacity-100 translate-y-0"
      leave="transition ease-in-out duration-300 transform absolute"
      leaveStart="opacity-100 translate-y-0"
      leaveEnd="opacity-0 -translate-y-16"
    >
      <div className="relative inline-flex flex-col">
        <Image
          className="md:max-w-none mx-auto rounded"
          src={imageSrc}
          width={width}
          height={height}
          alt={imageAlt}
        />
        <Image
          className="md:max-w-none absolute w-full left-0 transform animate-float"
          src={floatSrc}
          width={floatWidth}
          height={floatHeight}
          alt={floatAlt}
          style={{ top: '30%' }}
        />
      </div>
    </Transition>
  );
};

/** Renders the additional nav at the bottom of the section. */
export const AdditionalNavigation: React.FC = () => (
  <div className="text-center pt-8">
    <h3 className="text-2xl font-bold mb-4 text-base-content">Discover More</h3>
    <div className="flex justify-center space-x-4">
      <Link
        href="/wards"
        className="text-lg font-medium text-blue-600 hover:underline"
      >
        Wards
      </Link>
      <Link
        href="/activities"
        className="text-lg font-medium text-blue-600 hover:underline"
      >
        Activities
      </Link>
      <Link
        href="/sessions"
        className="text-lg font-medium text-blue-600 hover:underline"
      >
        Sessions
      </Link>
      <Link
        href="/serviceUsers"
        className="text-lg font-medium text-blue-600 hover:underline"
      >
        Service Users
      </Link>
      <Link
        href="/reports"
        className="text-lg font-medium text-blue-600 hover:underline"
      >
        Reports
      </Link>
    </div>
  </div>
);

//
// ---------------
// Parent Component (default export): Features
// ---------------
//
interface FeaturesProps {}
const Features: React.FC<FeaturesProps> = () => {
  // Active tab (1-indexed)
  const [tab, setTab] = useState<number>(1);

  // Container to fix height based on active tab
  const tabs = useRef<HTMLDivElement | null>(null);

  // Adjust container height
  const heightFix = () => {
    if (tabs.current && tabs.current.children[tab - 1]) {
      tabs.current.style.height = `${
        (tabs.current.children[tab - 1] as HTMLElement).offsetHeight
      }px`;
    }
  };

  useEffect(() => {
    heightFix();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  // On tab button click
  const handleTabClick = (e: MouseEvent<HTMLAnchorElement>, idx: number) => {
    e.preventDefault();
    setTab(idx);
  };

  return (
    <section className="relative">
      {/* Section background */}
      <div
        className="absolute inset-0 bg-base-100 pointer-events-none mb-16"
        aria-hidden="true"
      />
      <div className="absolute left-0 right-0 m-auto w-px p-px h-20 bg-base-200 transform -translate-y-1/2" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="pt-12 md:pt-20">
          {/* Section Header */}
          <SectionHeader
            title="Discover Your Intelligent Session Management Platform"
            description="Our solution empowers hospitals to efficiently manage service
            users, track admission sessions, and analyze activities across wards. Streamline care, 
            optimize resource allocation, and gain actionable insights with our comprehensive platform."
          />

          {/* Section content */}
          <div className="md:grid md:grid-cols-12 md:gap-6">
            {/* Tabs buttons (left column) */}
            <div
              className="max-w-xl md:max-w-none md:w-full mx-auto md:col-span-7 lg:col-span-6 md:mt-6"
              data-aos="fade-right"
            >
              <div className="mb-8">
                <TabButton
                  index={1}
                  activeTab={tab}
                  onClick={handleTabClick}
                  title="Manage Service Users"
                  description="Easily add, update, and track service users and their admission history."
                  iconSvgPath="M11.953 4.29a.5.5 0 00-.454-.292H6.14L6.984.62A.5.5 0 006.12.173l-6 7a.5.5 0 00.379.825h5.359l-.844 3.38a.5.5 0 00.864.445l6-7a.5.5 0 00.075-.534z"
                />
                <TabButton
                  index={2}
                  activeTab={tab}
                  onClick={handleTabClick}
                  title="Record Admission Sessions"
                  description="Accurately log session start and end times for each service activity."
                  iconSvgPath="M11.854.146a.5.5 0 00-.525-.116l-11 4a.5.5 0 00-.015.934l4.8 1.921 1.921 4.8A.5.5 0 007.5 12h.008a.5.5 0 00.462-.329l4-11a.5.5 0 00-.116-.525z"
                />
                <TabButton
                  index={3}
                  activeTab={tab}
                  onClick={handleTabClick}
                  title="Analyze Reports & Insights"
                  description="Generate comprehensive reports and gain actionable insights 
                               to improve care and operational efficiency."
                  iconSvgPath="M11.334 8.06a.5.5 0 00-.421-.237 6.023 6.023 0 01-5.905-6c0-.41.042-.82.125-1.221a.5.5 0 00-.614-.586 6 6 0 106.832 8.529.5.5 0 00-.017-.485z"
                />
              </div>
            </div>

            {/* Tabs items (right column) */}
            <div
              className="max-w-xl md:max-w-none md:w-full mx-auto md:col-span-5 lg:col-span-6 mb-8 md:mb-0 md:order-1"
              data-aos="zoom-y-out"
              ref={tabs}
            >
              <div className="relative flex flex-col text-center lg:text-right">
                <TabContent
                  index={1}
                  activeTab={tab}
                  imageSrc="/images/features-bg.png"
                  imageAlt="Manage Service Users"
                  floatSrc="/images/features-element.png"
                  floatAlt="Decorative Element"
                />
                <TabContent
                  index={2}
                  activeTab={tab}
                  imageSrc="/images/features-bg.png"
                  imageAlt="Record Admission Sessions"
                  floatSrc="/images/features-element.png"
                  floatAlt="Decorative Element"
                />
                <TabContent
                  index={3}
                  activeTab={tab}
                  imageSrc="/images/features-bg.png"
                  imageAlt="Analyze Reports & Insights"
                  floatSrc="/images/features-element.png"
                  floatAlt="Decorative Element"
                />
              </div>
            </div>
          </div>

          {/* Additional Navigation for quick access */}
          <AdditionalNavigation />
        </div>
      </div>
    </section>
  );
};

export default Features;
// src/components/Blocks/Features.tsx

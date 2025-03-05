// 'use client';

// import React from 'react';
// import Link from 'next/link';
// import { IconType } from 'react-icons';

// export interface BottomNavItem {
//   label: string;
//   href: string;
//   icon: IconType;
//   tooltip: string;
// }

// export interface BottomNavCenterButton {
//   icon: IconType;
//   tooltip: string;
//   onClick?: () => void; // or use href if needed
// }

// export interface BottomNavProps {
//   /** Array of navigation items (except the center button) */
//   items: BottomNavItem[];
//   /** Optional center button (e.g. "New item") */
//   centerButton?: BottomNavCenterButton;
// }

// const BottomNav: React.FC<BottomNavProps> = ({ items, centerButton }) => {
//   // Split items into left and right halves for symmetry.
//   const half = Math.ceil(items.length / 2);
//   const leftItems = items.slice(0, half);
//   const rightItems = items.slice(half);

//   return (
//     <div className="fixed z-50 w-full h-16 max-w-lg -translate-x-1/2 bottom-4 left-1/2
//                     bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full">
//       <div className="grid h-full max-w-lg grid-cols-5 mx-auto">
//         {/* Left items */}
//         {leftItems.map((item, idx) => (
//           <NavButton
//             key={idx}
//             item={item}
//             roundedClass={idx === 0 ? 'rounded-l-full' : ''}
//           />
//         ))}

//         {/* Center button */}
//         <div className="flex items-center justify-center">
//           {centerButton && (
//             <button
//               data-tooltip-target={`tooltip-${centerButton.tooltip}`}
//               type="button"
//               onClick={centerButton.onClick}
//               className="inline-flex items-center justify-center w-10 h-10 font-medium
//                          bg-blue-600 rounded-full hover:bg-blue-700 group focus:ring-4
//                          focus:ring-blue-300 focus:outline-none dark:focus:ring-blue-800"
//             >
//               <centerButton.icon className="w-4 h-4 text-white" aria-hidden="true" />
//               <span className="sr-only">{centerButton.tooltip}</span>
//             </button>
//           )}
//         </div>

//         {/* Right items */}
//         {rightItems.map((item, idx) => (
//           <NavButton
//             key={idx}
//             item={item}
//             roundedClass={idx === rightItems.length - 1 ? 'rounded-r-full' : ''}
//           />
//         ))}
//       </div>
//     </div>
//   );
// };

// interface NavButtonProps {
//   item: BottomNavItem;
//   roundedClass?: string;
// }

// const NavButton: React.FC<NavButtonProps> = ({ item, roundedClass = '' }) => {
//   const { label, href, icon: Icon, tooltip } = item;
//   return (
//     <Link
//       href={href}
//       data-tooltip-target={`tooltip-${tooltip}`}
//       className={`inline-flex flex-col items-center justify-center px-5
//                  hover:bg-gray-50 dark:hover:bg-gray-800 group ${roundedClass}`}
//     >
//       <Icon
//         className="w-5 h-5 md:w-6 md:h-6 mb-1 text-gray-500 dark:text-gray-400
//                    group-hover:text-blue-600 dark:group-hover:text-blue-500"
//       />
//       <span className="sr-only">{label}</span>
//     </Link>
//   );
// };

// export default BottomNav;
// // src/components/Navigation/BottomNav.tsx
// 'use client';

// import React from 'react';
// import Link from 'next/link';
// import { IconType } from 'react-icons';

// export interface BottomNavItem {
//   label: string;
//   href: string;
//   icon: IconType;
//   tooltip: string;
// }

// export interface BottomNavCenterButton {
//   icon: IconType;
//   tooltip: string;
//   onClick?: () => void;
// }

// export interface BottomNavProps {
//   items: BottomNavItem[];
//   centerButton?: BottomNavCenterButton;
//   showLabel?: boolean;
// }

// const BottomNav: React.FC<BottomNavProps> = ({
//   items,
//   centerButton,
//   showLabel = false
// }) => {
//   const half = Math.ceil(items.length / 2);
//   const leftItems = items.slice(0, half);
//   const rightItems = items.slice(half);

//   return (
//     <div className={`fixed z-50 w-full max-w-screen-md -translate-x-1/2 left-1/2
//       bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-2xl
//       shadow-lg ${showLabel ? 'h-20 bottom-6' : 'h-16 bottom-4'}
//       md:rounded-full md:bottom-6 transition-all duration-300`}>

//       <div className="grid h-full grid-cols-5 mx-auto">
//         {leftItems.map((item, idx) => (
//           <NavButton
//             key={idx}
//             item={item}
//             showLabel={showLabel}
//             roundedClass={idx === 0 ? 'md:rounded-l-full' : ''}
//           />
//         ))}

//         <div className="flex items-center justify-center">
//           {centerButton && (
//             <button
//               data-tooltip-target={`tooltip-${centerButton.tooltip}`}
//               type="button"
//               onClick={centerButton.onClick}
//               className={`inline-flex items-center justify-center font-medium
//                 bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300
//                 focus:outline-none dark:focus:ring-blue-800 transition-colors
//                 ${showLabel ? 'w-12 h-12' : 'w-10 h-10'}
//                 rounded-full shadow-lg transform hover:scale-105`}
//             >
//               <centerButton.icon
//                 className={`text-white ${showLabel ? 'w-6 h-6' : 'w-5 h-5'}`}
//               />
//               <span className="sr-only">{centerButton.tooltip}</span>
//             </button>
//           )}
//         </div>

//         {rightItems.map((item, idx) => (
//           <NavButton
//             key={idx}
//             item={item}
//             showLabel={showLabel}
//             roundedClass={idx === rightItems.length - 1 ? 'md:rounded-r-full' : ''}
//           />
//         ))}
//       </div>
//     </div>
//   );
// };

// interface NavButtonProps {
//   item: BottomNavItem;
//   roundedClass?: string;
//   showLabel: boolean;
// }

// const NavButton: React.FC<NavButtonProps> = ({
//   item,
//   roundedClass = '',
//   showLabel
// }) => {
//   const { label, href, icon: Icon, tooltip } = item;

//   return (
//     <Link
//       href={href}
//       data-tooltip-target={`tooltip-${tooltip}`}
//       className={`inline-flex flex-col items-center justify-center
//         hover:bg-gray-50 dark:hover:bg-gray-800 group transition-colors
//         ${roundedClass} ${showLabel ? 'px-4 py-3' : 'px-3 py-2'}
//         md:px-5 md:py-3`}
//     >
//       <Icon
//         className={`transition-all ${
//           showLabel
//             ? 'w-6 h-6 mb-1 md:w-7 md:h-7'
//             : 'w-5 h-5 mb-0 md:w-6 md:h-6'
//         } text-gray-500 dark:text-gray-400
//          group-hover:text-blue-600 dark:group-hover:text-blue-500`}
//       />

//       <span className={`${
//         showLabel
//           ? 'text-xs md:text-sm opacity-100 scale-100'
//           : 'text-[0px] opacity-0 scale-0'
//       } transition-all duration-200 font-medium text-gray-500
//         dark:text-gray-400 group-hover:text-blue-600
//         dark:group-hover:text-blue-500`}>
//         {label}
//       </span>
//     </Link>
//   );
// };

// export default BottomNav;

'use client';
import React from 'react';
import Link from 'next/link';
import { IconType } from 'react-icons';

export interface BottomNavItem {
  label: string;
  href: string;
  icon: IconType;
  tooltip: string;
  showLabel?: boolean; // Added showLabel prop
}

export interface BottomNavCenterButton {
  icon: IconType;
  tooltip: string;
  onClick?: () => void; // or use href if needed
}

export interface BottomNavProps {
  /** Array of navigation items (except the center button) */
  items: BottomNavItem[];
  /** Optional center button (e.g. "New item") */
  centerButton?: BottomNavCenterButton;
}

const BottomNav: React.FC<BottomNavProps> = ({ items, centerButton }) => {
  // Split items into left and right halves for symmetry.
  const half = Math.ceil(items.length / 2);
  const leftItems = items.slice(0, half);
  const rightItems = items.slice(half);

  return (
    <div
      className="fixed z-50 w-full h-16 max-w-lg -translate-x-1/2 bottom-4 left-1/2
                    bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full
                    shadow-md"
    >
      <div className="grid h-full max-w-lg grid-cols-5 mx-auto">
        {/* Left items */}
        {leftItems.map((item, idx) => (
          <NavButton
            key={idx}
            item={item}
            roundedClass={idx === 0 ? 'rounded-l-full' : ''}
          />
        ))}
        {/* Center button */}
        <div className="flex items-center justify-center">
          {centerButton && (
            <button
              data-tooltip-target={`tooltip-${centerButton.tooltip}`}
              type="button"
              onClick={centerButton.onClick}
              className="inline-flex items-center justify-center w-10 h-10 font-medium
                         bg-blue-600 rounded-full hover:bg-blue-700 group focus:ring-4 
                         focus:ring-blue-300 focus:outline-none dark:focus:ring-blue-800"
            >
              <centerButton.icon
                className="w-4 h-4 text-white"
                aria-hidden="true"
              />
              <span className="sr-only">{centerButton.tooltip}</span>
            </button>
          )}
        </div>
        {/* Right items */}
        {rightItems.map((item, idx) => (
          <NavButton
            key={idx}
            item={item}
            roundedClass={idx === rightItems.length - 1 ? 'rounded-r-full' : ''}
          />
        ))}
      </div>
    </div>
  );
};

interface NavButtonProps {
  item: BottomNavItem;
  roundedClass?: string;
}

const NavButton: React.FC<NavButtonProps> = ({ item, roundedClass = '' }) => {
  const { label, href, icon: Icon, tooltip, showLabel = false } = item;

  return (
    <Link
      href={href}
      data-tooltip-target={`tooltip-${tooltip}`}
      className={`inline-flex flex-col items-center justify-center px-3 py-2
                 hover:bg-gray-50 dark:hover:bg-gray-800 group ${roundedClass}`}
    >
      <Icon
        className="w-5 h-5 md:w-6 md:h-6 mb-1 text-gray-500 dark:text-gray-400
                   group-hover:text-blue-600 dark:group-hover:text-blue-500"
      />
      {showLabel && (
        <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500">
          {label}
        </span>
      )}
    </Link>
  );
};

export default BottomNav;

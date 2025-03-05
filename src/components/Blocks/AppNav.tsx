'use client';

import React from 'react';

import {
  MdOutlineLocalActivity,
  MdEvent,
  MdGroup,
  MdBarChart,
  MdAdd,
} from 'react-icons/md';
import BottomNav, {
  BottomNavCenterButton,
  BottomNavItem,
} from '../Navigation/BottomNav';
import FullBottomNav from '../Navigation/FullBottomNavigation';

const AppNav: React.FC = () => {
  const items: BottomNavItem[] = [
    {
      label: 'Activities',
      href: '/activities',
      icon: MdOutlineLocalActivity,
      tooltip: 'activities',
    },
    {
      label: 'Sessions',
      href: '/sessions',
      icon: MdEvent,
      tooltip: 'sessions',
    },
    {
      label: 'Service Users',
      href: '/serviceUsers',
      icon: MdGroup,
      tooltip: 'serviceUsers',
    },
    {
      label: 'Reports',
      href: '/reports',
      icon: MdBarChart,
      tooltip: 'reports',
    },
  ];
  const centerButton: BottomNavCenterButton = {
    icon: MdAdd,
    tooltip: 'new',
    onClick: () => console.log('Create new item!'),
  };

  return <FullBottomNav navItems={items} />;
};

export default AppNav;

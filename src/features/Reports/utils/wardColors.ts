export const wardColors: Record<string, string> = {
  Juniper: 'from-emerald-500 to-teal-600',
  Palm: 'from-indigo-500 to-blue-600',
  Mulberry: 'from-purple-500 to-violet-600',
  Elm: 'from-amber-500 to-orange-600',
  // Add more wards as needed
};

export const getWardColor = (wardName: string): string => {
  return wardColors[wardName] || 'from-gray-500 to-gray-600';
};

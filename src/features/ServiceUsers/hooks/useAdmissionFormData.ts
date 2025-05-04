// src/features/ServiceUsers/hooks/useAdmissionFormData.ts

import { useWards } from '@/features/Wards/hooks/useWards';

export const useAdmissionFormData = () => {
  const { wards, isLoading: isWardsLoading } = useWards();

  return {
    wards,
    isWardsLoading,
  };
};
// src/features/ServiceUsers/hooks/useAdmissionFormData.ts

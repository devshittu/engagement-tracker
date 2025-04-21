'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/features/auth/hooks/useAuth';

export type Admission = {
  id: number;
  serviceUser: { id: number; name: string; nhsNumber: string };
  ward: { id: number; name: string };
  admissionDate: string;
  dischargeDate: string | null;
};

export const useActiveAdmissions = () => {
  const { user } = useAuth();

  return useQuery<Admission[], Error>({
    queryKey: ['activeAdmissions'],
    queryFn: async () => {
      const response = await apiClient.get<Admission[]>(
        '/api/admissions/active',
      );
      return response.map((admission) => ({
        ...admission,
        admissionDate: new Date(admission.admissionDate).toISOString(),
        dischargeDate: admission.dischargeDate
          ? new Date(admission.dischargeDate).toISOString()
          : null,
      }));
    },
    enabled: !!user, // Only fetch if user is authenticated
    staleTime: 1000 * 60, // 1 minute
  });
};

// src/features/admissions/hooks/useActiveAdmissions.ts

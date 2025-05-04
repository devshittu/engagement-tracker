// src/features/ServiceUsers/hooks/useNhsLookup.ts

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { logger } from '@/lib/logger';

type ServiceUser = {
  id: number;
  name: string;
  nhsNumber: string;
  admissionStatus: 'admitted' | 'discharged' | 'neverAdmitted';
  latestAdmission: {
    admissionDate: string;
    dischargeDate: string | null;
  } | null;
};

type NhsLookupResponse = {
  serviceUsers: ServiceUser[];
};

export const useNhsLookup = (nhsNumber: string) => {
  return useQuery<ServiceUser[], Error>({
    queryKey: ['nhsLookup', nhsNumber],
    queryFn: async () => {
      if (!nhsNumber) {
        logger.debug(
          'No NHS number provided for lookup, returning empty array',
        );
        return [];
      }

      logger.debug('Initiating API call to /api/service-users/nhs-lookup', {
        nhsNumber,
      });

      try {
        const response = await apiClient.get<NhsLookupResponse>(
          `/api/service-users/nhs-lookup?nhsNumber=${nhsNumber}`,
        );

        logger.debug('NHS lookup response received', { response });

        // Check if response and serviceUsers exist

        // Handle both standard Axios response (response.data) and potential flattened response
        const data = 'data' in response ? response.data : response;
        const serviceUsers = data.serviceUsers ?? [];

        if (!serviceUsers || !Array.isArray(serviceUsers)) {
          logger.warn(
            'Invalid NHS lookup response structure, returning empty array',
            { response },
          );
          return [];
        }

        logger.debug('Service users retrieved', { count: serviceUsers.length });
        return serviceUsers;
      } catch (error) {
        logger.error('NHS lookup API call failed', {
          error: error instanceof Error ? error.message : String(error),
        });
        return [];
      }
    },
    enabled: !!nhsNumber && nhsNumber.length >= 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
// src/features/ServiceUsers/hooks/useNhsLookup.ts

// src/features/ServiceUsers/hooks/useCreateAdmission.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

type ServiceUserData = { nhsNumber: string; name?: string };
type CreateAdmissionVariables = {
  serviceUser: ServiceUserData;
  wardId: number;
};

export const useCreateAdmission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: CreateAdmissionVariables) => {
      const response = await apiClient.post('/api/admissions', variables);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceUsersByNHS'] });
      queryClient.invalidateQueries({ queryKey: ['admissions'] });
    },
    onError: (error: any) => {
      throw new Error(error.message || 'Failed to create admission');
    },
  });
};
// src/features/ServiceUsers/hooks/useCreateAdmission.ts

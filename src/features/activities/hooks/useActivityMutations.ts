// src/features/activities/hooks/useActivityMutations.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import {
  CreateActivityInput,
  UpdateActivityInput,
  BatchActivateInput,
} from '../types';

const createActivity = async (input: CreateActivityInput) => {
  return apiClient.post('/api/activities', input);
};

const updateActivity = async (id: number, input: UpdateActivityInput) => {
  return apiClient.put(`/api/activities/${id}`, input);
};

const deleteActivity = async (id: number) => {
  return apiClient.delete(`/api/activities/${id}`);
};

const batchActivateActivities = async (inputs: BatchActivateInput[]) => {
  return apiClient.post('/api/activities/batch-activate', inputs);
};

export const useActivityMutations = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createActivity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateActivityInput }) =>
      updateActivity(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteActivity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['activeActivities'] });
    },
  });

  const batchActivateMutation = useMutation({
    mutationFn: batchActivateActivities,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['activeActivities'] });
    },
  });

  return {
    createActivity: createMutation.mutate,
    isCreating: createMutation.isPending,
    updateActivity: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    deleteActivity: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    batchActivateActivities: batchActivateMutation.mutate,
    isBatchActivating: batchActivateMutation.isPending,
  };
};

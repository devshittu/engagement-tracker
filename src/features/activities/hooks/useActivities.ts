// src/features/activities/hooks/useActivities.ts

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Activity, Department } from '../types';

type FetchActivitiesResponse = {
  activities: Activity[];
  total: number;
};

const fetchActivities = async (
  page: number,
  pageSize: number,
  departmentId?: number,
  userDepartmentId?: number,
  userRoleLevel?: number,
): Promise<FetchActivitiesResponse> => {
  const params: Record<string, string> = {
    page: page.toString(),
    pageSize: pageSize.toString(),
  };

  // For users with role.level < 3, filter by their department
  if (userRoleLevel !== undefined && userRoleLevel < 3 && userDepartmentId) {
    params.departmentId = userDepartmentId.toString();
  } else if (departmentId) {
    // For users with role.level >= 4, allow filtering by selected department
    params.departmentId = departmentId.toString();
  }

  // apiClient.get returns the data directly due to the response interceptor
  const response: FetchActivitiesResponse = await apiClient.get(
    '/api/activities',
    { params }
  );
  return {
    activities: response.activities.map((activity: Activity) => ({
      ...activity,
      createdAt: new Date(activity.createdAt).toISOString(),
      updatedAt: activity.updatedAt
        ? new Date(activity.updatedAt).toISOString()
        : null,
    })),
    total: response.total,
  };
};

const fetchActiveActivities = async (): Promise<Activity[]> => {
  // apiClient.get returns the data directly (Activity[])
  const response: Activity[] = await apiClient.get('/api/activities/active');
  return response.map((activity: Activity) => ({
    ...activity,
    createdAt: new Date(activity.createdAt).toISOString(),
    updatedAt: activity.updatedAt
      ? new Date(activity.updatedAt).toISOString()
      : null,
  }));
};

const fetchDepartments = async (): Promise<Department[]> => {
  // apiClient.get returns the data directly (Department[])
  const response: Department[] = await apiClient.get('/api/departments');
  return response;
};

export const useActivities = (selectedDepartmentId?: number) => {
  const { user } = useAuth();
  const userRoleLevel = user?.roles?.level ?? 0;
  const userDepartmentId = user?.departmentId;

  const pageSize = 20;

  const activitiesQuery = useInfiniteQuery({
    queryKey: [
      'activities',
      selectedDepartmentId,
      userDepartmentId,
      userRoleLevel,
    ],
    queryFn: ({ pageParam = 1 }) =>
      fetchActivities(
        pageParam,
        pageSize,
        selectedDepartmentId,
        userDepartmentId,
        userRoleLevel,
      ),
    getNextPageParam: (lastPage, allPages) => {
      const totalPages = Math.ceil(lastPage.total / pageSize);
      const nextPage = allPages.length + 1;
      return nextPage <= totalPages ? nextPage : undefined;
    },
    initialPageParam: 1,
    enabled: !!user,
  });

  const activeActivitiesQuery = useQuery({
    queryKey: ['activeActivities'],
    queryFn: fetchActiveActivities,
    enabled: !!user,
  });

  const departmentsQuery = useQuery({
    queryKey: ['departments'],
    queryFn: fetchDepartments,
    enabled: userRoleLevel >= 4, // Only fetch departments for users with role.level >= 4
  });

  return {
    activities:
      activitiesQuery.data?.pages.flatMap((page) => page.activities) ?? [],
    fetchNextPage: activitiesQuery.fetchNextPage,
    hasNextPage: activitiesQuery.hasNextPage,
    isLoadingActivities: activitiesQuery.isLoading,
    activeActivities: activeActivitiesQuery.data ?? [],
    isLoadingActiveActivities: activeActivitiesQuery.isLoading,
    departments: departmentsQuery.data ?? [],
    isLoadingDepartments: departmentsQuery.isLoading,
  };
};
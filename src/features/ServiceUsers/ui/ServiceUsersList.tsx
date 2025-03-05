'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ServiceUser, ServiceUsersResponse } from '@/types/serviceUser';
import { useServiceUsers } from '@/hooks/useServiceUsers';
import { InView } from 'react-intersection-observer';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';

const ServiceUsersList: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<
    'admitted' | 'discharged' | 'all'
  >('admitted');
  const [sortBy, setSortBy] = useState<string>('name');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [groupByWard, setGroupByWard] = useState<boolean>(false);

  const queryClient = useQueryClient();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useServiceUsers({
      statusFilter,
      sortBy,
      order,
      groupByWard,
    });

  const handleStatusFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setStatusFilter(e.target.value as 'admitted' | 'discharged' | 'all');
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  };

  const handleOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setOrder(e.target.value as 'asc' | 'desc');
  };

  const handleGroupByWardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGroupByWard(e.target.checked);
  };

  const handleEndSession = async (sessionId: number) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/end`, {
        method: 'POST',
      });
      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['sessions'] });
        toast.success('Session ended successfully!');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to end session');
      }
    } catch (error) {
      console.error('Error ending session:', error);
      toast.error('An unexpected error occurred.');
    }
  };

  // Function to find the latest admission
  const getLatestAdmission = (admissions: any[] | undefined) => {
    if (!admissions || admissions.length === 0) return null;
    return admissions.reduce((latest, current) => {
      return new Date(current.admissionDate) > new Date(latest.admissionDate)
        ? current
        : latest;
    }, admissions[0]);
  };

  return (
    <div className="container mx-auto py-8">
      {/* Filters and Sorting */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        {/* Status Filter */}
        <div className="flex items-center space-x-2">
          <label htmlFor="statusFilter" className="font-medium">
            Status:
          </label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={handleStatusFilterChange}
            className="select select-bordered"
          >
            <option value="all">All</option>
            <option value="admitted">Admitted</option>
            <option value="discharged">Discharged</option>
          </select>
        </div>

        {/* Sort By */}
        <div className="flex items-center space-x-2">
          <label htmlFor="sortBy" className="font-medium">
            Sort By:
          </label>
          <select
            id="sortBy"
            value={sortBy}
            onChange={handleSortChange}
            className="select select-bordered"
          >
            <option value="name">Name</option>
            <option value="nhsNumber">NHS Number</option>
          </select>
        </div>

        {/* Order */}
        <div className="flex items-center space-x-2">
          <label htmlFor="order" className="font-medium">
            Order:
          </label>
          <select
            id="order"
            value={order}
            onChange={handleOrderChange}
            className="select select-bordered"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>

        {/* Group By Ward */}
        <div className="flex items-center space-x-2">
          <label htmlFor="groupByWard" className="font-medium">
            Group by Ward:
          </label>
          <input
            type="checkbox"
            id="groupByWard"
            checked={groupByWard}
            onChange={handleGroupByWardChange}
            className="checkbox checkbox-primary"
          />
        </div>
      </div>

      {/* Service Users List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {!groupByWard ? (
          // Ungrouped List - Card Layout
          <>
            {/* @ts-ignore */}
            {data?.pages.map(
              (page: ServiceUsersResponse, pageIndex: number) => (
                <React.Fragment key={pageIndex}>
                  {Array.isArray(page.serviceUsers) &&
                    page.serviceUsers.map((user: ServiceUser) => {
                      const latestAdmission = getLatestAdmission(
                        user.admissions,
                      );
                      const wardName = latestAdmission?.ward?.name || 'No Ward';
                      const isAdmitted =
                        latestAdmission && !latestAdmission.dischargeDate;

                      return (
                        <div
                          key={user.id}
                          className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow duration-300"
                        >
                          <div className="card-body">
                            <h2 className="card-title flex justify-between items-center">
                              <span>{user.name}</span>
                              <span
                                className={`badge ${
                                  isAdmitted ? 'badge-success' : 'badge-error'
                                }`}
                              >
                                {isAdmitted ? 'Admitted' : 'Discharged'}
                              </span>
                            </h2>
                            <p className="text-sm text-gray-600">
                              <strong>Ward:</strong> {wardName}
                            </p>
                            <div className="card-actions justify-end mt-4">
                              <Link href={`/serviceUsers/${user.id}/edit`}>
                                <button className="btn btn-sm btn-info flex items-center gap-1">
                                  <FiEdit />
                                  Edit
                                </button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </React.Fragment>
              ),
            )}
          </>
        ) : (
          // Grouped List by Ward - Card Layout
          <>
            {/* @ts-ignore */}
            {data?.pages.map(
              (page: ServiceUsersResponse, pageIndex: number) => (
                <div key={pageIndex} className="w-full">
                  {Object.entries(page.serviceUsers).map(
                    ([wardName, users]: [string, ServiceUser[]]) => (
                      <div key={wardName} className="mb-6">
                        <h2 className="text-2xl font-semibold mb-4">
                          {wardName}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {users.map((user: ServiceUser) => {
                            const latestAdmission = getLatestAdmission(
                              user.admissions,
                            );
                            const isAdmitted =
                              latestAdmission && !latestAdmission.dischargeDate;
                            return (
                              <div
                                key={user.id}
                                className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow duration-300"
                              >
                                <div className="card-body">
                                  <h3 className="card-title flex justify-between items-center">
                                    <span>{user.name}</span>
                                    <span
                                      className={`badge ${
                                        isAdmitted
                                          ? 'badge-success'
                                          : 'badge-error'
                                      }`}
                                    >
                                      {isAdmitted ? 'Admitted' : 'Discharged'}
                                    </span>
                                  </h3>
                                  <div className="card-actions justify-end mt-4">
                                    <Link
                                      href={`/serviceUsers/${user.id}/edit`}
                                    >
                                      <button className="btn btn-sm btn-info flex items-center gap-1">
                                        <FiEdit />
                                        Edit
                                      </button>
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              ),
            )}
          </>
        )}
      </div>

      {/* Infinite Scrolling */}
      <div className="flex justify-center items-center mt-6">
        {hasNextPage && (
          <InView
            onChange={(inView) => {
              if (inView && !isFetchingNextPage) {
                fetchNextPage();
              }
            }}
          >
            {({ ref }) => (
              <div ref={ref} className="flex justify-center items-center">
                {isFetchingNextPage ? (
                  <button className="btn btn-ghost loading"></button>
                ) : (
                  <button className="btn btn-secondary">Load More</button>
                )}
              </div>
            )}
          </InView>
        )}

        {!hasNextPage && (
          <p className="text-gray-500">No more service users to load.</p>
        )}
      </div>
    </div>
  );
};

export default ServiceUsersList;

// src/app/serviceUsers/ServiceUsersList.tsx

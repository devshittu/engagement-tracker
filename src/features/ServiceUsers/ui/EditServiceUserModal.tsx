// src/features/ServiceUsers/ui/EditServiceUserModal.tsx

'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { apiClient } from '@/lib/api-client';
import { ServiceUserModal } from '@/components/Modal/ServiceUserModal';
import { useModalStore } from '@/stores/modalStore';

type Ward = { id: number; name: string };
type ServiceUser = {
  id: number;
  name: string;
  nhsNumber: string;
  admissions: {
    id: number;
    ward: { id: number; name: string };
    dischargeDate: string | null;
  }[];
};

type EditServiceUserModalProps = {
  onEdit: () => void;
  wards: Ward[];
};

export const EditServiceUserModal: React.FC<EditServiceUserModalProps> = ({
  onEdit,
  wards,
}) => {
  const router = useRouter();
  const {
    editModal: { isOpen, selectedUser, formData, wardChangePrompt },
    updateEditForm,
    setEditModal,
    setWardChangePrompt,
    resetEditForm,
  } = useModalStore();

  const latestAdmission = selectedUser?.admissions?.[0];
  const isAdmitted = latestAdmission && !latestAdmission.dischargeDate;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!selectedUser) return;

    if (isAdmitted && formData.wardId !== latestAdmission.ward.id) {
      setWardChangePrompt(true, Number(formData.wardId));
      return;
    }

    try {
      await apiClient.put(`/api/service-users/${selectedUser.id}`, {
        name: formData.name,
        nhsNumber: formData.nhsNumber,
      });
      toast.success('Service user updated successfully!');
      onEdit();
      router.refresh();
      setEditModal(false);
      resetEditForm();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update service user.');
    }
  };

  const handleDischargeAndReadmit = async () => {
    if (!selectedUser || !wardChangePrompt.newWardId || !latestAdmission)
      return;
    try {
      await apiClient.put(
        `/api/service-users/${selectedUser.id}/admissions/${latestAdmission.id}/discharge`,
        {},
      );
      await apiClient.post(`/api/service-users/${selectedUser.id}/admit`, {
        wardId: wardChangePrompt.newWardId,
      });
      toast.success('Ward changed successfully!');
      onEdit();
      router.refresh();
      setEditModal(false);
      resetEditForm();
    } catch (error: any) {
      toast.error(error.message || 'Failed to change ward.');
    }
  };

  return (
    <>
      <ServiceUserModal
        isOpen={isOpen}
        onClose={() => {
          setEditModal(false);
          resetEditForm();
        }}
        title="Edit Service User"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => updateEditForm({ name: e.target.value })}
              required
              className="mt-2 block w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 py-3 px-4 focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all duration-200 shadow-sm"
            />
          </div>
          <div>
            <label
              htmlFor="nhsNumber"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              NHS Number
            </label>
            <input
              type="text"
              id="nhsNumber"
              value={formData.nhsNumber}
              onChange={(e) => updateEditForm({ nhsNumber: e.target.value })}
              required
              className="mt-2 block w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 py-3 px-4 focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all duration-200 shadow-sm"
            />
          </div>
          {isAdmitted && (
            <div>
              <label
                htmlFor="wardId"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                Ward
              </label>
              <select
                id="wardId"
                value={formData.wardId}
                onChange={(e) =>
                  updateEditForm({ wardId: Number(e.target.value) })
                }
                required
                className="mt-2 block w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 py-3 px-4 focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all duration-200 shadow-sm"
              >
                <option value="">Select Ward</option>
                {wards.map((ward) => (
                  <option key={ward.id} value={ward.id}>
                    {ward.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </form>
        <div className="mt-8 flex justify-end gap-4">
          <button
            onClick={() => {
              setEditModal(false);
              resetEditForm();
            }}
            className="btn px-6 py-2.5 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 shadow-md"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="btn px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-400 to-teal-600 text-white hover:from-teal-500 hover:to-teal-700 transition-all duration-200 shadow-md"
          >
            Update
          </button>
        </div>
      </ServiceUserModal>

      <ServiceUserModal
        isOpen={wardChangePrompt.isOpen}
        onClose={() => setWardChangePrompt(false)}
        title="Confirm Ward Change"
      >
        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
          Changing the ward requires discharging{' '}
          <strong className="text-teal-500">{selectedUser?.name}</strong> from
          the current ward and readmitting them to the new ward.
        </p>
        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mt-2">
          Current Ward:{' '}
          <strong className="text-teal-500">
            {latestAdmission?.ward.name}
          </strong>
        </p>
        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mt-2">
          New Ward:{' '}
          <strong className="text-teal-500">
            {wards.find((w) => w.id === wardChangePrompt.newWardId)?.name}
          </strong>
        </p>
        <div className="mt-8 flex justify-end gap-4">
          <button
            onClick={() => setWardChangePrompt(false)}
            className="btn px-6 py-2.5 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 shadow-md"
          >
            Cancel
          </button>
          <button
            onClick={handleDischargeAndReadmit}
            className="btn px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-400 to-teal-600 text-white hover:from-teal-500 hover:to-teal-700 transition-all duration-200 shadow-md"
          >
            Confirm
          </button>
        </div>
      </ServiceUserModal>
    </>
  );
};
// src/features/ServiceUsers/ui/EditServiceUserModal.tsx

// src/features/ServiceUsers/ui/DischargeConfirmationModal.tsx

'use client';

import { toast } from 'react-toastify';
import { apiClient } from '@/lib/api-client';
import { ServiceUserModal } from '@/components/Modal/ServiceUserModal';
import { useModalStore } from '@/stores/modalStore';

type DischargeConfirmationModalProps = {
  onDischarge: () => void;
};

export const DischargeConfirmationModal: React.FC<
  DischargeConfirmationModalProps
> = ({ onDischarge }) => {
  const {
    dischargeModal: { isOpen, selectedUser },
    setDischargeModal,
  } = useModalStore();

  const handleDischarge = async () => {
    if (!selectedUser?.admissions?.[0]) return;
    try {
      await apiClient.put(
        `/api/service-users/${selectedUser.id}/admissions/${selectedUser.admissions[0].id}/discharge`,
        {},
      );
      toast.success(`${selectedUser.name} has been discharged successfully!`);
      onDischarge();
      setDischargeModal(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to discharge service user.');
    }
  };

  return (
    <ServiceUserModal
      isOpen={isOpen}
      onClose={() => setDischargeModal(false)}
      title="Confirm Discharge"
    >
      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
        Are you sure you want to discharge{' '}
        <strong className="text-teal-500">{selectedUser?.name}</strong>?
      </p>
      {selectedUser?.admissions?.[0] && (
        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mt-2">
          Current Ward:{' '}
          <strong className="text-teal-500">
            {selectedUser.admissions[0].ward.name}
          </strong>
        </p>
      )}
      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mt-2">
        This action cannot be undone.
      </p>
      <div className="mt-8 flex justify-end gap-4">
        <button
          onClick={() => setDischargeModal(false)}
          className="btn px-6 py-2.5 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 shadow-md"
        >
          Cancel
        </button>
        <button
          onClick={handleDischarge}
          className="btn px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-400 to-red-600 text-white hover:from-red-500 hover:to-red-700 transition-all duration-200 shadow-md"
        >
          Discharge
        </button>
      </div>
    </ServiceUserModal>
  );
};
// src/features/ServiceUsers/ui/DischargeConfirmationModal.tsx

// src/features/ServiceUsers/ui/CreateAdmissionModal.tsx

'use client';

import { useState, useEffect, FormEvent, KeyboardEvent, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { ServiceUserModal } from '@/components/Modal/ServiceUserModal';
import { useCreateAdmission } from '@/features/ServiceUsers/hooks/useCreateAdmission';
import { useDebounce } from '@/hooks/useDebounce';
import { useAdmissionFormData } from '@/features/ServiceUsers/hooks/useAdmissionFormData';
import { useModalStore } from '@/stores/modalStore';
import { useNhsLookup } from '@/features/ServiceUsers/hooks/useNhsLookup';

type Ward = { id: number; name: string };
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

type CreateAdmissionModalProps = {
  onAdmissionCreated: () => void;
};

export const CreateAdmissionModal: React.FC<CreateAdmissionModalProps> = ({
  onAdmissionCreated,
}) => {
  const router = useRouter();
  const {
    createAdmissionModal: { isOpen, formData },
    setCreateAdmissionModal,
    updateCreateAdmissionForm,
    resetCreateAdmissionForm,
  } = useModalStore();
  const { mutate, isPending } = useCreateAdmission();
  const [existingUser, setExistingUser] = useState<ServiceUser | null>(null);
  const [showReadmitPrompt, setShowReadmitPrompt] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focusedSuggestionIndex, setFocusedSuggestionIndex] = useState(-1);
  const suggestionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const debouncedNhsNumber = useDebounce(formData.nhsNumber, 300);
  const { wards, isWardsLoading } = useAdmissionFormData();
  const { data: serviceUsers = [], isPending: isServiceUsersLoading } =
    useNhsLookup(debouncedNhsNumber);

  useEffect(() => {
    if (debouncedNhsNumber.length >= 3) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      setFocusedSuggestionIndex(-1);
      setExistingUser(null);
      setShowReadmitPrompt(false);
    }
  }, [debouncedNhsNumber]);

  useEffect(() => {
    const matchedUser = serviceUsers.find(
      (user) => user.nhsNumber === formData.nhsNumber,
    );
    setExistingUser(matchedUser || null);
    if (matchedUser) {
      updateCreateAdmissionForm({ name: matchedUser.name });
      if (matchedUser.admissionStatus === 'discharged') {
        setShowReadmitPrompt(true);
      } else if (matchedUser.admissionStatus === 'admitted') {
        toast.error(
          'This service user is already admitted. Cannot create a new admission.',
        );
      }
    } else {
      setShowReadmitPrompt(false);
    }
  }, [serviceUsers, formData.nhsNumber, updateCreateAdmissionForm]);

  const handleSuggestionClick = (user: ServiceUser) => {
    updateCreateAdmissionForm({ nhsNumber: user.nhsNumber, name: user.name });
    setShowSuggestions(false);
    setFocusedSuggestionIndex(-1);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || serviceUsers.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedSuggestionIndex((prev) =>
        Math.min(prev + 1, serviceUsers.length - 1),
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedSuggestionIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && focusedSuggestionIndex >= 0) {
      e.preventDefault();
      handleSuggestionClick(serviceUsers[focusedSuggestionIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setFocusedSuggestionIndex(-1);
    }
  };

  useEffect(() => {
    if (
      focusedSuggestionIndex >= 0 &&
      suggestionRefs.current[focusedSuggestionIndex]
    ) {
      suggestionRefs.current[focusedSuggestionIndex]?.scrollIntoView({
        block: 'nearest',
      });
    }
  }, [focusedSuggestionIndex]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (formData.wardId === '') {
      toast.error('Please select a ward.');
      return;
    }

    if (existingUser) {
      if (existingUser.admissionStatus === 'admitted') {
        toast.error(
          'This service user is already admitted. Cannot create a new admission.',
        );
        return;
      }
      if (existingUser.admissionStatus === 'discharged') {
        toast.info('Please confirm readmission for this service user.');
        return;
      }
    }

    mutate(
      {
        serviceUser: { nhsNumber: formData.nhsNumber, name: formData.name },
        wardId: formData.wardId,
      },
      {
        onSuccess: () => {
          toast.success('Admission created successfully!');
          onAdmissionCreated();
          router.refresh();
          resetCreateAdmissionForm();
          setCreateAdmissionModal(false);
          setShowReadmitPrompt(false);
        },
        onError: (error: any) => {
          toast.error(error.message || 'Failed to create admission.');
        },
      },
    );
  };

  const handleReadmitConfirm = () => {
    if (!existingUser || formData.wardId === '') return;
    if (existingUser.admissionStatus !== 'discharged') {
      toast.error('Cannot readmit: Service user is not discharged.');
      return;
    }

    mutate(
      {
        serviceUser: { nhsNumber: formData.nhsNumber },
        wardId: formData.wardId,
      },
      {
        onSuccess: () => {
          toast.success('Service user readmitted successfully!');
          onAdmissionCreated();
          router.refresh();
          resetCreateAdmissionForm();
          setCreateAdmissionModal(false);
          setShowReadmitPrompt(false);
        },
        onError: (error: any) => {
          toast.error(error.message || 'Failed to readmit service user.');
        },
      },
    );
  };

  if (isWardsLoading) {
    return (
      <ServiceUserModal
        isOpen={isOpen}
        onClose={() => setCreateAdmissionModal(false)}
        title="Loading Wards"
      >
        <div className="flex justify-center items-center h-32">
          <div className="loading loading-spinner loading-lg text-teal-500" />
        </div>
      </ServiceUserModal>
    );
  }

  return (
    <>
      <ServiceUserModal
        isOpen={isOpen}
        onClose={() => {
          setCreateAdmissionModal(false);
          resetCreateAdmissionForm();
          setShowReadmitPrompt(false);
          setShowSuggestions(false);
          setFocusedSuggestionIndex(-1);
        }}
        title="Create New Admission"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <label
              htmlFor="nhsNumber"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              NHS Number
            </label>
            <div className="relative mt-2">
              <input
                type="text"
                id="nhsNumber"
                value={formData.nhsNumber}
                onChange={(e) =>
                  updateCreateAdmissionForm({ nhsNumber: e.target.value })
                }
                onKeyDown={handleKeyDown}
                required
                role="combobox"
                className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 py-2.5 px-4 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 shadow-sm"
                aria-autocomplete="list"
                aria-controls="suggestion-list"
                aria-expanded={showSuggestions}
              />
              {isServiceUsersLoading && debouncedNhsNumber.length >= 3 && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="loading loading-spinner loading-sm text-teal-500" />
                </div>
              )}
            </div>
            {showSuggestions && serviceUsers.length > 0 && (
              <div
                id="suggestion-list"
                role="listbox"
                className="absolute z-10 mt-1 w-full max-h-60 overflow-y-auto rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 shadow-lg"
              >
                {serviceUsers.map((user, index) => (
                  <div
                    key={user.id}
                    ref={(el) => {
                      suggestionRefs.current[index] = el;
                    }}
                    role="option"
                    tabIndex={-1}
                    aria-selected={focusedSuggestionIndex === index}
                    onClick={() => handleSuggestionClick(user)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSuggestionClick(user);
                      }
                    }}
                    className={`px-4 py-2 cursor-pointer text-gray-900 dark:text-gray-100 transition-colors duration-200 ${
                      focusedSuggestionIndex === index
                        ? 'bg-teal-50 dark:bg-gray-700'
                        : 'hover:bg-teal-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {user.nhsNumber}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      {user.admissionStatus === 'admitted'
                        ? 'Currently Admitted'
                        : user.admissionStatus === 'discharged'
                          ? 'Discharged'
                          : 'Never Admitted'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
              onChange={(e) =>
                updateCreateAdmissionForm({ name: e.target.value })
              }
              required
              disabled={!!existingUser}
              className="mt-2 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 py-2.5 px-4 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 shadow-sm disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
            />
          </div>
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
                updateCreateAdmissionForm({ wardId: Number(e.target.value) })
              }
              required
              className="mt-2 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 py-2.5 px-4 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 shadow-sm"
              disabled={wards.length === 0}
            >
              <option value="">Select Ward</option>
              {wards.map((ward) => (
                <option key={ward.id} value={ward.id}>
                  {ward.name}
                </option>
              ))}
            </select>
            {wards.length === 0 && !isWardsLoading && (
              <p className="mt-2 text-sm text-red-500">
                No wards available. Please contact an admin.
              </p>
            )}
          </div>
        </form>
        <div className="mt-6 flex justify-end gap-4">
          <button
            type="button"
            onClick={() => {
              setCreateAdmissionModal(false);
              resetCreateAdmissionForm();
              setShowReadmitPrompt(false);
              setShowSuggestions(false);
              setFocusedSuggestionIndex(-1);
            }}
            className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 shadow-md"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={
              isPending ||
              wards.length === 0 ||
              existingUser?.admissionStatus === 'admitted'
            }
            className="px-4 py-2 rounded-lg bg-teal-500 text-white hover:bg-teal-600 transition-colors duration-200 shadow-md disabled:bg-teal-300 disabled:cursor-not-allowed"
          >
            {isPending ? 'Creating...' : 'Create Admission'}
          </button>
        </div>
      </ServiceUserModal>

      {existingUser && existingUser.admissionStatus === 'discharged' && (
        <ServiceUserModal
          isOpen={showReadmitPrompt}
          onClose={() => setShowReadmitPrompt(false)}
          title="Service User Exists"
        >
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
            A service user with NHS number{' '}
            <strong className="text-teal-500">{formData.nhsNumber}</strong>{' '}
            already exists and was discharged. Would you like to readmit{' '}
            {existingUser.name}?
          </p>
          <div className="mt-6 flex justify-end gap-4">
            <button
              type="button"
              onClick={() => setShowReadmitPrompt(false)}
              className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 shadow-md"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleReadmitConfirm}
              disabled={isPending || wards.length === 0}
              className="px-4 py-2 rounded-lg bg-teal-500 text-white hover:bg-teal-600 transition-colors duration-200 shadow-md disabled:bg-teal-300 disabled:cursor-not-allowed"
            >
              {isPending ? 'Readmitting...' : 'Readmit'}
            </button>
          </div>
        </ServiceUserModal>
      )}
    </>
  );
};
// src/features/ServiceUsers/ui/CreateAdmissionModal.tsx

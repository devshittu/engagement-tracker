// @ts-nocheck
// TODO: Temporary suppression of TypeScript errors for demo purposes.
//       Re-enable type checking after resolving the issues.
// src/features/activities/components/CreateActivityModal.tsx

'use client';

import { useCallback, useState } from 'react';
import Modal from '@/components/Modal/Modal';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useActivityMutations } from '../hooks/useActivityMutations';
import { CreateActivityInput, Department } from '../types';

type CreateActivityModalProps = {
  show: boolean;
  onClose: () => void;
  departments: Department[];
};

export const CreateActivityModal: React.FC<CreateActivityModalProps> = ({
  show,
  onClose,
  departments,
}) => {
  const { user } = useAuth();
  const userRoleLevel = user?.roles?.level ?? 0;
  const userDepartmentId = user?.departmentId;

  const { createActivity, isCreating } = useActivityMutations();

  const [formData, setFormData] = useState<CreateActivityInput>({
    name: '',
    description: '',
    departmentId:
      userRoleLevel > 3 ? undefined : (userDepartmentId ?? undefined),
  });

  const handleChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]:
          name === 'departmentId'
            ? value === 'generic'
              ? undefined
              : parseInt(value)
            : value,
      }));
    },
    [],
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.name.trim()) {
        alert('Activity name is required.');
        return;
      }

      createActivity(formData, {
        onSuccess: () => {
          setFormData({
            name: '',
            description: '',
            departmentId:
              userRoleLevel > 3 ? undefined : (userDepartmentId ?? undefined),
          });
          onClose();
        },
        onError: (error: unknown) => {
          console.error('Failed to create activity:', error);
          alert('Failed to create activity. Please try again.');
        },
      });
    },
    [formData, createActivity, onClose, userRoleLevel, userDepartmentId],
  );

  return (
    <Modal show={show} handleClose={onClose} ariaLabel="Create Activity">
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">Create New Activity</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input input-bordered w-full"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="description"
              className="block text-sm font-medium mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description ?? ''}
              onChange={handleChange}
              className="textarea textarea-bordered w-full"
              rows={3}
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="departmentId"
              className="block text-sm font-medium mb-1"
            >
              Department
            </label>
            {userRoleLevel > 3 ? (
              <select
                id="departmentId"
                name="departmentId"
                value={formData.departmentId ?? 'generic'}
                onChange={handleChange}
                className="select select-bordered w-full"
              >
                <option value="generic">Generic (No Department)</option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={
                  formData.departmentId
                    ? (departments.find((d) => d.id === formData.departmentId)
                        ?.name ?? 'Unknown')
                    : 'Generic'
                }
                className="input input-bordered w-full"
                disabled
              />
            )}
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost"
              disabled={isCreating}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isCreating}
            >
              {isCreating ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

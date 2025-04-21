// @ts-nocheck
// TODO: Temporary suppression of TypeScript errors for demo purposes.
//       Re-enable type checking after resolving the issues.
// src/features/activities/components/EditActivityModal.tsx

'use client';

import { useCallback, useState, useEffect } from 'react';
import Modal from '@/components/Modal/Modal';
import { useActivityMutations } from '../hooks/useActivityMutations';
import { Activity, UpdateActivityInput, Department } from '../types';

type EditActivityModalProps = {
  show: boolean;
  onClose: () => void;
  activity: Activity | null;
  departments: Department[];
};

export const EditActivityModal: React.FC<EditActivityModalProps> = ({
  show,
  onClose,
  activity,
  departments,
}) => {
  const { updateActivity, isUpdating } = useActivityMutations();

  const [formData, setFormData] = useState<UpdateActivityInput>({
    name: '',
    description: '',
    departmentId: undefined,
  });

  useEffect(() => {
    if (activity) {
      setFormData({
        name: activity.name,
        description: activity.description ?? '',
        departmentId: activity.departmentId ?? undefined,
      });
    }
  }, [activity]);

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
      if (!activity) return;
      if (!formData.name.trim()) {
        alert('Activity name is required.');
        return;
      }

      updateActivity(
        { id: activity.id, input: formData },
        {
          onSuccess: () => {
            onClose();
          },
          onError: (error: unknown) => {
            console.error('Failed to update activity:', error);
            alert('Failed to update activity. Please try again.');
          },
        },
      );
    },
    [activity, formData, updateActivity, onClose],
  );

  if (!activity) return null;

  return (
    <Modal show={show} handleClose={onClose} ariaLabel="Edit Activity">
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">Edit Activity</h2>
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
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost"
              disabled={isUpdating}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isUpdating}
            >
              {isUpdating ? 'Updating...' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

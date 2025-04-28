// @ts-nocheck
// TODO: Temporary suppression of TypeScript errors for demo purposes.
//       Re-enable type checking after resolving the issues.
// src/features/Dashboard/components/CRUDModal.tsx
'use client';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { CRUDModalProps, DashboardEntity } from '../types';
import { Button } from '@/components/Buttons/Button';
import { toast } from 'react-toastify';

export const CRUDModal: React.FC<CRUDModalProps> = ({
  isOpen,
  onClose,
  entityType,
  action,
  data,
  extraData,
}) => {
  const [formData, setFormData] = useState<Partial<DashboardEntity>>(
    data || {},
  );
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (entityType !== 'User' && !formData.name) {
      newErrors.name = `${entityType} name is required`;
    }
    if (entityType === 'Role') {
      if (!(formData as any).level || (formData as any).level < 1) {
        newErrors.level = 'Role level must be at least 1';
      }
      if (!(formData as any).departmentId) {
        newErrors.departmentId = 'Department is required';
      }
    }
    if (entityType === 'User') {
      if (!(formData as any).email) {
        newErrors.email = 'Email is required';
      }
      if (!(formData as any).departmentId) {
        newErrors.departmentId = 'Department is required';
      }
      if (!(formData as any).roleId) {
        newErrors.roleId = 'Role is required';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'level' || name === 'departmentId' || name === 'roleId'
          ? parseInt(value) || 0
          : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = () => {
    if (action === 'delete' || validateForm()) {
      // Pass the form data to the parent component
      onClose(formData);
    } else {
      toast.error('Please fix the form errors');
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={() => onClose()}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-base-100 p-6 align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-bold">
                  {action === 'create'
                    ? `Create ${entityType}`
                    : action === 'update'
                      ? `Update ${entityType}`
                      : `Delete ${entityType}`}
                </Dialog.Title>
                {action !== 'delete' ? (
                  <div className="mt-4 space-y-4">
                    {entityType !== 'User' && (
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium"
                        >
                          Name
                        </label>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          value={(formData as any).name || ''}
                          onChange={handleChange}
                          className="input input-bordered w-full"
                          placeholder={`${entityType} Name`}
                        />
                        {errors.name && (
                          <p className="text-error text-sm mt-1">
                            {errors.name}
                          </p>
                        )}
                      </div>
                    )}
                    {entityType === 'Role' && (
                      <>
                        <div>
                          <label
                            htmlFor="level"
                            className="block text-sm font-medium"
                          >
                            Level
                          </label>
                          <input
                            id="level"
                            name="level"
                            type="number"
                            value={(formData as any).level || 1}
                            onChange={handleChange}
                            className="input input-bordered w-full"
                            placeholder="Role Level"
                          />
                          {errors.level && (
                            <p className="text-error text-sm mt-1">
                              {errors.level}
                            </p>
                          )}
                        </div>
                        <div>
                          <label
                            htmlFor="departmentId"
                            className="block text-sm font-medium"
                          >
                            Department
                          </label>
                          <select
                            id="departmentId"
                            name="departmentId"
                            value={(formData as any).departmentId || 0}
                            onChange={handleChange}
                            className="select select-bordered w-full"
                          >
                            <option value={0}>Select Department</option>
                            {extraData?.departments?.map((dept) => (
                              <option key={dept.id} value={dept.id}>
                                {dept.name}
                              </option>
                            ))}
                          </select>
                          {errors.departmentId && (
                            <p className="text-error text-sm mt-1">
                              {errors.departmentId}
                            </p>
                          )}
                        </div>
                      </>
                    )}
                    {entityType === 'User' && (
                      <>
                        <div>
                          <label
                            htmlFor="email"
                            className="block text-sm font-medium"
                          >
                            Email
                          </label>
                          <input
                            id="email"
                            name="email"
                            type="email"
                            value={(formData as any).email || ''}
                            onChange={handleChange}
                            className="input input-bordered w-full"
                            placeholder="User Email"
                          />
                          {errors.email && (
                            <p className="text-error text-sm mt-1">
                              {errors.email}
                            </p>
                          )}
                        </div>
                        <div>
                          <label
                            htmlFor="departmentId"
                            className="block text-sm font-medium"
                          >
                            Department
                          </label>
                          <select
                            id="departmentId"
                            name="departmentId"
                            value={(formData as any).departmentId || 0}
                            onChange={handleChange}
                            className="select select-bordered w-full"
                          >
                            <option value={0}>Select Department</option>
                            {extraData?.departments?.map((dept) => (
                              <option key={dept.id} value={dept.id}>
                                {dept.name}
                              </option>
                            ))}
                          </select>
                          {errors.departmentId && (
                            <p className="text-error text-sm mt-1">
                              {errors.departmentId}
                            </p>
                          )}
                        </div>
                        <div>
                          <label
                            htmlFor="roleId"
                            className="block text-sm font-medium"
                          >
                            Role
                          </label>
                          <select
                            id="roleId"
                            name="roleId"
                            value={(formData as any).roleId || 0}
                            onChange={handleChange}
                            className="select select-bordered w-full"
                          >
                            <option value={0}>Select Role</option>
                            {extraData?.roles?.map((role) => (
                              <option key={role.id} value={role.id}>
                                {role.name}
                              </option>
                            ))}
                          </select>
                          {errors.roleId && (
                            <p className="text-error text-sm mt-1">
                              {errors.roleId}
                            </p>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <p className="mt-4">
                    Are you sure you want to delete this {entityType}?
                  </p>
                )}
                <div className="mt-6 flex justify-end space-x-2">
                  <Button onClick={() => onClose()} className="btn btn-ghost">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    className={`btn ${
                      action === 'delete' ? 'btn-error' : 'btn-primary'
                    }`}
                  >
                    {action === 'create'
                      ? 'Create'
                      : action === 'update'
                        ? 'Update'
                        : 'Delete'}
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
// src/features/Dashboard/components/CRUDModal.tsx

// src/stores/modalStore.ts

import { create } from 'zustand';

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

type ModalState = {
  createAdmissionModal: {
    isOpen: boolean;
    formData: { nhsNumber: string; name: string; wardId: number | '' };
  };
  dischargeModal: {
    isOpen: boolean;
    selectedUser: ServiceUser | null;
  };
  editModal: {
    isOpen: boolean;
    selectedUser: ServiceUser | null;
    formData: { name: string; nhsNumber: string; wardId: number | '' };
    wardChangePrompt: { isOpen: boolean; newWardId: number | null };
  };
  setCreateAdmissionModal: (isOpen: boolean) => void;
  updateCreateAdmissionForm: (
    data: Partial<ModalState['createAdmissionModal']['formData']>,
  ) => void;
  resetCreateAdmissionForm: () => void;
  setDischargeModal: (
    isOpen: boolean,
    selectedUser?: ServiceUser | null,
  ) => void;
  setEditModal: (isOpen: boolean, selectedUser?: ServiceUser | null) => void;
  updateEditForm: (data: Partial<ModalState['editModal']['formData']>) => void;
  resetEditForm: () => void;
  setWardChangePrompt: (isOpen: boolean, newWardId?: number | null) => void;
};

export const useModalStore = create<ModalState>((set) => ({
  createAdmissionModal: {
    isOpen: false,
    formData: { nhsNumber: '', name: '', wardId: '' },
  },
  dischargeModal: {
    isOpen: false,
    selectedUser: null,
  },
  editModal: {
    isOpen: false,
    selectedUser: null,
    formData: { name: '', nhsNumber: '', wardId: '' },
    wardChangePrompt: { isOpen: false, newWardId: null },
  },
  setCreateAdmissionModal: (isOpen) =>
    set((state) => ({
      createAdmissionModal: { ...state.createAdmissionModal, isOpen },
    })),
  updateCreateAdmissionForm: (data) =>
    set((state) => ({
      createAdmissionModal: {
        ...state.createAdmissionModal,
        formData: { ...state.createAdmissionModal.formData, ...data },
      },
    })),
  resetCreateAdmissionForm: () =>
    set((state) => ({
      createAdmissionModal: {
        ...state.createAdmissionModal,
        formData: { nhsNumber: '', name: '', wardId: '' },
      },
    })),
  setDischargeModal: (isOpen, selectedUser = null) =>
    set(() => ({
      dischargeModal: { isOpen, selectedUser },
    })),
  setEditModal: (isOpen, selectedUser = null) =>
    set((state) => ({
      editModal: {
        ...state.editModal,
        isOpen,
        selectedUser,
        formData: selectedUser
          ? {
              name: selectedUser.name,
              nhsNumber: selectedUser.nhsNumber,
              wardId: selectedUser.admissions?.[0]?.ward.id || '',
            }
          : { name: '', nhsNumber: '', wardId: '' },
      },
    })),
  updateEditForm: (data) =>
    set((state) => ({
      editModal: {
        ...state.editModal,
        formData: { ...state.editModal.formData, ...data },
      },
    })),
  resetEditForm: () =>
    set((state) => ({
      editModal: {
        ...state.editModal,
        formData: { name: '', nhsNumber: '', wardId: '' },
        wardChangePrompt: { isOpen: false, newWardId: null },
      },
    })),
  setWardChangePrompt: (isOpen, newWardId = null) =>
    set((state) => ({
      editModal: {
        ...state.editModal,
        wardChangePrompt: { isOpen, newWardId },
      },
    })),
}));
// src/stores/modalStore.ts

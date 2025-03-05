// src/store/useLoaderStore.ts
import { create } from 'zustand';

type LoaderState = {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
};

export const useLoaderStore = create<LoaderState>((set) => ({
  isLoading: false,
  startLoading: () => set({ isLoading: true }),
  stopLoading: () => set({ isLoading: false }),
}));
// src/stores/ui/hooks/useLoaderStore.ts
//TODO: switch to app-loader with the latest api version of the zustand library and correct at:
//TODO:  RouteChangeHandler and AppWideLoader

// Path: src/stores/ui/hooks/useLoaderStore.ts

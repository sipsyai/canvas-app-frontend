/**
 * Mode Store
 *
 * Manages the application mode switching between:
 * - Development: Builder tools (fields, objects, applications management)
 * - Applications: Published apps usage
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AppMode = 'development' | 'applications';

interface ModeState {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
}

export const useModeStore = create<ModeState>()(
  persist(
    (set) => ({
      mode: 'development',
      setMode: (mode) => set({ mode }),
    }),
    {
      name: 'app-mode',
    }
  )
);

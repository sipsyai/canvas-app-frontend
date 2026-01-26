import { create } from 'zustand';

interface NavigationState {
  sidebarOpen: boolean;
  currentPath: string;
  breadcrumbs: Array<{ label: string; href?: string }>;

  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setCurrentPath: (path: string) => void;
  setBreadcrumbs: (items: Array<{ label: string; href?: string }>) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  sidebarOpen: false,
  currentPath: '/dashboard',
  breadcrumbs: [{ label: 'Dashboard' }],

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setCurrentPath: (path) => set({ currentPath: path }),
  setBreadcrumbs: (items) => set({ breadcrumbs: items }),
}));

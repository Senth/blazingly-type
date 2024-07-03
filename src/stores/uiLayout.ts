import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UILayoutStore {
  isLessonMenuOpen: boolean;
  setLessonMenuOpen: (isOpen: boolean) => void;
  isLoginModalOpen: boolean;
  setLoginModalOpen: (isOpen: boolean) => void;
}

const useUILayoutStore = create<UILayoutStore>()(
  persist(
    (set) => ({
      isLessonMenuOpen: false,
      setLessonMenuOpen: (isOpen: boolean) => set({ isLessonMenuOpen: isOpen }),
      isLoginModalOpen: false,
      setLoginModalOpen: (isOpen: boolean) => set({ isLoginModalOpen: isOpen }),
    }),
    {
      name: "ui-layout",
    },
  ),
);

export default useUILayoutStore;

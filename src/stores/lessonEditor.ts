import { persist } from "zustand/middleware";
import { create } from "zustand";

interface LessonEditorStore {
  isEditorOpen: boolean;
  lessonId: string;
  newLesson: () => void;
  editLesson(lessonId: string): void;
  cancel(): void;
}

const useLessonEditorStore = create<LessonEditorStore>()(
  persist(
    (set, get) => ({
      isEditorOpen: false,
      lessonId: "",
      newLesson: () => set({ lessonId: "", isEditorOpen: true }),
      editLesson: (lessonId: string) => set({ lessonId, isEditorOpen: true }),
      cancel: () => set({ isEditorOpen: false }),
    }),
    {
      name: "lesson-editor",
    },
  ),
);

export default useLessonEditorStore;

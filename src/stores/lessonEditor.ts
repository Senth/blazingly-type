import { persist } from "zustand/middleware";
import { create } from "zustand";
import { Lesson } from "@models/lesson";

interface LessonEditorStore {
  isEditorOpen: boolean;
  lesson: Lesson;
  newLesson: () => void;
  editLesson(lesson: Lesson): void;
  setLesson(lesson: Lesson): void;
  close(): void;
  copy(): void;
}

const useLessonEditorStore = create<LessonEditorStore>()(
  persist(
    (set, get) => ({
      isEditorOpen: false,
      lesson: Lesson.New(),
      newLesson: () => set({ lesson: Lesson.New(), isEditorOpen: true }),
      editLesson: (lesson: Lesson) => set({ lesson, isEditorOpen: true }),
      setLesson: (lesson: Lesson) => set({ lesson }),
      close: () => set({ isEditorOpen: false }),
      copy: () =>
        set({
          lesson: { ...get().lesson, id: "", custom: true },
          isEditorOpen: true,
        }),
    }),
    {
      name: "lesson-editor",
    },
  ),
);

export default useLessonEditorStore;

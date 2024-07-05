import { persist } from "zustand/middleware";
import { create } from "zustand";
import { Lesson } from "@models/lesson";

interface LessonEditorStore {
  isEditorOpen: boolean;
  isAdvancedOpen: boolean;
  setAdvancedOpen: (open: boolean) => void;
  lesson: Lesson;
  newLesson: () => void;
  editLesson(lesson: Lesson): void;
  setLesson(lesson: Lesson): void;
  setDelimiter(enabled: boolean, value?: string): void;
  setKeepSpace(enabled: boolean): void;
  close(): void;
  copy(): void;
}

const useLessonEditorStore = create<LessonEditorStore>()(
  persist(
    (set, get) => ({
      isEditorOpen: false,
      isAdvancedOpen: false,
      setAdvancedOpen: (open) => set({ isAdvancedOpen: open }),
      lesson: Lesson.New(),
      newLesson: () => set({ lesson: Lesson.New(), isEditorOpen: true }),
      editLesson: (lesson: Lesson) => set({ lesson, isEditorOpen: true }),
      setLesson: (lesson: Lesson) => set({ lesson }),
      setDelimiter: (enabled, value) => {
        const { lesson } = get();
        if (!lesson.settings) {
          lesson.settings = {};
        }
        lesson.settings.delimiter = { enabled, value };
        set({ lesson });
      },
      setKeepSpace: (enabled) => {
        const { lesson } = get();
        if (!lesson.settings) {
          lesson.settings = {};
        }
        lesson.settings.keepSpaces = enabled;
        set({ lesson });
      },
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

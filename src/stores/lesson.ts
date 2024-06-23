import { defaultLessons, Lesson } from "@models/lesson";
import { create } from "zustand";

interface LessonStore {
  lessons: Lesson[];
  setLessons: (lessons: Lesson[]) => void;
}

const useLessonStore = create<LessonStore>((set) => ({
  lessons: defaultLessons,
  setLessons: (lessons: Lesson[]) => set({ lessons }),
}));

export default useLessonStore;

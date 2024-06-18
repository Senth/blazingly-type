import { defaultLessons, Lesson } from "@models/lesson";
import { create } from "zustand";

interface LessonStore {
  lessons: Lesson[];
  setLessons: (lessons: Lesson[]) => void;
  selectedLesson: Lesson;
  setSelectedLesson: (lesson: Lesson) => void;

}

const useLessonStore = create<LessonStore>((set) => ({
  lessons: defaultLessons,
  setLessons: (lessons: Lesson[]) => set({ lessons }),
  selectedLesson: defaultLessons[0],
  setSelectedLesson: (lesson: Lesson) => set({ selectedLesson: lesson }),
}));

export default useLessonStore;

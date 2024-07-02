import { defaultLessons, Lesson } from "@models/lesson";
import useUserProfileStore from "@stores/userProfile";
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  query,
  setDoc,
} from "firebase/firestore";
import useSWR from "swr";

const firestore = getFirestore();

export async function fetchLessons(uid?: string): Promise<Lesson[]> {
  if (!uid) {
    return defaultLessons;
  }

  const lessonsRef = collection(firestore, "users", uid, "lessons");
  const q = query(lessonsRef);
  return getDocs(q).then((querySnapshot) => {
    const lessons = querySnapshot.docs.map((doc) => ({
      ...(doc.data() as Lesson),
      id: doc.id,
    }));
    return lessons;
  });
}

export async function upsertLesson(
  uid: string,
  lesson: Lesson,
): Promise<Lesson> {
  const lessonsRef = collection(firestore, "users", uid, "lessons");
  const docRef = lesson.id ? doc(lessonsRef, lesson.id) : doc(lessonsRef);

  // Update
  if (lesson.id) {
    delete lesson.id;
    return setDoc(docRef, lesson).then(() => {
      return lesson;
    });
  }

  // Create
  const newLesson = { ...lesson, custom: true };

  return setDoc(docRef, newLesson).then(() => {
    return { ...newLesson, id: docRef.id };
  });
}

export function useLessons() {
  const { user } = useUserProfileStore();
  const uid = user?.uid;

  return useSWR(uid, fetchLessons);
}

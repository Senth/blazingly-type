import { getUserId } from "@auth"
import "@auth"
import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore"
import { User } from "@models/user"
import { Exercises } from "@models/exercise"

export async function saveExercises(exercises: Exercises): Promise<void> {
  const userId = getUserId()
  if (!userId) {
    return
  }

  const docRef = doc(getFirestore(), "users", userId)
  const docSnap = await getDoc(docRef)

  if (!docSnap.exists()) {
    return
  }

  const updatedData: User = {
    ...(docSnap.data() as User),
    exercisesJSON: JSON.stringify(exercises),
  }
  await setDoc(docRef, updatedData)
}

export async function fetchExercises(): Promise<Exercises | null> {
  const userId = getUserId()
  if (!userId) {
    return null
  }

  const docRef = doc(getFirestore(), "users", userId)
  const docSnap = await getDoc(docRef)

  if (!docSnap.exists()) {
    return null
  }

  const user = docSnap.data() as User

  if (!user.exercisesJSON) {
    return null
  }

  return JSON.parse(user.exercisesJSON)
}

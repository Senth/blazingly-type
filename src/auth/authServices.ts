import { auth } from "./firebaseInit";
import { doc, setDoc, getFirestore } from "firebase/firestore";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { userProfileActions } from "@stores/userProfile";

const provider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  return signInWithPopup(auth, provider);
}

export async function signInWithEmail(email: string, password: string) {
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in
    })
    .catch((error) => {
      // Handle Errors here.
      console.error(error);
    });
}

export async function logout() {
  signOut(auth);
}

// Create a new user document the first time they sign in
auth.onAuthStateChanged(async (user) => {
  const { setUser } = userProfileActions;
  setUser(user);

  if (!user) {
    localStorage.removeItem("user");
    return;
  }
  localStorage.setItem("user", JSON.stringify(user));

  const userRef = doc(getFirestore(), "users", user.uid);

  // First time logging in, create the user document
  await setDoc(userRef, {
    uid: user.uid,
  });
});

export function getUserId(): string | undefined {
  const user = localStorage.getItem("user");
  if (!user) {
    return undefined;
  }

  return JSON.parse(user).uid;
}

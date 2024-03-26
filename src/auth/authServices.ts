import { auth } from "./firebaseInit";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
} from "firebase/auth";

const provider = new GoogleAuthProvider();

export function signInWithGoogle() {
  signInWithPopup(auth, provider)
    .then((result) => {
      // Google sign-in was successful.
      console.log(result.user);
    })
    .catch((error) => {
      // Handle errors here.
      console.error(error);
    });
}

export function signInWithEmail(email: string, password: string) {
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in
      console.log(userCredential.user);
    })
    .catch((error) => {
      // Handle Errors here.
      console.error(error);
    });
}

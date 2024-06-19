import { auth } from "./firebaseInit";
import { doc, getDoc, setDoc, getFirestore } from "firebase/firestore";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { userProfileActions } from "@stores/userProfile";

const provider = new GoogleAuthProvider();

export interface AuthSignIn {
  signIn: () => boolean;
}

export function useSignInWithGoogle(): AuthSignIn {
  const navigate = useNavigate();

  const signIn = () => {
    signInWithPopup(auth, provider)
      .then(() => {
        navigate("/");
        return true;
      })
      .catch((error) => {
        // Handle errors here.
        console.error(error);
        return false;
      });

    return true;
  };
  return { signIn };
}

export async function signInWithEmail(email: string, password: string) {
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
  const userDoc = await getDoc(userRef);

  // TODO update the exercise data
  if (userDoc.exists()) {
    return;
  }

  await setDoc(userRef, {
    uid: user.uid,
  });
});

import { auth } from "./firebaseInit";
import { doc, getDoc, setDoc, getFirestore } from "firebase/firestore";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  User,
} from "firebase/auth";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const provider = new GoogleAuthProvider();

export interface AuthSignIn {
  signIn: () => boolean;
}

export function useSignInWithGoogle(): AuthSignIn {
  const navigate = useNavigate();

  const signIn = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        localStorage.setItem("user", JSON.stringify(result.user));
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

export function useAuthState() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);

      // Save or clear the user data in the local storage
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        localStorage.removeItem("user");
      }
    });

    return unsubscribe;
  }, []);

  return { user, loading };
}

// Create a new user document the first time they sign in
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    return;
  }

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

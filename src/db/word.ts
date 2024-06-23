import { Word } from "@models/word";
import useUserProfileStore from "@stores/userProfile";
import { doc, getDoc, setDoc, getFirestore } from "firebase/firestore";
import useSWR from "swr";
import "@auth";

const firestore = getFirestore();

interface WordRequest {
  uid?: string;
  words: string[];
}

export async function fetchWord(request: WordRequest): Promise<Word[]> {
  if (!request.uid) {
    return [];
  }

  const words: Word[] = [];
  for (const wordStr of request.words) {
    const docRef = doc(
      firestore,
      "users",
      request.uid,
      "words",
      Word.hash(wordStr),
    );
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const word = docSnap.data() as Word;
      words.push(word);
    } else {
      words.push(Word.New(wordStr));
    }
  }

  return words;
}

export async function saveWord(uid: string, word: Word): Promise<void> {
  const docRef = doc(firestore, "users", uid, "words", Word.hash(word.word));
  return setDoc(docRef, word);
}

export function useWords(words: string[]) {
  const { user } = useUserProfileStore();
  const uid = user?.uid;

  const wordRequest: WordRequest = { uid, words };
  const swrResponse = useSWR(wordRequest, fetchWord);

  function mutateWords(words: Word[]) {
    swrResponse.mutate(words);
    words.forEach((word) => {
      if (uid) {
        saveWord(uid, word);
      }
    });
  }

  return {
    ...swrResponse,
    mutate: mutateWords,
  };
}

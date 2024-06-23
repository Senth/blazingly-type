import { Word } from "@models/word";
import useUserProfileStore from "@stores/userProfile";
import { doc, getDoc, setDoc, getFirestore } from "firebase/firestore";
import useSWR from "swr";
import "@auth";
import { getUserId } from "@auth";

const firestore = getFirestore();

interface WordRequest {
  uid?: string;
  words: string[];
}

export async function fetchWord(request: WordRequest): Promise<Word[]> {
  if (!request.uid) {
    return [];
  }

  const words: Word[] = new Array<Word>(request.words.length).fill(
    Word.New(""),
  );
  const allPromises: Promise<void>[] = [];

  for (let i = 0; i < request.words.length; i++) {
    const wordStr = request.words[i];
    const docRef = doc(
      firestore,
      "users",
      request.uid,
      "words",
      Word.hash(wordStr),
    );
    allPromises.push(
      getDoc(docRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            const word = docSnap.data() as any;
            // Convert firebase timestamps to Date objects
            words[i] = {
              ...word,
              highestWpmDatetime: word.highestWpmDatetime.toDate(),
              lastPracticeDatetime: word.lastPracticeDatetime.toDate(),
            } as Word;
          } else {
            words[i] = Word.New(wordStr);
          }
        })
        .catch((error) => {
          console.error("Error getting document:", error);
          words[i] = Word.New(wordStr);
        }),
    );
  }

  await Promise.all(allPromises);
  return words;
}

export async function saveWord(uid: string, word: Word): Promise<void> {
  const docRef = doc(firestore, "users", uid, "words", Word.hash(word.word));
  return setDoc(docRef, word);
}

export async function getWords(words: string[]): Promise<Word[]> {
  const uid = getUserId();
  if (!uid) {
    return [];
  }

  const wordRequest: WordRequest = { uid, words };
  return fetchWord(wordRequest);
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

import { Word } from "@models/word";
import useUserProfileStore from "@stores/userProfile";
import {
  doc,
  getDoc,
  setDoc,
  getFirestore,
  getDocs,
  collection,
  deleteDoc,
} from "firebase/firestore";
import useSWR from "swr";
import "@auth";
import { getUserId } from "@auth";

const firestore = getFirestore();

interface WordRequest {
  uid?: string;
  words: string[] | undefined;
}

export async function fetchWords(request: WordRequest): Promise<Word[]> {
  if (!request.uid) {
    return [];
  }

  if (request.words) {
    return fetchSpecificWords(request.uid, request.words);
  } else {
    return fetchAllWords(request.uid);
  }
}

async function fetchSpecificWords(
  uid: string,
  requestedWords: string[],
): Promise<Word[]> {
  const words: Word[] = new Array<Word>(requestedWords.length).fill(
    Word.New(""),
  );
  const allPromises: Promise<void>[] = [];

  for (let i = 0; i < requestedWords.length; i++) {
    const wordStr = requestedWords[i];
    const docRef = doc(firestore, "users", uid, "words", Word.hash(wordStr));
    allPromises.push(
      getDoc(docRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            const word = docSnap.data() as any;
            words[i] = mapFSWordToWord(word);
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

async function fetchAllWords(uid: string): Promise<Word[]> {
  const collectionRef = collection(firestore, "users", uid, "words");
  const docSnap = await getDocs(collectionRef);
  if (docSnap.empty) {
    return [];
  }

  const words: Word[] = [];
  docSnap.forEach((doc: any) => {
    const word = doc.data() as any;
    words.push(mapFSWordToWord(word));
  });

  return words;
}

function mapFSWordToWord(word: any): Word {
  return {
    ...word,
    highestWpmDatetime: word.highestWpmDatetime.toDate(),
    lastPracticeDatetime: word.lastPracticeDatetime.toDate(),
  } as Word;
}

export async function saveWordFS(uid: string, word: Word): Promise<void> {
  const docRef = doc(firestore, "users", uid, "words", Word.hash(word.word));
  return setDoc(docRef, word);
}

async function deleteWordFS(uid: string, word: Word): Promise<void> {
  const docRef = doc(firestore, "users", uid, "words", Word.hash(word.word));
  return deleteDoc(docRef);
}

export async function getWords(words: string[]): Promise<Word[]> {
  const uid = getUserId();
  if (!uid) {
    return [];
  }

  const wordRequest: WordRequest = { uid, words };
  return fetchWords(wordRequest);
}

// Fetch words from the database with the ability to save the changes back to the database.
// If no words are provided, it will fetch all the words for the user.
export function useWords(words: string[] | undefined) {
  const { user } = useUserProfileStore();
  const uid = user?.uid;

  const wordRequest: WordRequest = { uid, words };
  const swrResponse = useSWR(wordRequest, fetchWords);

  function deleteWord(word: Word) {
    const words = swrResponse.data;
    if (!words || !uid) {
      return;
    }

    deleteWordFS(uid, word)
      .then(() => {
        swrResponse.mutate(words.filter((w) => w.word !== word.word));
      })
      .catch((error) => {
        console.error("Error deleting word:", error);
      });
  }

  function mutateWords(words: Word[]) {
    swrResponse.mutate(words);
    words.forEach((word) => {
      if (uid) {
        saveWordFS(uid, word).catch((error) => {
          console.error("Error saving word:", error);
        });
      } else {
        console.error("User not logged in. Word not saved.");
      }
    });
  }

  return {
    ...swrResponse,
    mutate: mutateWords,
    delete: deleteWord,
  };
}

import TopBar from "@components/TopBar";
import { useWords } from "@db/word";

export default function Words(): JSX.Element {
  return (
    <div className="h-full w-full flex flex-col">
      <TopBar />
      <div className="h-full w-full flex p-5">
        <WordsTable />
      </div>
    </div>
  );
}

function WordsTable(): JSX.Element {
  const wordsResponse = useWords(undefined);

  if (wordsResponse.error) {
    return <div>Error: {wordsResponse.error.message}</div>;
  }
  if (wordsResponse.isLoading) {
    return <div>Loading...</div>;
  }

  const words = wordsResponse.data;
  if (!words) {
    return <div>No words found.</div>;
  }

  words.sort((a, b) => a.word.localeCompare(b.word));

  return (
    <table className="w-full">
      <thead>
        <tr>
          <th>Word</th>
          <th>Highest WPM</th>
          <th>Last Practice WPM</th>
        </tr>
      </thead>
      <tbody>
        {words.map((word) => (
          <tr key={word.word}>
            <td>{word.word}</td>
            <td>{word.highestWpm}</td>
            <td>{word.lastPracticeWpm}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

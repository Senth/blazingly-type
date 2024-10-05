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
        <tr className="text-lg">
          <th className="text-left font-bold px-2">Word</th>
          <th colSpan={2} className="font-bold px-2">
            Highest WPM
          </th>
          <th colSpan={2} className="font-bold px-2">
            Last Practice WPM
          </th>
          <th className="font-bold px-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {words.map((word) => (
          <tr className="hover:bg-slate-700" key={word.word}>
            <td className="px-2">{word.word}</td>
            <td className="text-right px-2 w-24">
              {word.highestWpm.toFixed(1)}
            </td>
            <td className="px-2 text-gray-400 w-32">
              {formattedDate(word.highestWpmDatetime)}
            </td>
            <td className="text-right px-2 w-24">
              {word.lastPracticeWpm.toFixed(1)}
            </td>
            <td className="px-2 text-gray-400 w-32">
              {formattedDate(word.lastPracticeDatetime)}
            </td>
            <td className="px-2 text-center w-10">
              <button
                className="hover:text-red-400"
                onClick={() => {
                  wordsResponse.delete(word);
                }}
              >
                <span className="material">delete</span>
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function formattedDate(date: Date): string {
  const locale = navigator.language || "en-US";
  const formatted = date.toLocaleDateString(locale, {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
  return formatted;
}

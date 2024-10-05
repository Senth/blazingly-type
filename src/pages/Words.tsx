import TopBar from "@components/TopBar";
import { useWords } from "@db/word";

export default function Words(): JSX.Element {
  return (
    <div className="h-screen flex flex-col">
      <TopBar title="Words" backButton />
      <div className="flex-grow overflow-y-auto w-full flex flex-col">
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
    <div className="table-container grow overflow-y-auto ">
      <table className="w-full table-fixed">
        <colgroup>
          <col className="" />
          <col className="w-16" />
          <col className="w-32" />
          <col className="w-16" />
          <col className="w-32" />
          <col className="w-22" />
        </colgroup>
        <thead className="top-0 sticky bg-blue-950 drop-shadow-lg text-lg">
          <tr>
            <th className="p-3 pl-10 text-left font-bold px-2">Word</th>
            <th colSpan={2} className="font-bold px-2">
              Highest WPM
            </th>
            <th colSpan={2} className="font-bold px-2">
              Last Practice WPM
            </th>
            <th className="font-bold pl-2 pr-10">Actions</th>
          </tr>
        </thead>
        <tbody>
          {words.map((word) => (
            <tr className="hover:bg-slate-700" key={word.word}>
              <td className="pl-10 pr-2">{word.word}</td>
              <td className="text-right px-2">{word.highestWpm.toFixed(1)}</td>
              <td className="px-2 text-gray-400">
                {formattedDate(word.highestWpmDatetime)}
              </td>
              <td className="text-right px-2">
                {word.lastPracticeWpm.toFixed(1)}
              </td>
              <td className="px-2 text-gray-400">
                {formattedDate(word.lastPracticeDatetime)}
              </td>
              <td className="pl-2 pr-10 text-center">
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
    </div>
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

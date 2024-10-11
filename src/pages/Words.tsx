import TopBar from "@components/TopBar";
import { useWords } from "@db/word";
import { useState } from "react";

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

enum Columns {
  Word,
  HighestWpm,
  HighestWpmDatetime,
  LastPracticeWpm,
  LastPracticeWpmDatetime,
}

enum Order {
  ASC,
  DESC,
}

function WordsTable(): JSX.Element {
  const wordsResponse = useWords(undefined);
  const [order, setOrder] = useState<Order>(Order.ASC);
  const [sortBy, setSortBy] = useState<Columns>(Columns.Word);

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

  words.sort((a, b) => {
    let result = 0;
    switch (sortBy) {
      case Columns.Word:
        result = a.word.localeCompare(b.word);
        break;
      case Columns.HighestWpm:
        result = a.highest.wpm - b.highest.wpm;
        break;
      case Columns.HighestWpmDatetime:
        result = a.highest.date.getTime() - b.highest.date.getTime();
        break;
      case Columns.LastPracticeWpm:
        result = a.lastPractice.wpm - b.lastPractice.wpm;
        break;
      case Columns.LastPracticeWpmDatetime:
        result = a.lastPractice.date.getTime() - b.lastPractice.date.getTime();
        break;
    }
    if (order === Order.DESC) {
      result = 0 - result;
    }
    return result;
  });

  function setSort(column: Columns): void {
    // Switch ASC/DESC
    if (sortBy === column) {
      switch (order) {
        case Order.ASC:
          setOrder(Order.DESC);
          return;
        case Order.DESC:
          setOrder(Order.ASC);
          return;
      }
    }

    setSortBy(column);
    setOrder(Order.ASC);
  }

  return (
    <div className="table-container grow overflow-y-auto ">
      <table className="w-full table-fixed">
        <thead className="top-0 sticky bg-blue-950 drop-shadow-lg text-lg">
          <tr>
            <th
              className="p-3 pl-10 text-left font-bold px-2 cursor-pointer"
              onClick={() => setSort(Columns.Word)}
            >
              Word
            </th>
            <th
              className="font-bold px-2 text-right cursor-pointer"
              onClick={() => setSort(Columns.HighestWpm)}
            >
              Record
            </th>
            <th
              className="font-bold px-2 text-left cursor-pointer"
              onClick={() => setSort(Columns.HighestWpmDatetime)}
            >
              Date
            </th>
            <th
              className="font-bold px-2 text-right cursor-pointer"
              onClick={() => setSort(Columns.LastPracticeWpm)}
            >
              Last Practice
            </th>
            <th
              className="font-bold px-2 text-left cursor-pointer"
              onClick={() => setSort(Columns.LastPracticeWpmDatetime)}
            >
              Date
            </th>
            <th className="font-bold pl-2 pr-10">Actions</th>
          </tr>
        </thead>
        <tbody>
          {words.map((word) => (
            <tr className="hover:bg-slate-700" key={word.word}>
              <td className="pl-10 pr-2">{word.word}</td>
              <td className="text-right px-2">{word.highest.wpm.toFixed(1)}</td>
              <td className="px-2 text-gray-400">
                {formattedDate(word.highest.date)}
              </td>
              <td className="text-right px-2">
                {word.lastPractice.wpm.toFixed(1)}
              </td>
              <td className="px-2 text-gray-400">
                {formattedDate(word.lastPractice.date)}
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

import Radio from "@components/basic/radio";
import { useWords } from "@db/word";
import { Scopes } from "@models/exercise";
import { Word } from "@models/word";
import useExerciseStore, { PreviousWord } from "@stores/exercise";
import useWpmCounterStore from "@stores/wpmCounter";
import useSettingsStore from "@stores/settings";
import React, { useEffect } from "react";
import { LessonMenu, LessonMenuClosed } from "@components/LessonMenu";
import TopBar from "@components/TopBar";

export default function TypingPracticePage(): JSX.Element {
  return (
    <div className="h-full w-full flex flex-col">
      <TopBar menu={<LessonMenuClosed />} />
      <div className="h-full w-full flex">
        <LessonMenu />
        <div className="grow"></div>
        <div className="h-full min-w-[400px] max-w-[968px] flex flex-col flex-grow p-5">
          <Selectors />
          <ExerciseWrapper />
          <WPMDisplay />
        </div>
        <div className="grow"></div>
      </div>
    </div>
  );
}

function Selectors(): JSX.Element {
  return (
    <div className="m-auto w-fit flex gap-20">
      <ScopeSelector />
      <GenerationSelector />
    </div>
  );
}

function ScopeSelector(): JSX.Element {
  const { scope, setScope } = useExerciseStore();

  return (
    <div>
      <h2 className="text-2xl mb-4">Scope</h2>
      <div className="flex flex-col">
        {Object.values(Scopes).map((scopeValue) => (
          <Radio
            key={scopeValue}
            name="scope"
            label={scopeValue}
            checked={scope === scopeValue}
            onChecked={() => setScope(scopeValue as Scopes)}
          />
        ))}
      </div>
    </div>
  );
}

function GenerationSelector(): JSX.Element {
  const { generation, setGeneration } = useExerciseStore();

  function handleCombinationChange(event: React.ChangeEvent<HTMLInputElement>) {
    // Validate input to a number
    const value = parseInt(event.target.value);
    if (isNaN(value)) {
      return;
    }

    setGeneration({ ...generation, combinations: value });
  }

  function handleRepetitionChange(event: React.ChangeEvent<HTMLInputElement>) {
    // Validate input to a number
    const value = parseInt(event.target.value);
    if (isNaN(value)) {
      return;
    }

    setGeneration({ ...generation, repetitions: value });
  }

  return (
    <div>
      <h2 className="text-2xl mb-4">Generation</h2>
      <div className="flex flex-col">
        <label>Combination</label>
        <input
          className="w-24 text-black px-1 py-0.5"
          type="number"
          value={generation.combinations}
          onChange={(e) => handleCombinationChange(e)}
        />
        <label className="mt-2">Repetition</label>
        <input
          className="w-24 text-black px-1 py-0.5"
          type="number"
          value={generation.repetitions}
          onChange={(e) => handleRepetitionChange(e)}
        />
      </div>
    </div>
  );
}

function ExerciseWrapper(): JSX.Element {
  return (
    <div className="mt-16 w-full m-auto">
      <ExerciseProgress />
      <ExerciseWords />
      <TypingField />
    </div>
  );
}

function ExerciseProgress(): JSX.Element {
  const [currentExerciseIndex, completed] = useExerciseStore((state) => [
    state.currentExerciseIndex,
    state.completed,
  ]);
  const allExercises = useExerciseStore((state) => state.allExercises);
  const progress = `${currentExerciseIndex + 1}/${allExercises.length}`;

  let className = "text-center text-2xl";
  if (completed) {
    className += " text-green-500";
  }

  return (
    <div className={className}>
      Exercise {progress} {completed && "(completed)"}
    </div>
  );
}

function ExerciseWords(): JSX.Element {
  let currentWords = useExerciseStore((state) => state.getCurrentWords());
  if (!currentWords) {
    currentWords = ["Select a lesson"];
  }

  return (
    <div className="mt-10 bg-sky-800 p-3 text-4xl text-center">
      {currentWords.join(" ")}
    </div>
  );
}

function TypingField(): JSX.Element {
  const [input, setInput] = React.useState<string>("");
  const [hadError, setHadError] = React.useState<boolean>(false);
  const {
    getCurrentWords,
    nextExercise,
    setPreviousExercise,
    startTime,
    startTimer,
    elapsedTime,
  } = useExerciseStore();
  const wpmCounter = useWpmCounterStore();
  const currentWords = getCurrentWords() || [];
  const wordsResponse = useWords(currentWords);
  const correctInput = currentWords.join(" ");
  const timeout = useSettingsStore((state) => state.settings.exercises.timeout);

  if (timeout < elapsedTime) {
    nextExercise(true);
    setInput("");
    setHadError(false);
  }

  useEffect(() => {
    if (wpmCounter.exercise !== correctInput) {
      wpmCounter.setExercise(correctInput);
    }
  }, [correctInput, wpmCounter]);

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape" || event.key === "Tab") {
      setHadError(false);
      setInput("");
      event.preventDefault();
    }
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    wpmCounter.updateCharTime(value.length - 1);

    if (!startTime) {
      startTimer();
    }

    // Sometimes we want to ignore space if it's the first character and it's not part of the "word"
    if (value.length === 1 && value === " " && correctInput[0] !== " ") {
      return;
    }

    if (value === correctInput) {
      setInput("");

      if (hadError) {
        setHadError(false);
        return;
      }

      if (wordsResponse?.data?.length !== currentWords.length) {
        return;
      }

      // Check if the target WPM for each word was met
      const wordWpms: number[] = [];
      for (let i = 0; i < currentWords.length; i++) {
        const word = currentWords[i];
        const wpm = wpmCounter.getWordWpm(word);

        const targetWpm = wordsResponse.data[i].lastPracticeWpm;
        if (targetWpm >= wpm) {
          return;
        }

        wordWpms.push(wpm);
      }

      // Save the previous exercise
      const previousExercise: PreviousWord[] = [];

      // Update and save the words to DB
      const words = wordsResponse.data;
      for (let i = 0; i < currentWords.length; i++) {
        previousExercise.push({
          word: currentWords[i],
          wpm: wordWpms[i].toFixed(1),
          targetWpm: words[i].lastPracticeWpm.toFixed(1),
        });
        words[i] = Word.updateWpm(words[i], wordWpms[i]);
      }

      nextExercise();
      setPreviousExercise(previousExercise);
      wordsResponse.mutate(words);
    } else {
      if (value.length === 0) {
        setHadError(false);
      }
      setInput(value);
    }
  }

  const isWrong = correctInput.substring(0, input.length) !== input;
  if (isWrong && !hadError) {
    setHadError(true);
  }

  return (
    <div className="mt-10">
      <input
        className={`p-3 h-16 w-full placeholder:bottom-2 placeholder:relative placeholder:text-lg text-center text-4xl text-black rounded-lg ${isWrong && "bg-red-200"}`}
        type="text"
        autoCorrect="off"
        autoCapitalize="none"
        placeholder="Re-type if failed, press <TAB> or <ESC> to reset"
        spellCheck="false"
        value={input}
        onKeyDown={handleKeyDown}
        onChange={handleChange}
      />
    </div>
  );
}

function WPMDisplay(): JSX.Element {
  const wpmCounter = useWpmCounterStore();
  const { getUniqueWords, previousExercise, elapsedTime } = useExerciseStore();
  const uniqueWords = getUniqueWords();
  const wordsResponse = useWords(uniqueWords);

  return (
    <>
      <table className="text-2xl text-left mt-16 w-full m-auto table-fixed">
        <thead>
          <tr className="text-3xl font-normal">
            <th className="text-gray-400 pb-4" colSpan={3}>
              Previous
            </th>
            <th className="pb-4" colSpan={2}>
              Current
            </th>
            <th className="text-gray-400 pb-4 text-2xl">{elapsedTime}</th>
          </tr>
          <tr className="border-b border-slate-500">
            <th className="w-1/6 text-gray-400 text-lg">Word</th>
            <th className="w-1/6 text-gray-400 text-lg">WPM </th>
            <th className="w-1/6 text-gray-400 text-lg">Target</th>
            <th className="w-1/6 text-lg">Word</th>
            <th className="w-1/6 text-lg">WPM </th>
            <th className="w-1/6 text-lg">Target</th>
          </tr>
        </thead>
        <tbody>
          {uniqueWords.map((word, index) => {
            let targetWpm: string = "0";
            if (
              !wordsResponse?.isLoading &&
              wordsResponse?.data?.length === uniqueWords.length
            ) {
              targetWpm = wordsResponse.data[index].lastPracticeWpm.toFixed(1);
            }

            // Calculate color based on how far from the target WPM the user is
            // 0 WPM = white
            // Above target = green
            // 0-20 WPM below target = gradient from yellow to red
            // Below 20 WPM = red
            let classColor = "";
            let styleColor = "";
            const wpm = wpmCounter.getWordWpm(word);
            if (wpm === 0) {
              classColor = "text-white";
            } else if (wpm >= parseFloat(targetWpm)) {
              classColor = "text-green-500";
            } else {
              const diff = parseFloat(targetWpm) - wpm;
              if (diff <= 30) {
                const red = 255;
                const green = (255 - (diff / 30) * 255).toFixed(0);
                styleColor = `rgb(${red},${green},0)`;
              } else {
                classColor = "text-red-500";
              }
            }

            let previous: PreviousWord = { word: "", wpm: "", targetWpm: "" };
            if (index < previousExercise.length) {
              previous = previousExercise[index];
            }

            return (
              <tr key={word}>
                <td className="text-gray-400">{previous.word}</td>
                <td className="text-gray-400">{previous.wpm}</td>
                <td className="text-gray-400">{previous.targetWpm}</td>
                <td>{word}</td>
                <td className={classColor} style={{ color: styleColor }}>
                  {wpm.toFixed(1)}
                </td>
                <td>{targetWpm}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="flex-grow"></div>
      <div className="mb-10 text-4xl text-center">
        {wpmCounter.getWpm().toFixed(0)} WPM
      </div>
    </>
  );
}

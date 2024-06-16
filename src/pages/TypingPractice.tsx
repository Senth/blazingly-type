import Radio from "@components/basic/radio";
import { Scopes } from "@models/exercise";
import { Lesson } from "@models/lesson";
import useExerciseStore from "@stores/exercise";
import useLessonStore from "@stores/lesson";
import useWpmCounterStore from "@stores/wpmCounter";
import React, { useEffect } from "react";

export default function TypingPracticePage(): JSX.Element {
  return (
    <div>
      <Selectors />
      <ExerciseWrapper />
      <WPMDisplay />
    </div>
  );
}

function Selectors(): JSX.Element {
  return (
    <div className="m-auto w-fit flex gap-20">
      <LessonSelector />
      <ScopeSelector />
      <GenerationSelector />
    </div>
  );
}

function LessonSelector(): JSX.Element {
  const { lessons, selectedLesson, setSelectedLesson } = useLessonStore();
  const { setLesson } = useExerciseStore();

  function handleSelectLesson(lesson: Lesson) {
    setSelectedLesson(lesson);
    setLesson(lesson);
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Lesson</h2>
      <div className="flex flex-col">
        {lessons.map(
          (lesson): React.ReactNode => (
            <Radio
              key={lesson.title}
              name="lesson"
              label={lesson.title}
              checked={selectedLesson.title === lesson.title}
              onChecked={(): void => handleSelectLesson(lesson)}
            />
          ),
        )}
      </div>
    </div>
  );
}

function ScopeSelector(): JSX.Element {
  const { scope, setScope } = useExerciseStore();

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Scope</h2>
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
      <h2 className="text-xl font-bold mb-4">Generation</h2>
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
    <div className="mt-16 lg:w-[986px] w-full m-auto">
      <ExerciseProgress />
      <ExerciseWords />
      <TypingField />
    </div>
  );
}

function ExerciseProgress(): JSX.Element {
  const currentExerciseIndex = useExerciseStore(
    (state) => state.currentExerciseIndex,
  );
  const allExercises = useExerciseStore((state) => state.allExercises);
  const progress = `${currentExerciseIndex + 1}/${allExercises.length}`;

  return <div className="text-center text-2xl">Exercise {progress}</div>;
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
  const [currentWords, nextExercise] = useExerciseStore((state) => [
    state.getCurrentWords() || [],
    state.nextExercise,
  ]);
  const wpmCounter = useWpmCounterStore();
  const correctInput = currentWords.join(" ");

  useEffect(() => {
    if (wpmCounter.exercise.length !== correctInput.length) {
      wpmCounter.setExercise(correctInput);
    }
  }, [correctInput, wpmCounter]);

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape" || event.key === "Tab") {
      setInput("");
      event.preventDefault();
    }
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    wpmCounter.updateCharTime(value.length - 1);

    if (value === correctInput) {
      // nextExercise();
      setInput("");
    } else {
      setInput(value);
    }
  }

  const isWrong = correctInput.substring(0, input.length) !== input;

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
  const uniqueWords = useExerciseStore((state) => state.getUniqueWords());
  return (
    <>
      <div className="mt-10 text-4xl text-center">
        {wpmCounter.getWpm()} WPM
      </div>
      <ul className="mt-10 text-xl text-center">
        {uniqueWords.map((word, index) => (
          <li key={index}>
            {word}: {wpmCounter.getWordWpm(word)}
          </li>
        ))}
      </ul>
    </>
  );
}

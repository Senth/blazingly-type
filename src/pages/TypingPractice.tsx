import Radio from "@components/basic/radio";
import { Lesson } from "@models/lesson";
import useExerciseStore from "@stores/exercise";
import useLessonStore from "@stores/lesson";
import React from "react";

export default function TypingPracticePage(): JSX.Element {
  return (
    <div>
      <Selectors />
      <ExerciseWrapper />
    </div>
  );
}

function Selectors(): JSX.Element {
  return (
    <div className="m-auto w-fit">
      <LessonSelector />
    </div>
  );
}

function LessonSelector(): JSX.Element {
  const { lessons, selectedLesson, setSelectedLesson } = useLessonStore();
  const { setAllExercises } = useExerciseStore();

  function handleSelectLesson(lesson: Lesson) {
    setSelectedLesson(lesson);

    const words = [...lesson.words];

    // Randomize words order
    for (let i = words.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [words[i], words[j]] = [words[j], words[i]];
    }

    const exercises: string[][] = [];

    // TODO for now, use two words multiplied 4 times as an exercise
    const combinations = 2;
    const repetitions = 4;

    let exerciseLength = words.length / combinations;
    if (exerciseLength % 1 !== 0) {
      exerciseLength = Math.ceil(exerciseLength);
    }
    for (let i = 0; i < words.length; i += combinations) {
      const exercise: string[] = [];

      for (let r = 0; r < repetitions; r++) {
        for (let j = 0; j < combinations; j++) {
          if (i + j < words.length) {
            exercise.push(words[i + j]);
          }
        }
      }

      exercises.push(exercise);
    }

    setAllExercises(exercises);
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Lesson</h2>
      <div className="flex flex-col">
        {lessons.map(
          (lesson): React.ReactNode => (
            <Radio
              key={lesson.title}
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

function ExerciseWrapper(): JSX.Element {
  const { allExercises, currentExerciseIndex, nextExercise } =
    useExerciseStore();

  let currentWords: string[] = [];
  if (allExercises[currentExerciseIndex]) {
    currentWords = allExercises[currentExerciseIndex];
  }

  return (
    <div className="mt-16 lg:w-[986px] w-full m-auto">
      <ExerciseWords currentWords={currentWords} />
      <TypingField />
    </div>
  );
}

interface ExerciseWordsProps {
  currentWords: string[];
}

function ExerciseWords({ currentWords }: ExerciseWordsProps): JSX.Element {
  return (
    <div className="mt-10 bg-sky-800 p-3 text-4xl text-center">
      {currentWords.join(" ")}
    </div>
  );
}

function TypingField(): JSX.Element {
  const [input, setInput] = React.useState<string>("");

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setInput("");
      event.preventDefault();
    } else if (event.key === "Tab") {
      setInput("");
      event.preventDefault();
    }
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setInput(event.target.value);
  }

  return (
    <div className="mt-10">
      <input
        className="p-3 h-16 w-full placeholder:bottom-2 placeholder:relative placeholder:text-lg text-center text-4xl text-black rounded-lg"
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

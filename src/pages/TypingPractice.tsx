import Radio from "@components/basic/radio";
import { defaultLessons } from "@models/lesson";
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
  const lessons = defaultLessons;
  const [selectedLesson, setSelectedLesson] = React.useState<string>(
    lessons[0].title,
  );

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Lesson</h2>
      <div className="flex flex-col">
        {lessons.map(
          (lesson): React.ReactNode => (
            <Radio
              key={lesson.title}
              label={lesson.title}
              checked={selectedLesson === lesson.title}
              onChecked={(): void => setSelectedLesson(lesson.title)}
            />
          ),
        )}
      </div>
    </div>
  );
}

function ExerciseWrapper(): JSX.Element {
  return (
    <div className="m-auto w-fit">
      <TypingField />
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
    <div className="mt-14">
      <input
        className="max-w-[60rem] m-auto p-2 h-16 placeholder:bottom-2 placeholder:relative text-center text-4xl placeholder:text-lg align-middle text-black rounded-lg"
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

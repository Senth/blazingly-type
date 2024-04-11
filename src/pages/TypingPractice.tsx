import Radio from "@components/basic/radio";
import { defaultLessons } from "@models/lesson";
import React from "react";

export default function TypingPracticePage(): JSX.Element {
  return (
    <div>
      <div className="flex justify-between">
        <LessonSelector />
      </div>
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

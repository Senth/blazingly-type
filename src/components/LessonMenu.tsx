import { useLessons } from "@db/lesson";
import { defaultLessons, Lesson } from "@models/lesson";
import useExerciseStore from "@stores/exercise";
import useLessonEditorStore from "@stores/lessonEditor";
import useUILayoutStore from "@stores/uiLayout";
import { useState } from "react";

export function LessonMenuClosed(): JSX.Element | null {
  const { isLessonMenuOpen, setLessonMenuOpen } = useUILayoutStore();

  return (
    <div
      className="text-2xl flex font-medium cursor-pointer"
      onClick={() => setLessonMenuOpen(!isLessonMenuOpen)}
    >
      <span className="material text-3xl mr-3 hover:text-slate-300">menu</span>
      <span>Lessons </span>
    </div>
  );
}

export function LessonMenu(): JSX.Element | null {
  const { isLessonMenuOpen } = useUILayoutStore();
  const userLessons = useLessons();
  const { newLesson } = useLessonEditorStore();

  if (!isLessonMenuOpen) {
    return null;
  }

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {userLessons.data && (
        <div className="flex flex-col gap-1 mb-5">
          <p className="pl-2 font-medium text-gray-400">Your lessons</p>
          {userLessons.data.map((lesson) => (
            <LessonItem key={lesson.id} lesson={lesson} />
          ))}
        </div>
      )}
      <p className="pl-2 font-medium text-gray-400">Built-in lessons</p>
      <div className="flex flex-col gap-1">
        {defaultLessons.map((lesson) => (
          <LessonItem key={lesson.id} lesson={lesson} />
        ))}
      </div>
      <button
        className="mt-5 text-xl flex hover:bg-green-600 items-center"
        onClick={(e) => {
          e.stopPropagation();
          newLesson();
        }}
      >
        <div className="p-2">New Lesson...</div>
        <div className="grow"></div>
        <span className="material text-3xl mr-2">add</span>
      </button>
    </div>
  );
}

function LessonItem({ lesson }: { lesson: Lesson }): JSX.Element {
  const { lesson: currentLesson, setLesson } = useExerciseStore();
  const isActive = currentLesson.id === lesson.id;
  const [hovering, setHovering] = useState(false);
  const { editLesson } = useLessonEditorStore();

  let stateClass = "";
  if (isActive) {
    stateClass = "cursor-default bg-slate-700";
  } else if (hovering) {
    stateClass = "cursor-pointer hover:bg-slate-500";
  }

  return (
    <div
      className={`w-72 text-xl flex ${stateClass}`}
      onClick={() => setLesson(lesson)}
    >
      <div
        className="p-2 truncate"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        {lesson.title}
      </div>
      <div
        className="grow"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      ></div>
      <button className="hover:text-green-400 pr-2">
        <span
          className="material text-3xl w-8 h-8"
          onClick={(e) => {
            e.stopPropagation();
            editLesson(lesson);
          }}
        >
          edit
        </span>
      </button>
    </div>
  );
}

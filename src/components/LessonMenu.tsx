import { Lesson } from "@models/lesson";
import useExerciseStore from "@stores/exercise";
import useLessonStore from "@stores/lesson";
import useLessonEditorStore from "@stores/lessonEditor";
import useUILayoutStore from "@stores/uiLayout";
import { useState } from "react";
import { MdAdd, MdEdit, MdMenu } from "react-icons/md";

export function LessonMenuClosed(): JSX.Element | null {
  const { isLessonMenuOpen, setLessonMenuOpen } = useUILayoutStore();

  if (isLessonMenuOpen) {
    return null;
  }
  return (
    <div
      className="text-2xl flex  font-medium cursor-pointer p-5 fixed"
      onClick={() => setLessonMenuOpen(true)}
    >
      <MdMenu className="w-8 h-8 mr-3" />
      <span>Lessons </span>
    </div>
  );
}

export function LessonMenu(): JSX.Element | null {
  const { isLessonMenuOpen, setLessonMenuOpen } = useUILayoutStore();
  const { lessons } = useLessonStore();
  const { newLesson } = useLessonEditorStore();

  if (!isLessonMenuOpen) {
    return null;
  }

  return (
    <div className="h-full flex flex-col bg-slate-900">
      <div
        onClick={() => setLessonMenuOpen(false)}
        className="flex text-2xl font-medium cursor-pointer items-center p-5"
      >
        <MdMenu className="w-8 h-8 mr-3" />
        <span>Lessons</span>
      </div>
      <div className="flex flex-col gap-1">
        {lessons.map((lesson) => (
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
        <MdAdd className="w-8 h-8 mr-2" />
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
      className={`min-w-72 text-xl flex ${stateClass}`}
      onClick={() => setLesson(lesson)}
    >
      <div
        className="p-2"
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
        <MdEdit
          className="w-8 h-8"
          onClick={(e) => {
            e.stopPropagation();
            editLesson(lesson.id);
          }}
        />
      </button>
    </div>
  );
}

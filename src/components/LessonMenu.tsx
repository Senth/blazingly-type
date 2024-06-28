import { Lesson } from "@models/lesson";

export default function LessonMenu(): JSX.Element {
  return (
    <div>
      <h1>Lesson Menu</h1>
    </div>
  );
}

function LessonItem({ lesson }: { lesson: Lesson }): JSX.Element {
  return (
    <div>
      <span className="text-xl2">{lesson.title}</span>
      <span className="">EDIT</span>
    </div>
  );
}

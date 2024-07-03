import useLessonEditorStore from "@stores/lessonEditor";
import { ModalContent } from "./Modals";
import Button from "./basic/button";
import Input from "./basic/input";
import TextArea from "./basic/textarea";
import { MdInfo } from "react-icons/md";
import { getUserId } from "@auth";
import { upsertLesson, useLessons } from "@db/lesson";

export default function LessonEditorModal(): JSX.Element | null {
  const lessonEditor = useLessonEditorStore();
  const lesson = lessonEditor.lesson;

  if (!lessonEditor.isEditorOpen) {
    return null;
  }

  let title = "";
  const buttons: React.ReactNode[] = [];

  if (lessonEditor.lesson.id) {
    title = "Edit Lesson";
    buttons.push(
      <Button
        text="Create Copy"
        styling="neutral"
        onClick={lessonEditor.copy}
      />,
    );
    buttons.push(
      <Button
        text={lesson.custom ? "Discard" : "Close"}
        styling="neutral"
        onClick={lessonEditor.close}
      />,
    );
    if (lesson.custom) {
      buttons.push(<SaveLessonButton />);
    }
  } else {
    title = "New Lesson";
    buttons.push(
      <Button text="Discard" styling="neutral" onClick={lessonEditor.close} />,
    );
    buttons.push(<SaveLessonButton />);
  }

  return (
    <ModalContent full={true} title={title} buttons={buttons}>
      {!lesson.custom && (
        <div className="text-yellow-400 flex items-center mb-5">
          <MdInfo className="w-8 h-8 mr-3" />
          <span>
            This is a built-in lesson. You <strong>create copy</strong> below to
            make changes.
          </span>
        </div>
      )}
      <Input
        label="Title"
        value={lesson.title}
        placeholder="Lesson title"
        disabled={!lesson.custom}
        onChange={(e) => {
          lesson.title = e.currentTarget.value;
          lessonEditor.setLesson(lesson);
        }}
      />
      <TextArea
        className="mt-5"
        label="Short Description"
        value={lesson.shortDescription || ""}
        placeholder="Short description"
        disabled={!lesson.custom}
        onChange={(e) => {
          lesson.shortDescription = e.currentTarget.value;
          lessonEditor.setLesson(lesson);
        }}
      />
      <TextArea
        className="mt-5 grow"
        label="Words, n-grams to practice. Separated by spaces by default"
        value={lesson.words.join(" ")}
        placeholder="Type words here..."
        disabled={!lesson.custom}
        onChange={(e) => {
          lesson.words = e.currentTarget.value.split(" ");
          lessonEditor.setLesson(lesson);
        }}
      />
    </ModalContent>
  );
}

function SaveLessonButton(): JSX.Element {
  const { lesson, close } = useLessonEditorStore();
  const userLessons = useLessons();
  function saveLesson() {
    const uid = getUserId();
    if (!uid) {
      // TODO show error that user is not logged in
      return;
    }

    upsertLesson(uid, lesson)
      .then((updatedLesson) => {
        // TODO show success message

        if (!userLessons.data) {
          return;
        }

        // New - Add the lesson to the store and resort
        if (lesson.id) {
          userLessons.mutate([...userLessons.data, updatedLesson]);
        }
        // Update - Replace the lesson in the store
        else if (userLessons.data) {
          userLessons.mutate(
            userLessons.data.map((l) =>
              l.id === updatedLesson.id ? updatedLesson : l,
            ),
          );
        }

        close();
      })
      .catch((e) => {
        // TODO show error message that the lesson could not be saved
      });
  }

  return (
    <Button
      text={lesson.id ? "Save" : "Create"}
      styling="primary"
      onClick={saveLesson}
    />
  );
}

import useLessonEditorStore from "@stores/lessonEditor";
import { ModalBackground } from "./Modals";

export default function LessonEditorModal(): JSX.Element | null {
  const lessonEditor = useLessonEditorStore();

  if (!lessonEditor.isEditorOpen) {
    return null;
  }

  return (
    <>
      <ModalBackground />
      <div className="absolute top-0 left-0">Hello!!!</div>
    </>
  );
}

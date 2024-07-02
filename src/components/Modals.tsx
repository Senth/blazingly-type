import LessonEditorModal from "./LessonEditor";

export default function Modals(): JSX.Element | null {
  return (
    <>
      <LessonEditorModal />
    </>
  );
}

export function ModalBackground(): JSX.Element {
  return (
    <div className="absolute top-0 left-0 w-full h-full bg-zinc-900 opacity-60"></div>
  );
}

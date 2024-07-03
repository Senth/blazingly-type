import LessonEditorModal from "./LessonEditor";
import LoginModal from "./LoginModal";

export default function Modals(): JSX.Element | null {
  return (
    <>
      <LessonEditorModal />
      <LoginModal />
    </>
  );
}

export function ModalBackground(): JSX.Element {
  return (
    <div className="absolute top-0 left-0 w-full h-full bg-zinc-900 opacity-60"></div>
  );
}

export interface ModalContentProps {
  children: React.ReactNode;
  title: string;
  full?: boolean;
  grow?: boolean;
  buttons?: React.ReactNode[];
}

export function ModalContent(props: ModalContentProps): JSX.Element {
  return (
    <>
      <ModalBackground />
      <div className="absolute top-0 left-0 h-full w-full flex items-center justify-center">
        <div
          className={`bg-slate-900 centered-content p-5 flex flex-col rounded-lg ${props.full && "h-4/5 w-4/5 xl:w-[1024px]"}`}
        >
          <h1 className="text-2xl mb-5">{props.title}</h1>
          {props.children}
          {props.grow && <div className="grow"></div>}
          {props.buttons && (
            <div className="mt-5 flex gap-5">
              <div className="grow"></div>
              {props.buttons.map((button, index) => (
                <div key={index} className="">
                  {button}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

import useUILayoutStore from "@stores/uiLayout";
import { ModalContent } from "./Modals";
import { signInWithGoogle } from "@auth";

export default function LoginModal(): JSX.Element | null {
  const { isLoginModalOpen, setLoginModalOpen } = useUILayoutStore();

  if (!isLoginModalOpen) {
    return null;
  }

  return (
    <ModalContent title="Login">
      <div className="flex flex-col gap-3">
        <LoginButton
          text="Login using Google"
          iconUrl="https://lh3.googleusercontent.com/COxitqgJr1sJnIDe8-jiKhxDx1FrYbtRHKJ9z_hELisAlapwE9LUPh6fcXIfb5vwpbMl4xl9H9TRFPc5NOO8Sb3VSgIBrfRYvW6cUA"
          iconAlt="Google logo"
          colorName="blue"
          onClick={() => {
            signInWithGoogle().then(() => {
              setLoginModalOpen(false);
            });
          }}
        />
        <LoginButton
          className="mt-3"
          text="Cancel"
          onClick={() => setLoginModalOpen(false)}
        />
      </div>
    </ModalContent>
  );
}

interface LoginButtonProps {
  className?: string;
  iconUrl?: string;
  iconAlt?: string;
  text: string;
  colorName?: string;
  onClick: () => void;
}

function LoginButton(props: LoginButtonProps): JSX.Element {
  const colorName = props.colorName || "gray";

  return (
    <button
      className={`flex h-10 bg-${colorName}-500 hover:bg-${colorName}-400 active:bg-${colorName}-600 items-center uppercase font-medium rounded-full ${props.className}`}
      onClick={() => props.onClick()}
    >
      {props.iconUrl && (
        <img
          src={props.iconUrl}
          alt={props.iconAlt}
          className="w-10 h-10 rounded-full bg-white p-2"
        />
      )}
      <div className="grow px-3">{props.text}</div>
    </button>
  );
}

import { logout } from "@auth";
import useUILayoutStore from "@stores/uiLayout";
import useUserProfileStore from "@stores/userProfile";
import { useEffect, useRef, useState } from "react";
import { MdAccountCircle } from "react-icons/md";

interface TopBarProps {
  menu?: React.ReactNode;
}

export default function TopBar(props: TopBarProps): JSX.Element {
  return (
    <div className="flex items-center justify-between border-b-slate-500 h-16 bg-slate-900 text-white px-5 drop-shadow-xl">
      {props.menu && <div className="mr-10">{props.menu}</div>}

      <div className="grow"></div>
      <UserProfile />
    </div>
  );
}

function UserProfile(): JSX.Element {
  const userProfile = useUserProfileStore();
  const [isMenuOpen, setMenuOpen] = useState(false);

  return (
    <div
      className="flex items-center gap-2 cursor-pointer"
      onClick={() => !isMenuOpen && setMenuOpen(true)}
    >
      {userProfile.user ? (
        <>
          <div>{userProfile.user.displayName}</div>
          {userProfile.user.photoURL ? (
            <img
              alt="User profile"
              src={userProfile.user.photoURL}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <div className="text-green-400">🟢</div>
          )}
        </>
      ) : (
        <>
          <div>Not logged in</div>
          <MdAccountCircle size={48} className="w-10 h-10" />
        </>
      )}
      {isMenuOpen && <UserMenu setMenuOpen={setMenuOpen} />}
    </div>
  );
}

function UserMenu({
  setMenuOpen,
}: {
  setMenuOpen: (value: boolean) => void;
}): JSX.Element {
  const { user } = useUserProfileStore();
  const menuRef = useRef<HTMLDivElement>(null);
  const { setLoginModalOpen } = useUILayoutStore();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (menuRef.current && !menuRef.current.contains(target)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef, setMenuOpen]);

  return (
    <div
      ref={menuRef}
      className="absolute bg-slate-900 flex flex-col items-center top-16 right-5 rounded-lg drop-shadow-md"
    >
      <MenuItemButton text="Coming..." onClick={() => {}} />
      <hr className="w-full h-0.5 bg-slate-500" />
      {user && (
        <MenuItemButton
          text="Logout"
          onClick={() => {
            logout();
            setMenuOpen(false);
          }}
        />
      )}
      {!user && (
        <MenuItemButton
          text="Login"
          onClick={() => {
            setMenuOpen(false);
            setLoginModalOpen(true);
          }}
        />
      )}
    </div>
  );
}

function MenuItemButton(props: {
  text: string;
  onClick: () => void;
}): JSX.Element {
  return (
    <button
      className="text-left w-full p-2 m-2 min-w-32 hover:bg-slate-500 active:bg-slate-700"
      onClick={props.onClick}
    >
      {props.text}
    </button>
  );
}

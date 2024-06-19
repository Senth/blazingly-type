import { User } from "firebase/auth";
import { create } from "zustand";

interface UserProfileStore {
  user?: User | null;
  setUser: (user?: User | null) => void;
}

const useUserProfileStore = create<UserProfileStore>((set) => {
  // Load the user from the local storage
  const userJSON = localStorage.getItem("user");
  let user: User | undefined;
  if (userJSON) {
    user = JSON.parse(userJSON);
  }

  return {
    user: user,
    setUser: (user?: User | null) => set({ user }),
  };
});

export const userProfileActions = {
  setUser: useUserProfileStore.getState().setUser,
};

export default useUserProfileStore;

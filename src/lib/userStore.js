import { doc, getDoc } from "firebase/firestore";
import { create } from "zustand";
import { db } from "./firebase";

export const useUserStore = create((set) => ({
  currentUser: null,
  isLoading: true,
  fetchUserInfo: async (userId) => {
    set({ isLoading: true });
    if (!userId) {
      set({ currentUser: null, isLoading: false });
      return;
    }
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      set({ currentUser: userDoc.data(), isLoading: false });
    } else {
      set({ currentUser: null, isLoading: false });
      console.log("No such document!");
    }
  },
}));

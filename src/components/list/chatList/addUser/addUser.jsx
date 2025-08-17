import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import "./addUser.css";
import { db } from "../../../../lib/firebase";
import { useState } from "react";
import { useUserStore } from "../../../../lib/userStore";

const AddUser = () => {
  const [user, setUser] = useState(null);
  const { currentUser } = useUserStore(); // Fonksiyonu çağır!

  const handleSearch = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get("username");

    try {
      const userRef = collection(db, "users");
      const q = query(userRef, where("userName", "==", username));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setUser(null);
        console.log("No user found with that username");
        return;
      }

      // id'yi ekle!
      const docSnap = querySnapshot.docs[0];
      const userData = { ...docSnap.data(), id: docSnap.id };
      setUser(userData);
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const handleAdd = async () => {
    const chatRef = collection(db, "chats");
    const userChatsRef = collection(db, "userChats");
    if (!user) return;

    try {
      const newChatRef = doc(chatRef);
      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });

      // Kullanıcı için userChats dokümanı var mı kontrol et
      const userDocRef = doc(userChatsRef, user.id);
      const userDocSnap = await getDoc(userDocRef);
      if (!userDocSnap.exists()) {
        await setDoc(userDocRef, { chats: [] });
      }
      await updateDoc(userDocRef, {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          reciverId: currentUser.id,
          updatedAt: Date.now(),
        }),
      });

      // Mevcut kullanıcı için userChats dokümanı var mı kontrol et
      const currentUserDocRef = doc(userChatsRef, currentUser.id);
      const currentUserDocSnap = await getDoc(currentUserDocRef);
      if (!currentUserDocSnap.exists()) {
        await setDoc(currentUserDocRef, { chats: [] });
      }
      await updateDoc(currentUserDocRef, {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          reciverId: user.id,
          updatedAt: Date.now(),
        }),
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div className="addUser">
      <form onSubmit={handleSearch}>
        <input type="text" placeholder="Username" name="username" />
        <button type="submit">Search</button>
      </form>
      {user && (
        <div className="user">
          <div className="detail">
            <img src={user.avatar || "/avatar.png"} alt="" />
            <span>{user.userName}</span>
          </div>
          <button onClick={handleAdd}>Add User</button>
        </div>
      )}
    </div>
  );
};

export default AddUser;

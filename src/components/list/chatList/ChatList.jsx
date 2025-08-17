import { useEffect, useState } from "react";
import "./ChatList.css";
import AddUser from "./addUser/addUser";
import { useUserStore } from "../../../lib/userStore";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useChatStore } from "../../../lib/chatStore";
const ChatList = () => {
  const [addMode, setAddMode] = useState(false);
  const [chats, setChats] = useState([]);
  const { currentUser } = useUserStore();
  const { changeChat, chatId } = useChatStore();
  const [filterUser, setFilterUser] = useState("");
  useEffect(() => {
    if (!currentUser?.id) return;
    const unSub = onSnapshot(
      doc(db, "userChats", currentUser.id),
      async (snapshot) => {
        const items = snapshot.data()?.chats || [];

        const promises = items.map(async (item) => {
          const userDocRef = doc(db, "users", item.reciverId);
          const userDocSnap = await getDoc(userDocRef);

          const user = userDocSnap.data();
          return { ...item, user };
        });
        const chatsWithUsers = await Promise.all(promises);
        setChats(
          chatsWithUsers.sort((a, b) => {
            return b.updatedAt - a.updatedAt;
          })
        );
      }
    );
    return () => {
      unSub();
    };
  }, [currentUser]);

  const handleSelect = async (chat) => {
    const userChats = chats.map((item) => {
      const { ...rest } = item;
      return { ...rest };
    });

    const chatIndex = userChats.findIndex(
      (item) => item.chatId === chat.chatId
    );

    userChats[chatIndex].isSeen = true;
    const userChatRef = doc(db, "userChats", currentUser.id);

    try {
      await updateDoc(userChatRef, {
        chats: userChats,
      });
    } catch (error) {
      console.error("Error updating user chats:", error);
    }
    changeChat(chat.chatId, chat.user);
  };

  const filteredChats = chats.filter((chat) =>
    chat.user?.userName.toLowerCase().includes(filterUser.toLowerCase())
  );
  return (
    <div className="chatList">
      <div className="search">
        <div className="search-bar">
          <img src="/search.png" alt="" />
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => setFilterUser(e.target.value)}
          />
        </div>
        <img
          src={addMode ? "/minus.png" : "/plus.png"}
          alt=""
          className="add"
          onClick={() => setAddMode((prev) => !prev)}
        />
      </div>
      {filteredChats.map((chat) => (
        <div
          className="item"
          key={chat.chatId}
          onClick={() => {
            handleSelect(chat);
          }}
          style={{
            backgroundColor:
              chatId === chat.chatId ? "#5e89d8ff" : "transparent",
          }}
        >
          <img
            src={
              chat.user.blocked.includes(currentUser.id)
                ? "/avatar.png"
                : chat.user?.avatar || "/avatar.png"
            }
            alt=""
          />
          <div className="texts">
            <span>
              {chat.user.blocked.includes(currentUser.id)
                ? "User blocked"
                : chat.user?.userName}
            </span>
            <p>{chat.lastMessage}</p>
          </div>
        </div>
      ))}

      {addMode && <AddUser />}
    </div>
  );
};

export default ChatList;

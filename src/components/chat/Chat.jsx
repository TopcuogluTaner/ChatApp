import { useEffect, useRef, useState } from "react";
import "./Chat.css";
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import uploadImage from "../../lib/upload";
const Chat = () => {
  const { chatId, user, isReceiverBlocked, isCurrentUserBlocked } =
    useChatStore();
  const { currentUser } = useUserStore();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [img, setImg] = useState({
    file: null,
    url: "",
  });
  const [messages, setMessages] = useState([]);
  const endRef = useRef(null);

  const handleEmojiClick = (emoji) => {
    setText((prev) => prev + emoji.emoji);
    setOpen(false);
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (!chatId) return;
    const unSub = onSnapshot(doc(db, "chats", chatId), (snapshot) => {
      setMessages(snapshot.data()?.messages || []);
    });
    return () => {
      unSub();
    };
  }, [chatId]);

  const handleSend = async () => {
    if (text === "") return;
    try {
      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          text,
          senderId: currentUser.id,
          createdAt: new Date(),
        }),
      });
      const userIDs = [currentUser.id, user.id];

      userIDs.forEach(async (userId) => {
        const userChatRef = doc(db, "userChats", userId);
        const userChatsSnapshots = await getDoc(userChatRef);

        if (userChatsSnapshots.exists()) {
          const userChatsData = userChatsSnapshots.data();
          const chatIndex = userChatsData.chats.findIndex(
            (chat) => chat.chatId === chatId
          );
          userChatsData[chatIndex].lastMessage = text;
          userChatsData[chatIndex].isSeen =
            userId === currentUser.id ? true : false;
          userChatsData[chatIndex].updatedAt = Date.now();

          await updateDoc(userChatRef, {
            chats: userChatsData.chats,
          });
        }
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
    setText("");
  };

  const handleImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const imgBase64 = await uploadImage(file);

    await updateDoc(doc(db, "chats", chatId), {
      messages: arrayUnion({
        img: imgBase64,
        senderId: currentUser.id,
        createdAt: new Date(),
      }),
    });

    setImg({ file: null, url: "" });
  };

  return (
    <div className="chat">
      <div className="top">
        <div className="user">
          <img src="/avatar.png" alt="" />
          <div className="texts">
            <span>User Name</span>
            <p>Last message...</p>
          </div>
        </div>
        <div className="icons">
          <img src="/phone.png" alt="" />
          <img src="/video.png" alt="" />
          <img src="/info.png" alt="" />
        </div>
      </div>
      <div className="center">
        {messages?.map((message) => (
          <div
            className={
              message.senderId === currentUser.id ? "message own" : "message"
            }
            key={message.createdAt?.seconds || Math.random()}
          >
            <div className="texts">
              {message.img && <img src={message.img} alt="" />}
              {message.text && <p>{message.text}</p>}{" "}
              <span>
                {message.createdAt?.seconds
                  ? new Date(message.createdAt.seconds * 1000).toLocaleString()
                  : ""}
              </span>
            </div>
          </div>
        ))}
        {img.url && (
          <div
            className="message own"
            key={img.createdAt?.seconds || Math.random()}
          >
            <div className="texts">{<img src={img.url} alt="" />}</div>
          </div>
        )}

        <div ref={endRef}></div>
      </div>
      <div className="bottom">
        <div className="icons">
          <label htmlFor="file">
            <img src="img.png" alt="" />
          </label>
          <input
            disabled={isReceiverBlocked || isCurrentUserBlocked}
            type="file"
            id="file"
            style={{ display: "none" }}
            onChange={handleImage}
          />
          <img src="camera.png" alt="" />
          <img src="mic.png" alt="" />
        </div>
        <input
          disabled={isReceiverBlocked || isCurrentUserBlocked}
          className="input"
          type="text"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div
          className="emoji"
          disabled={isReceiverBlocked || isCurrentUserBlocked}
        >
          <img src="/emoji.png" alt="" onClick={() => setOpen(!open)} />
          <div className="picker">
            {open && (
              <EmojiPicer
                open={open}
                onEmojiClick={(emoji) => {
                  handleEmojiClick(emoji);
                }}
              />
            )}
          </div>
        </div>
        <button
          className="sendButton"
          onClick={handleSend}
          disabled={isReceiverBlocked || isCurrentUserBlocked}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;

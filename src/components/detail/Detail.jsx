import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";
import { useChatStore } from "../../lib/chatStore";
import { auth, db } from "../../lib/firebase";
import { useUserStore } from "../../lib/userStore";
import "./Detail.css";

const Detail = () => {
  const { currentUser } = useUserStore();
  const { user, isReceiverBlocked, changeBlock, isCurrentUserBlocked } =
    useChatStore();

  const handleBlock = async () => {
    if (!user) return;
    const userDocRef = doc(db, "users", currentUser.id);
    try {
      await updateDoc(userDocRef, {
        blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
      });
      changeBlock();
    } catch (error) {
      console.error("Error blocking user:", error);
    }
  };
  return (
    <div className="detail">
      <div className="user">
        <img src={user?.avatar || "/avatar.png"} alt="" />
        <h2>{user?.userName}</h2>
        <p>Lorem ipsum dolor sit amet.</p>
      </div>
      <div className="info">
        <div className="option">
          <div className="title">
            <span> Chat Setting</span>
            <img src="/arrowUp.png" alt="" />
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span> Privacy & Help</span>
            <img src="/arrowUp.png" alt="" />
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span> Shared Photos</span>
            <img src="/arrowDown.png" alt="" />
          </div>
          <div className="photos">
            <div className="photoItem">
              <div className="photoDetail">
                <img
                  src="https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt=""
                />
                <span>Photo 1</span>
              </div>
              <img src="./download.png" alt="" className="icon" />{" "}
            </div>
          </div>
        </div>

        <div className="option">
          <div className="title">
            <span> Shared Files</span>
            <img src="/arrowUp.png" alt="" />
          </div>
        </div>
        <button onClick={handleBlock}>
          {isCurrentUserBlocked
            ? "You are blocked"
            : isReceiverBlocked
            ? "Unblock User"
            : "Block User"}
        </button>
        <button
          className="logout"
          onClick={() => {
            auth.signOut();
          }}
        >
          Log Out
        </button>
      </div>
    </div>
  );
};

export default Detail;

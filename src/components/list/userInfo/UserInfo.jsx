import "./userInfo.css";
import { useUserStore } from "../../../lib/userStore";
const UserInfo = () => {
  const { currentUser } = useUserStore();

  return (
    <div className="userInfo">
      <div className="user">
        <img src={currentUser?.avatar || "./avatar.png"} alt="" />
        <div>{currentUser?.userName}</div>
      </div>
      <div className="icons">
        <img src="./more.png" alt="" />
        <img src="./video.png" alt="" />
        <img src="./edit.png" alt="" />
      </div>
    </div>
  );
};

export default UserInfo;

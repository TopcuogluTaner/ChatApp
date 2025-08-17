import { useState } from "react";
import "./login.css";
import { toast } from "react-toastify";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import uploadImage from "../../lib/upload";
const Login = () => {
  const [avatar, setAvatar] = useState({
    file: null,
    url: "",
  });
  const [loading, setLoading] = useState(false);
  const handleAvatar = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatar({
        file: file,
        url: URL.createObjectURL(file),
      });
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData(e.target);
      const { email, password } = Object.fromEntries(formData);

      signInWithEmailAndPassword(auth, email, password)
        .then(() => {
          toast.success("Logged in successfully");
        })
        .catch((error) => {
          console.error(error);
          toast.error(error.message || "Something went wrong");
        })
        .finally(() => {
          setLoading(false);
        });
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    }
  };
  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);

    const { username, email, password } = Object.fromEntries(formData);

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);

      let avatarBase64 = "";
      if (avatar.file) {
        avatarBase64 = await uploadImage(avatar.file);
      }

      await setDoc(doc(db, "users", res.user.uid), {
        userName: username,
        email,
        id: res.user.uid,
        blocked: [],
        avatar: avatarBase64,
      });
      await setDoc(doc(db, "userChats", res.user.uid), {
        chats: [],
      });

      toast.success("Account created successfully. You can now log in.");
    } catch (error) {
      console.log(error);
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="login">
      <div className="item">
        <h2>Welcome Back</h2>
        <form onSubmit={handleLogin}>
          <input type="text" placeholder="Email" name="email" />
          <input type="password" placeholder="Password" name="password" />
          <button type="submit" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>
      </div>
      <div className="separator"></div>
      <div className="item">
        <h2>Create an Account</h2>
        <form onSubmit={handleCreate}>
          <label htmlFor="file">
            <img src={avatar.url || "/avatar.png"} alt="" />
            Upload Profile Picture
          </label>
          <input
            type="file"
            id="file"
            style={{ display: "none" }}
            onChange={handleAvatar}
          />
          <input type="text" placeholder="Username" name="username" />
          <input type="text" placeholder="Email" name="email" />
          <input type="password" placeholder="Password" name="password" />
          <button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

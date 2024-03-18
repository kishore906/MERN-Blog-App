import { useState, useContext } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../UserContext";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(false);
  const [msg, setMsg] = useState(null);
  const [redirect, setRedirect] = useState(false);
  const { setUserInfo } = useContext(UserContext);

  async function handleLogin(e) {
    e.preventDefault();

    setIsLogin(true);
    setMsg("");

    const response = await fetch("http://localhost:3003/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      setIsLogin(false);
      setMsg(data.error);
    } else {
      setUserInfo(data);
      setIsLogin(false);
      setRedirect(true);
      //console.log(data);
    }
  }

  if (redirect) {
    return <Navigate to="/" />;
  }

  return (
    <form className="login" onSubmit={handleLogin}>
      <h1>Login</h1>
      <input
        type="text"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter Email.."
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter Password.."
        required
      />
      <button disabled={isLogin}>{isLogin ? "Logging..." : "Login"}</button>

      {msg && <div className="msg">{msg}</div>}
    </form>
  );
}

export default LoginPage;

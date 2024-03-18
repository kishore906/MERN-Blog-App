import { useState } from "react";
import { useNavigate } from "react-router-dom";

function RegisterPage() {
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [msg, setMsg] = useState(null);

  const navigate = useNavigate();

  async function handleRegister(e) {
    e.preventDefault();

    setIsRegistering(true);
    setMsg("");

    const response = await fetch("http://localhost:3003/register", {
      method: "POST",
      body: JSON.stringify({ fullname, email, password }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      setMsg(data.error);
      setIsRegistering(false);
    } else {
      setFullname("");
      setEmail("");
      setPassword("");
      setMsg(data.msg);
      setIsRegistering(false);
      navigate("/login");
    }
  }

  return (
    <form className="register" onSubmit={handleRegister}>
      <h1>Register</h1>
      <input
        type="text"
        value={fullname}
        onChange={(e) => setFullname(e.target.value)}
        placeholder="Enter fullname.."
        required
      />
      <input
        type="text"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter email.."
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter Password.."
        required
      />
      <button disabled={isRegistering}>
        {isRegistering ? "Regsitering..." : "Regsiter"}
      </button>

      {msg && <div className="msg">{msg}</div>}
    </form>
  );
}

export default RegisterPage;

import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";

import { UserContext } from "./UserContext";

function Header() {
  const { userInfo, setUserInfo } = useContext(UserContext);
  const username = userInfo?.email;

  const navigate = useNavigate();

  function handleLogout() {
    fetch("http://localhost:3003/logout", {
      credentials: "include",
      method: "POST",
    });
    setUserInfo(null);
    navigate("/");
  }

  return (
    <header>
      <Link to="/" className="logo">
        IdeaSphere -
        <span className="logo-text">Mapping The Landscape Of Ideas</span>
      </Link>

      <nav>
        {username && (
          <>
            <Link to="/create">Create New Post</Link>
            <span className="logout-btn" onClick={handleLogout}>
              Logout
            </span>
          </>
        )}
        {!username && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
}

export default Header;

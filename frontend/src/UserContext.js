import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const UserContext = createContext();

function UserContextProvider({ children }) {
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let matches = document.cookie.match(
      new RegExp(
        "(?:^|; )" +
          "token".replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, "\\$1") +
          "=([^;]*)"
      )
    );
    matches = matches ? decodeURIComponent(matches[1]) : undefined;

    async function getProfile() {
      const response = await fetch("http://localhost:3003/profile", {
        credentials: "include",
      });
      const userDetails = await response.json();

      if (!response.ok) {
        if (userDetails.error === "token expired") {
          setUserInfo(null);
          navigate("/login");
        }
      } else {
        setUserInfo(userDetails);
      }
    }

    if (matches) {
      getProfile();
    }
  }, [navigate]);

  return (
    <UserContext.Provider value={{ userInfo, setUserInfo }}>
      {children}
    </UserContext.Provider>
  );
}

export { UserContext, UserContextProvider };

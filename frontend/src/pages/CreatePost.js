import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import Editor from "../Editor";
import { UserContext } from "../UserContext";

export default function CreatePost() {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState("");

  const { setUserInfo } = useContext(UserContext);

  const navigate = useNavigate();

  async function createNewPost(ev) {
    ev.preventDefault();

    const data = new FormData(ev.target);

    data.append("title", title);
    data.append("summary", summary);
    data.append("content", content);
    data.append("file", files[0]);

    //console.log([...data]);

    const response = await fetch("http://localhost:3003/post", {
      method: "POST",
      body: data,
      credentials: "include",
    });

    const json = await response.json();

    if (!response.ok) {
      if (json.error === "token expired") {
        setUserInfo(null);
        navigate("/login");
      }
    } else {
      navigate("/");
    }
  }

  return (
    <form onSubmit={createNewPost}>
      <input
        type="text"
        placeholder={"Title"}
        value={title}
        onChange={(ev) => setTitle(ev.target.value)}
      />
      <input
        type="text"
        placeholder={"Summary"}
        value={summary}
        onChange={(ev) => setSummary(ev.target.value)}
      />
      <input type="file" onChange={(ev) => setFiles(ev.target.files)} />

      {/* <textarea
        rows={30}
        cols={125}
        value={content}
        onChange={(e) => setContent(e.target.value)}
      ></textarea> */}

      <Editor value={content} onChange={setContent} />

      <button style={{ marginTop: "5px" }}>Create post</button>
    </form>
  );
}

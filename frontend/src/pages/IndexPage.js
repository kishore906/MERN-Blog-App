import Post from "../Post";
import { useState, useEffect } from "react";

function IndexPage() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    async function getAllPosts() {
      const response = await fetch("http://localhost:3003/posts");
      const data = await response.json();
      setPosts(data);
    }

    getAllPosts();
  }, []);
  return (
    <>
      {posts.length > 0 &&
        posts.map((post) => <Post {...post} key={post._id} />)}
    </>
  );
}

export default IndexPage;

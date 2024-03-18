import { useContext, useEffect, useState } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { formatISO9075 } from "date-fns";
import { UserContext } from "../UserContext";
import { Link } from "react-router-dom";

function PostPage() {
  const [postInfo, setPostInfo] = useState(null);
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [comment, setComment] = useState("");

  const { userInfo } = useContext(UserContext);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:3003/post/${id}`).then((response) => {
      response.json().then((postInfo) => {
        setPostInfo(postInfo);
      });
    });
  }, [id]);

  if (!postInfo) return "";

  if (!userInfo?.id) {
    return <Navigate replace to="/login" />;
  }

  async function handleReviewSubmit(e) {
    try {
      e.preventDefault();
      const review = {
        comment,
        postId: id,
      };

      const response = await fetch("http://localhost:3003/createReview", {
        method: "PUT",
        body: JSON.stringify(review),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Error in Submitting Review...");
      }

      const data = await response.json();
      alert(data.message);
      navigate(0);
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="post-page">
      <h1>{postInfo.title}</h1>
      <time>{formatISO9075(new Date(postInfo.createdAt))}</time>
      <div className="author">by @{postInfo.author.fullname}</div>
      {userInfo.id === postInfo.author._id && (
        <div className="edit-row">
          <Link className="edit-btn" to={`/edit/${postInfo._id}`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
              />
            </svg>
            Edit this post
          </Link>
        </div>
      )}
      <div className="image">
        <img src={`http://localhost:3003/${postInfo.cover}`} alt="post_img" />
      </div>
      <div
        className="content"
        dangerouslySetInnerHTML={{ __html: postInfo.content }}
      />

      {/* Reviews Section */}
      <div className="reviewsAndAddCommentDiv ">
        <h4>All Comments ({postInfo.numOfReviews})</h4>
        {userInfo && userInfo.id !== postInfo.author._id && (
          <button
            className="addCommentBtn"
            onClick={() => setIsCommentOpen((prev) => !prev)}
          >
            Add Comment
          </button>
        )}
      </div>

      <div className="reviews">
        {postInfo.reviews.map((review) => (
          <div className="review" key={review._id}>
            <div className="reviewer">
              <div className="initial">{review.user.fullname[0]}</div>
              <div className="name">
                <h3>{review.user.fullname}</h3>
                <p>
                  Reviewed On:{" "}
                  <i>{new Date(review.reviewDate).toDateString()}</i>
                </p>
              </div>
            </div>
            <p>{review.comment}</p>
          </div>
        ))}
      </div>

      {isCommentOpen && (
        <form onSubmit={handleReviewSubmit}>
          <label htmlFor="comment">
            <b>Comment:</b>
          </label>
          <textarea
            name="comment"
            id="comment"
            className="comment"
            rows={15}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          ></textarea>
          <button className="addCommentBtn extra">Comment</button>
        </form>
      )}
    </div>
  );
}

export default PostPage;

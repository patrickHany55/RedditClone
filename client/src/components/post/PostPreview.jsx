import { Link } from "react-router-dom";

function PostPreview({ post }) {
  return (
    <article style={{ border: "1px solid #ddd", padding: 12, marginBottom: 12 }}>
      <h3 style={{ margin: 0 }}>
        <Link to={`/posts/${post.id}`}>{post.title}</Link>
      </h3>
      <p style={{ marginTop: 8 }}>{post.body}</p>
    </article>
  );
}

export default PostPreview;

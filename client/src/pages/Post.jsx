import { useParams } from "react-router-dom";

function Post() {
  const { id } = useParams();

  return (
    <div>
      <h1>Post {id}</h1>
      <p>This would show the full post content for ID {id}.</p>
    </div>
  );
}

export default Post;

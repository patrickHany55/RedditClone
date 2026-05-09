import { Link } from "react-router-dom";

const communities = ["reactjs", "webdev", "javascript", "frontend", "design"];

function Communities() {
  return (
    <div>
      <h1>Communities</h1>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {communities.map((c) => (
          <li key={c} style={{ marginBottom: 8 }}>
            <Link to={`/communities/${c}`} style={{ color: '#0077cc', textDecoration: 'none' }}>r/{c}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Communities;

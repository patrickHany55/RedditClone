import { useState, useEffect } from "react";
import PostCard from "../components/ui/PostCard";
import { getPopularPosts } from "../models/postModel";

const MOCK_TRENDING = [
  {
    id: 1,
    title: "Oscars moving to YouTube",
    subtitle: "Oscars Moving from ABC to YouTube TV",
    bg: "linear-gradient(to right, #f6d365 0%, #fda085 100%)", // Mock gold gradient
    community: "r/movies",
    icon: "🎬"
  },
  {
    id: 2,
    title: "Bondi suspect charged",
    subtitle: "Alleged Bondi shooter charged with 59...",
    bg: "linear-gradient(to right, #43e97b 0%, #38f9d7 100%)", // Mock green gradient
    community: "r/australia",
    icon: "🇦🇺"
  },
  {
    id: 3,
    title: "Barbara Rose Johns statue",
    subtitle: "U.S. Capitol unveils statue of teen civil ri...",
    bg: "linear-gradient(120deg, #d4fc79 0%, #96e6a1 100%)", // Mock lime gradient
    community: "r/news",
    icon: "📰"
  },
  {
    id: 4,
    title: "Gil Gerard dies at 82",
    subtitle: "Gil Gerard, Star of 'Buck Rogers'...",
    bg: "linear-gradient(to right, #4facfe 0%, #00f2fe 100%)", // Mock blue gradient
    community: "r/television",
    icon: "📺"
  }
];

function Popular() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Hot');

  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true);
        // We can use the 'popular' endpoint or just 'hot' logic
        const res = await getPopularPosts();
        const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        if (Array.isArray(list)) {
          setPosts(list);
        } else {
          setPosts([]);
        }
      } catch (err) {
        console.error("Failed to fetch popular posts", err);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, [filter]);

  return (
    <div className="popular-container">
      {/* Trending Carousel */}
      <section className="popular-header">
        <div className="trending-carousel">
            {MOCK_TRENDING.map(item => (
                <div 
                    key={item.id} 
                    className="trending-card"
                    style={{ background: item.bg }} // Using gradient as placeholder for image
                >
                    <div className="trending-card-overlay">
                        <h3 className="trending-title">{item.title}</h3>
                        <p className="trending-subtitle">{item.subtitle}</p>
                        <div className="trending-meta">
                            <div className="trending-icon">{item.icon}</div>
                            <span className="trending-community">{item.community} and more</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </section>

      {/* Filter Bar */}
      <div className="popular-filters">
        <button 
            className={`filter-pill ${filter === 'Hot' ? 'active' : ''}`}
            onClick={() => setFilter('Hot')}
        >
            🔥 Hot
        </button>
        <button 
            className={`filter-pill ${filter === 'Everywhere' ? 'active' : ''}`}
            onClick={() => setFilter('Everywhere')}
        >
            🌐 Everywhere
        </button>
        <button 
            className={`filter-pill ${filter === 'New' ? 'active' : ''}`}
            onClick={() => setFilter('New')}
        >
            ✨ New
        </button>
         <button 
            className={`filter-pill ${filter === 'Top' ? 'active' : ''}`}
            onClick={() => setFilter('Top')}
        >
            🔝 Top
        </button>
       
      </div>

      {/* Feed */}
      <div className="popular-feed">
        {loading ? (
            <div style={{color: '#d7dadc', padding: 20}}>Loading posts...</div>
        ) : posts.length === 0 ? (
            <div style={{color: '#d7dadc', padding: 20}}>No popular posts found.</div>
        ) : (
            posts.map(post => (
                <PostCard key={post._id} post={post} />
            ))
        )}
      </div>
    </div>
  );
}

export default Popular;

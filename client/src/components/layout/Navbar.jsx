import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import AskModal from "../features/AskModal";
import GetAppModal from "../features/GetAppModal";

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const [isGetAppModalOpen, setIsGetAppModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <header className="topbar">
        <div className="app-container">
          <div className="topbar-logo">
            <div className="logo-circle">
              <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 20, height: 20 }}>
                 <path fillRule="evenodd" d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0zm0 2a8 8 0 100 16 8 8 0 000-16zM6 9a1 1 0 100 2 1 1 0 000-2zm8 0a1 1 0 100 2 1 1 0 000-2zm-6.09 4.39a.75.75 0 011.06-1.06 2.006 2.006 0 004.06 0 .75.75 0 111.5 0 3.506 3.506 0 01-7.06 0 .75.75 0 01.44.06z" clipRule="evenodd" />
              </svg>
            </div>
            <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px' }}>reddit</span>
          </div>

          <div className="topbar-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              placeholder="Find anything" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
            />
          </div>

          <button 
            className="nav-btn-secondary" 
            style={{ marginLeft: 12, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}
            onClick={() => setIsAskModalOpen(true)}
          >
            Ask 🤖
          </button>

          <nav style={{ marginLeft: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
            <button 
              className="nav-btn-secondary" 
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              onClick={() => setIsGetAppModalOpen(true)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M9 3v18"/><path d="M15 9h-4"/><path d="M15 15h-4"/></svg>
              Get App
            </button>
            
            {isAuthenticated ? (
              <>
                <Link to={user?.username ? `/u/${user.username}` : "/"} className="user-avatar-container">
                  <img 
                    src={user?.avatar || "https://www.redditstatic.com/avatars/defaults/v2/avatar_default_1.png"} 
                    alt={user?.username ? `u/${user.username}` : "User profile"} 
                    className="nav-user-avatar" 
                  />
                </Link>
                <button onClick={logout} className="nav-btn-primary">Log Out</button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-btn-primary" style={{ textDecoration: 'none' }}>Log In</Link>
                <Link to="/register" className="nav-btn-secondary" style={{ textDecoration: 'none' }}>Sign Up</Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <AskModal isOpen={isAskModalOpen} onClose={() => setIsAskModalOpen(false)} />
      <GetAppModal isOpen={isGetAppModalOpen} onClose={() => setIsGetAppModalOpen(false)} />
    </>
  );
}

export default Navbar;

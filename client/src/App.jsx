import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout.jsx";
import Home from "./pages/Home.jsx";
import PostDetails from "./pages/PostDetails.jsx";
import CreatePost from "./pages/CreatePost.jsx";
import CreateCommunity from "./pages/CreateCommunity.jsx";
import Communities from "./pages/Communities.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import Profile from "./pages/Profile.jsx";
import Community from "./pages/Community.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Explore from "./pages/Explore.jsx";
import Popular from "./pages/Popular.jsx";
import Placeholder from "./pages/Placeholder.jsx";
import SavedPosts from "./pages/SavedPosts.jsx";
import { CommunityProvider } from "./context/CommunityContext.jsx";

function App() {
  return (
    <CommunityProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="popular" element={<Popular />} />
            <Route path="posts/:id" element={<PostDetails />} />
            <Route path="create" element={<CreatePost />} />
            <Route path="communities/create" element={<CreateCommunity />} />
            <Route path="communities" element={<Communities />} />
            <Route path="communities/:name" element={<Community />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="u/:username" element={<Profile />} />
            <Route path="explore" element={<Explore />} />
            <Route path="saved" element={<SavedPosts />} />
            <Route path="about" element={<Placeholder title="About" />} />
            <Route path="advertise" element={<Placeholder title="Advertise" />} />
            <Route path="dev" element={<Placeholder title="Developer Platform" />} />
            <Route path="pro" element={<Placeholder title="Reddit Pro" />} />
            <Route path="help" element={<Placeholder title="Help" />} />
            <Route path="blog" element={<Placeholder title="Blog" />} />
            <Route path="careers" element={<Placeholder title="Careers" />} />
            <Route path="press" element={<Placeholder title="Press" />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CommunityProvider>
  );
}

export default App;

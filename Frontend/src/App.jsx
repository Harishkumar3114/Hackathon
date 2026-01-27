import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Admin from './pages/Admin';
import Editor from './pages/Editor';
import Analytics from './pages/Analytics';
import PublicHub from './pages/PublicHub';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-white selection:bg-accent selection:text-black">
        <Routes>
          {/* 1. Admin Page: Hub Creation [cite: 24] */}
          <Route path="/" element={<Admin />} />
          
          {/* <Route path="/edit/:token" element={<Editor />} />
          
          <Route path="/stats/:token" element={<Analytics />} />
          
          <Route path="/:slug" element={<PublicHub />} /> */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
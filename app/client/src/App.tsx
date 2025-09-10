// App.tsx
import { Routes, Route, Link } from "react-router-dom";
import Home from "./views/home";

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
      <nav className="p-4 flex gap-4">
        <Link to="/" className="hover:underline">Home</Link>
        <Link to="/about" className="hover:underline">About</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </div>
  );
}

export default App;

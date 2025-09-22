// App.tsx
import { Routes, Route, Link } from "react-router-dom";
import Home from "./views/home";
import Login from "./views/login";
import Signup from "./views/signup";
import Editor from "./views/editor";
import { useState } from "react";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  
  return (
    <div className="bg-gray-50">
      <main>
        <Routes>
          <Route path="/" element={isLoggedIn ? <Home /> : <Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/editor" element={<Editor />} />
          <Route path="/editor/:documentId" element={<Editor />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

// App.tsx
import { Routes, Route, Link } from "react-router-dom";
import Home from "./views/home";
import Login from "./views/login";
import Signup from "./views/signup";
import { useState } from "react";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Set to true for development to see the dashboard
  
  return (
    <div className="bg-gray-50">
      <main>
        <Routes>
          {/* <Route path="/" element={isLoggedIn ? <Home /> : <Login />} /> */}
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

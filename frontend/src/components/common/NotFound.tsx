// src/pages/NotFound.tsx
import React from "react";
import { Link } from "react-router-dom";

const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-6xl font-bold text-primary">404</h1>
      <p className="text-xl mt-4">Page Not Found</p>

      <div className="flex items-center mt-6 gap-3">
        <p>No such page exists</p>
        <Link to="/" className="text-primary underline">
        Go back home
        </Link>
      </div>
      
    </div>
  );
};

export default NotFound;

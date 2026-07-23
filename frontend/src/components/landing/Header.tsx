import React, { useState } from "react";
import { School, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "../theme/ThemeToggle";
import { NavLink, useNavigate } from "react-router-dom";

export const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About Us", path: "/about" },
    { name: "Pricing", path: "/pricing" },
    
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-background/70 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-4">
        {/* === Logo === */}
        <div
          className="flex items-center gap-2 flex-1 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <School className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold text-foreground">Learnaz</span>
        </div>

        {/* === Center: Nav === */}
        <nav className="hidden md:flex items-center justify-center gap-8 flex-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </nav>

        {/* === Right Section === */}
        <div className="flex items-center justify-end gap-4 flex-1">
          <div className="hidden lg:flex items-center gap-4">
           <Button variant="outline" onClick={()=>(navigate('/contact'))}>Contact Us</Button>
            <Button className="bg-primary px-6 text-primary-foreground hover:bg-primary/80 transition-all" onClick={()=>(navigate('/login'))}>
              Login
            </Button>
          </div>

          <ThemeToggle />

          <button
            className="lg:hidden flex items-center justify-center text-foreground focus:outline-none"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* === Mobile Dropdown === */}
      <div
        className={`lg:hidden bg-background/70 backdrop-blur-sm border-t border-border transition-all duration-300 overflow-hidden ${
          menuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="flex flex-col items-center gap-5 py-6">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `text-base font-medium transition-colors ${
                  isActive
                    ? "text-primary border-b-2 border-primary pb-1"
                    : "text-muted-foreground hover:text-foreground"
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}

          <div className="flex flex-col gap-3 w-[50%]">
            <Button variant="outline" onClick={()=>(navigate('/contact'))}>
              Contact Us
            </Button>
            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/80 transition-all"
            onClick={()=>(navigate('/login'))}>
              Login
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
};

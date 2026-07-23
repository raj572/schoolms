"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Droplet, Lollipop } from "lucide-react"; // Droplet as red theme icon

const THEMES = ["light", "dark", "dark-red"];

export default function ThemeToggle(): JSX.Element {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null; // prevent hydration issues

  const currentTheme = resolvedTheme || theme;

  const handleToggle = () => {
    const currentIndex = THEMES.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % THEMES.length;
    setTheme(THEMES[nextIndex]);
  };

  const getIcon = () => {
    if (currentTheme === "dark") return <Sun className="size-4" />;
    if (currentTheme === "dark-red") return <Lollipop className="size-4" />;
    return <Moon className="size-4" />;
  };

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={handleToggle}
      className="text-primary hover:bg-muted p-2 rounded-xl cursor-pointer transition duration-300"
    >
      {getIcon()}
    </button>
  );
}

import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

const HomeLayout = () => {
  const location = useLocation();

  // Scroll to top when route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div>
      <Header />
      <main>
        <Outlet /> {/* This is where Landing/About/etc. will be rendered */}
      </main>
      <Footer />
    </div>
  );
};

export default HomeLayout;

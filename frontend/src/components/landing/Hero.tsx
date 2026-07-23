import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useTheme } from "next-themes";
import { useNavigate } from "react-router-dom";

import HeroImgLight from "../landing/images/heroimglight.png";
import HeroImgDark from "../landing/images/heroimgdark.png";
import HeroImgPink from "../landing/images/heroimgpink.png";

const Hero = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let requestId: number;
    const maxScroll = 100;
    const startTilt = 8;

    const handleScroll = () => {
      if (requestId) cancelAnimationFrame(requestId);
      requestId = requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const tilt = Math.max(0, startTilt - (scrollY / maxScroll) * startTilt);
        if (imageRef.current) {
          imageRef.current.style.transform = `perspective(1200px) rotateX(${tilt}deg)`;
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(requestId);
    };
  }, []);

  const getHeroImage = () => {
    switch (theme) {
      case "dark":
        return HeroImgDark;
      case "dark-red":
        return HeroImgPink;
      case "light":
      default:
        return HeroImgLight;
    }
  };

  return (
    <section className="relative w-full min-h-screen px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center overflow-hidden py-10 md:py-20">
      {/* === 3D Grid Background === */}
      <div className="absolute inset-0 -z-10 bg-background overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
            transform:
              "perspective(800px) rotateX(75deg) translateY(120px) scale(1.5)",
            transformOrigin: "center top",
            opacity: 0.25,
          }}
        />
      </div>

      {/* === Hero Text === */}
      <div className="relative z-10 max-w-3xl mt-2 md:mt-10 lg:mt-20">
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-foreground mb-4 leading-tight">
          <span className="text-primary">All-in-One</span>
          <br /> School Powerhouse
        </h1>

        <p className="text-xs sm:text-base md:text-lg text-muted-foreground mb-8 px-2 sm:px-6">
          Say goodbye to scattered tools and manual work. With our all-in-one
          School ERP, you can manage students, teachers, classes, exams, and
          fees effortlessly, all from one place.
        </p>

        <div className="flex justify-center">
          <Button
              onClick={() => navigate('/signup')}
              className="group relative text-sm sm:text-base px-4 sm:px-6 py-4 sm:py-5 
                        bg-primary text-primary-foreground hover:bg-primary/90 
                        transition-all duration-300 ease-out 
                        shadow-[0_0_20px_hsl(var(--primary)/60%)] 
                        hover:shadow-[0_0_40px_hsl(var(--primary)/70%)] 
                        hover:-translate-y-1 active:translate-y-0"
            >
              Book a Demo
              <ArrowRight
                className="ml-2 h-4 w-4 -rotate-45 "
              />
            </Button>

        </div>
      </div>

      {/* === Dashboard Image with Smooth Tilt === */}
      <div className="relative z-10 mt-12 sm:mt-16 md:mt-20 w-full flex justify-center">
        <div
          ref={imageRef}
          className="image-container relative w-[95%] sm:w-[90%] max-w-7xl rounded-xl sm:rounded-2xl overflow-hidden shadow-[0_0_120px_hsl(var(--primary)/60%)] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform"
          style={{
            transform: "perspective(1200px) rotateX(8deg)",
          }}
        >
          <img
            src={getHeroImage()}
            alt="Dashboard preview"
            className="w-full h-full rounded-xl sm:rounded-2xl shadow-2xl"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;

import React from "react";
import logo1 from "../landing/images/logo1.png";
import logo2 from "../landing/images/logo2.png";
import logo3 from "../landing/images/logo3.png";
import logo4 from "../landing/images/logo4.png";
import logo5 from "../landing/images/logo5.png";
import logo6 from "../landing/images/logo6.png";
import LogoLoop from "./anim/LogoLoop";

const Partners = () => {
  const logos = [
    { src: logo1, alt: "Partner 1" },
    { src: logo2, alt: "Partner 2" },
    { src: logo3, alt: "Partner 3" },
    { src: logo4, alt: "Partner 4" },
    { src: logo5, alt: "Partner 5" },
    { src: logo6, alt: "Partner 6" },
  ];

  return (
    <section className="relative w-full text-center py-10 sm:py-20 px-4 overflow-hidden bg-background ">
      {/* === Smooth Blend with Hero Glow === */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[hsl(var(--background))] via-[hsl(var(--background)/80%)] to-transparent pointer-events-none" />

      {/* === Content === */}
      <div className="relative z-10 max-w-7xl mx-auto">
       

        <p className=" text-muted-foreground text-lg max-w-2xl mx-auto">
          Trusted by 500+ schools & institute owners.
        </p>

        <div className="mt-14 sm:mt-20  flex justify-center">
          <LogoLoop logos={logos}  speed={40}  />
        </div>
      </div>
    </section>
  );
};

export default Partners;

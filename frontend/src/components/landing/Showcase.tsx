import React from "react";
import { useTheme } from "next-themes";
import Show1Light from "../landing/images/show1light.png";
import Show1Dark from "../landing/images/show1dark.png";
import Show1Pink from "../landing/images/show1pink.png"
import Show2Light from "../landing/images/show2light.png";
import Show2Dark from "../landing/images/show2dark.png";
import Show2Pink from "../landing/images/show2pink.png"

const Showcase = () => {
  const { theme } = useTheme();

  const getFrontImage = () => {
    switch (theme) {
      case "dark":
        return Show1Dark;
      case "dark-red":
        return Show1Pink;
      case "light":
      default:
        return Show1Light;
    }
  };
  const getFrontImage2 = () => {
    switch (theme) {
      case "dark":
        return Show2Dark;
      case "dark-red":
        return Show2Pink;
      case "light":
      default:
        return Show2Light;
    }
  };
  const getBackImage = () => {
    switch (theme) {
      case "dark":
        return Show1Light;
      case "dark-red":
        return Show1Dark;
      case "light":
      default:
        return Show1Dark;
    }
  };
  const getBackImage2 = () => {
    switch (theme) {
      case "dark":
        return Show2Light;
      case "dark-red":
        return Show2Dark;
      case "light":
      default:
        return Show2Dark;
    }
  };



  return (
    <section className="relative w-full bg-foreground text-background py-16 md:py-24 overflow-hidden">
      {/* Continuous subtle grid background using shadcn color tokens */}
      <div
        className="absolute inset-0 z-0 opacity-[0.08]"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)
          `,
          backgroundSize: "70px 70px",
        }}
      />

      <div className="relative z-10 container mx-auto px-4 md:px-8 flex flex-col gap-10 md:gap-40">
        {/* Section One — Interface */}
        <div className="flex flex-col-reverse lg:flex-row items-center gap-12 md:gap-20">
          {/* Text Section */}
          <div className="w-full lg:w-1/2 text-center lg:text-left">
            <h2 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6 leading-tight">
              Interface, <br /> streamlined for schools.
            </h2>

            <p className="text-secondary mb-3 md:mb-4 text-sm md:text-base">
              Navigate through student records, attendance, and class schedules with ease.
              Manage everything from one dashboard built for speed and clarity.
            </p>

            <p className="text-secondary text-sm md:text-base">
              View classes, teachers, and students in structured lists or detailed boards — 
              helping you focus on what matters most.
            </p>
          </div>

          {/* Image Section */}
          <div className="relative w-full lg:w-1/2 flex justify-center perspective-[2000px]">
            {/* Glow */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[85%] h-[85%] md:w-[90%] md:h-[90%] rounded-full bg-primary blur-[120px]" />
            </div>

            <div className="relative w-[90%] sm:w-[80%] md:w-[70%] lg:w-[100%]">
              {/* Back image */}
              <img
                src={getBackImage()}
                alt="Back Image"
                className="rounded-2xl w-full  translate-y-4 translate-x-4 md:translate-y-8 md:translate-x-8 shadow-[0_0_100px_hsl(var(--primary)/0.5)] transition-transform duration-700 ease-in-out"
                style={{
                  transform: "rotateY(-30deg) rotateX(10deg)",
                }}
              />

              {/* Front image */}
              <img
                src={getFrontImage()}
                alt="Front Image"
                className="absolute top-4 left-4 md:top-10 md:left-10 rounded-2xl w-full  transition-transform duration-700 ease-in-out"
                style={{
                  transform: "rotateY(-30deg) rotateX(10deg)",
                }}
              />
            </div>
          </div>
        </div>

        {/* Section Two — Reports & Analytics */}
        <div className="flex flex-col lg:flex-row items-center gap-12 md:gap-20">
          {/* Image Section */}
          <div className="relative w-full lg:w-1/2 flex justify-center perspective-[2000px] order-2 lg:order-1">
            {/* Glow */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[85%] h-[85%] md:w-[90%] md:h-[90%] rounded-full bg-primary blur-[120px]" />
            </div>

            <div className="relative w-[90%] sm:w-[80%] md:w-[70%] lg:w-[100%]">
              {/* Back Image 2*/}
              <img
                src={getBackImage2()}
                alt="Back Image 2"
                className="rounded-2xl w-full opacity-95 translate-y-4 -translate-x-4 md:translate-y-8 md:-translate-x-8 transition-transform duration-700 ease-in-out"
                style={{
                  transform: "rotateY(30deg) rotateX(10deg)",
                }}
              />

              {/* Front image 2*/}
              <img
                src={getFrontImage2()}
                alt="Front image 2"
                className="absolute top-4 right-4 md:top-10 md:right-10 rounded-2xl w-full shadow-[0_0_50px_hsl(var(--primary)/0.5)] transition-transform duration-700 ease-in-out"
                style={{
                  transform: "rotateY(30deg) rotateX(10deg)",
                }}
              />
            </div>
          </div>

          {/* Text Section */}
          <div className="w-full lg:w-1/2 text-center lg:text-left order-1 lg:order-2">
            <h2 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6 leading-tight">
              Reports & Analytics <br /> made effortless.
            </h2>

            <p className="text-secondary mb-3 md:mb-4 text-sm md:text-base">
              Get instant insights into student performance, attendance trends,
              and fee collections — all in one intuitive dashboard.
            </p>

            <p className="text-secondary text-sm md:text-base">
              Generate automated reports, visualize progress through detailed charts,
              and make data-driven decisions with clarity and confidence.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Showcase;

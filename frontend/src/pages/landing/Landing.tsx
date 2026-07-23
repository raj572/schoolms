import React from "react";
import Hero from "@/components/landing/Hero";
import Partners from "@/components/landing/Partners";
import Showcase from "@/components/landing/Showcase";
import PricingSection from "@/components/landing/PricingSection";
import Testimonials from "@/components/landing/Testimonials";
import FAQSection from "@/components/landing/FAQSection";

const Landing = () => {
  return (
    <div>
      <Hero />
      <Partners />
      <Showcase />
      <PricingSection />
      <Testimonials />
      <FAQSection />
    </div>
  );
};

export default Landing;

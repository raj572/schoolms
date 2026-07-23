import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { GraduationCap, Users, Globe2, Settings, ArrowRight } from "lucide-react";

const About = () => {
  return (
    <div className="py-20 bg-background ">
      {/* === Hero Section === */}
      <section className="relative text-center px-6 md:px-10">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-background -z-10" />
        <div className="max-w-3xl mx-auto py-20">
          {/* Background grid */}
      <div
        className="absolute inset-0 z-0  opacity-[0.06]"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--primary)) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--primary)) 1px, transparent 1px)
          `,
          backgroundSize: "70px 70px",
        }}
      />
          <h1 className="text-4xl md:text-5xl  font-bold text-foreground mb-4">
            About Us
          </h1>
          <p className="text-muted-foreground text-xl mb-8">
            Learnaz simplifies school management with modern tools for
            attendance, exams, communication, and administration — all in one
            intuitive dashboard.
          </p>
          <div className="flex justify-center relative z-10">
            <Button 
              onClick={() => window.open("https://lazfort.com", "_blank", "noopener,noreferrer")}
              className="text-sm sm:text-base px-4 sm:px-6 py-4 sm:py-5 bg-primary text-primary-foreground hover:bg-primary/80 transition-all shadow-[0_0_20px_hsl(var(--primary)/60%)]"
            >
              Main Company
              <ArrowRight className="ml-2 h-4 w-4 -rotate-45" />
            </Button>
          </div>
        </div>
      </section>

      <div className="px-4 sm:px-6 lg:px-8 ">
        {/* === Stats Section === */}
      <section className="mt-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto text-center">
          {[
            { label: "Schools Using Learnaz", value: "1200+" },
            { label: "Teachers Empowered", value: "25K+" },
            { label: "Students Managed", value: "1.5M+" },
            { label: "Reports Generated", value: "500K+" },
          ].map((stat, index) => (
            <Card key={index} className="border-border/60 shadow-sm">
              <CardContent className="py-6">
                <h3 className="text-2xl font-bold text-foreground">
                  {stat.value}
                </h3>
                <p className="text-muted-foreground text-sm">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* === About Section === */}
      <section className="mt-24 max-w-5xl mx-auto ">
        <h2 className="text-3xl font-bold mb-4">
          Building Smarter Solutions for Education
        </h2>
        <p className="text-muted-foreground text-lg leading-relaxed">
          We built Learnaz to eliminate the everyday chaos of managing schools.
          From attendance tracking to exam scheduling and communication,
          everything runs smoothly — helping educators focus on what truly
          matters: <span className="text-foreground font-medium">teaching and learning.</span>
        </p>
        <p className="text-muted-foreground text-lg mt-4 leading-relaxed">
          Founded in 2024, our mission is to help institutions of all sizes
          transition into the digital era effortlessly. Learnaz continues to
          evolve, shaped by feedback from schools, teachers, and parents.
        </p>
      </section>

      {/* === Timeline Section === */}
      <section className="mt-24 max-w-5xl mx-auto ">
        <h2 className="text-3xl font-bold mb-10 text-center">
          Our Journey So Far
        </h2>
        <div className="space-y-10 relative border-l border-border pl-6">
          {[
            {
              year: "2024",
              title: "The Idea is Born",
              desc: "Learnaz started as a simple idea — to make school management efficient and paperless.",
              icon: <GraduationCap className="h-5 w-5 text-primary" />,
            },
            {
              year: "2024 - October",
              title: "Prototype Launch",
              desc: "Our small team built the first functional version of Learnaz, focusing on attendance and communication modules.",
              icon: <Settings className="h-5 w-5 text-primary" />,
            },
            {
              year: "2025 - January",
              title: "Scaling Up",
              desc: "We introduced analytics, fee management, and cloud-based storage features.",
              icon: <Users className="h-5 w-5 text-primary" />,
            },
            {
              year: "2025 - Present",
              title: "Expanding Globally",
              desc: "Learnaz is now used by schools across multiple regions, empowering thousands of educators daily.",
              icon: <Globe2 className="h-5 w-5 text-primary" />,
            },
          ].map((item, index) => (
            <div key={index} className="relative">
              <div className="absolute -left-[38px] bg-background p-2 rounded-full border border-border">
                {item.icon}
              </div>
              <h4 className="text-sm text-muted-foreground">{item.year}</h4>
              <h3 className="text-xl font-semibold text-foreground mt-1">
                {item.title}
              </h3>
              <p className="text-muted-foreground mt-2">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* === Values Section === */}
      <section className="mt-24 max-w-5xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4">Our Core Values</h2>
        <p className="text-muted-foreground text-lg mb-12">
          What drives us forward every single day.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Innovation",
              desc: "We constantly push to improve how schools operate through simple, smart technology.",
            },
            {
              title: "Reliability",
              desc: "From data security to uptime, we prioritize building a platform schools can truly depend on.",
            },
            {
              title: "Empathy",
              desc: "We listen, learn, and build with the needs of educators and students in mind.",
            },
          ].map((val, index) => (
            <Card key={index} className="shadow-sm border-border/60">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2 text-foreground">
                  {val.title}
                </h3>
                <p className="text-muted-foreground">{val.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
      </div>
    </div>
  );
};

export default About;

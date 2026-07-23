import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const testimonials = [
  {
    name: "Sarah Mitchell",
    handle: "@smitchell_edu",
    avatar: "SM",
    text: "Learnaz transformed how we manage our school. The attendance tracking and parent communication features have saved us countless hours each week.",
  },
  {
    name: "David Chen",
    handle: "@dchen_principal",
    avatar: "DC",
    text: "Absolutely loving Learnaz. ",
  },
  {
    name: "Maria Rodriguez",
    handle: "@mrodriguez_teacher",
    avatar: "MR",
    text: "The parent portal is incredible. Parents can now access student progress, assignments, and communicate with teachers 24/7.",
  },
  {
    name: "James Williams",
    handle: "@jwilliams_it",
    avatar: "JW",
    text: "I've been skeptical about school management systems, but Learnaz has proven itself. The security features and data backup give us peace of mind.",
  },
  {
    name: "Emily Thompson",
    handle: "@ethompson_admin",
    avatar: "ET",
    text: "Really impressed with Learnaz so far. It has the right balance of features without overwhelming staff. The mobile app is fantastic for on-the-go access. Highly recommend.",
  },
  {
    name: "Robert Kumar",
    handle: "@rkumar_superintendent",
    avatar: "RK",
    text: "Learnaz is the best platform I've used this year. Easy integration with our existing systems. The reporting features help us make informed decisions across all our campuses.",
  },
  {
    name: "Lisa Anderson",
    handle: "@landerson_teacher",
    avatar: "LA",
    text: "Don't take it from me: Learnaz is magic.",
  },
  {
    name: "Michael Brooks",
    handle: "@mbrooks_admin",
    avatar: "MB",
    text: "I just received an invite to Learnaz, and wow! The onboarding process was smooth, and I can already see this transforming our school operations.",
  },
  {
    name: "Jennifer Lee",
    handle: "@jlee_coordinator",
    avatar: "JL",
    text: "Learnaz probably saved our school thousands in administrative costs. The automation of routine tasks and digital record-keeping is phenomenal.",
  },
];

export const Testimonials = () => {
  return (
    <section className="relative w-full py-20 bg-background text-foreground overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 z-0 opacity-[0.06]"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--primary)) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--primary)) 1px, transparent 1px)
          `,
          backgroundSize: "70px 70px",
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6">
        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-4">
            Loved by <span className="text-primary">educators</span> and innovators
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
            Schools, teachers, and administrators across the country trust our ERP
            system to simplify daily school management
          </p>
        </div>

        {/* Masonry Grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-3 sm:gap-4 [column-fill:_balance]">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="mb-3 break-inside-avoid bg-card border border-border p-5 sm:p-6 
              transition-all duration-300 ease-in-out hover:-translate-y-1 
              hover:shadow-[0_0_25px_hsl(var(--primary)/40%)] hover:border-primary/40"
            >
              <div className="flex items-start gap-3 mb-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="" alt={testimonial.name} />
                  <AvatarFallback className="bg-accent text-accent-foreground text-sm">
                    {testimonial.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm">
                    {testimonial.name}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {testimonial.handle}
                  </p>
                </div>
              </div>
              <p className="text-foreground text-sm leading-relaxed">
                {testimonial.text}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

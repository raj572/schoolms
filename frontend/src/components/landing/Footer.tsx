import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Facebook, Instagram, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate();
  return (
    <footer className="bg-background pt-10 md:pt-20 pb-10 px-4 sm:px-6 lg:px-8">
      {/* === CTA Section === */}
      <div className="max-w-7xl mx-auto text-center py-10 sm:py-12 rounded-2xl bg-gradient-to-r from-primary to-primary/80 mb-10 md:mb-16 px-4 sm:px-8">

        <h2 className="text-2xl md:text-3xl font-semibold text-background mb-4">
          Simplify your school management today
        </h2>
        <p className="max-w-2xl mx-auto text-background/80 mb-6 text-sm sm:text-base">
          Manage students, teachers, attendance, exams, and fees, all from one powerful platform.
          Start transforming your school operations today.
        </p>
        <Button 
          onClick={() => navigate('/signup')}
          className="text-sm sm:text-base px-4 sm:px-6 py-4 sm:py-5 bg-background text-primary font-medium hover:bg-background/90 transition-all shadow-[0_0_15px_hsl(var(--background)/30%)]">
          Book a Demo
          <ArrowRight className="ml-2 h-4 w-4 -rotate-45" />
        </Button>
      </div>

      <Separator className="mb-6 md:mb-12 opacity-40" />

      {/* === Footer Grid === */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:justify-between gap-12 text-muted-foreground text-sm">
        {/* === Left (Brand Info) === */}
        <div className="md:w-1/2 ">
          <h3 className="text-lg font-semibold text-foreground mb-3">Learnaz</h3>
          <p className="text-muted-foreground mb-6 max-w-sm">
            A complete School ERP solution designed to make academic and administrative
            management easier, smarter, and more connected.
          </p>
          <div className="flex items-center gap-4 justify-center md:justify-start">
            <a 
              href="https://www.facebook.com/profile.php?id=61583082576352" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              <Facebook size={18} />
            </a>
            <a 
              href="https://www.instagram.com/learnaz.lazfort/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              <Instagram size={18} />
            </a>
            <a 
              href="https://www.youtube.com/@Learnaz-Lazfort" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* === Right (Links + QR) === */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 md:w-1/2">
          {/* Company */}
          <div>
            <h4 className="text-foreground font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              <li><a href="/about" className="hover:text-foreground transition-colors">About Us</a></li>
              <li><a href="/contact" className="hover:text-foreground transition-colors">Contact</a></li>
              <li><a href="/pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
              <li><a href="https://lazfort.com/" className="hover:text-foreground transition-colors">Lazfort</a></li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-foreground font-semibold mb-4">Features</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-foreground transition-colors">Student Management</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Attendance Tracking</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Examination System</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Fee Management</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Reports & Analytics</a></li>
            </ul>
          </div>

          {/* QR App Download */}
          <div className="flex flex-col items-center md:items-start justify-start">
            <h4 className="text-foreground font-semibold mb-4">Get Our App</h4>
            <div className="bg-muted p-3 rounded-lg">
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://learnaz.example.com"
                alt="Download Learnaz App"
                className="w-28 h-28 object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      {/* === Bottom === */}
      <div className="mt-16 text-center text-muted-foreground text-xs sm:text-sm">
        © {new Date().getFullYear()} Learnaz. All rights reserved.
      </div>
    </footer>
  );
}

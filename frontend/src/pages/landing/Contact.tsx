import { Button } from '@/components/ui/button'
import React, { useState } from 'react'
import { Loader2, Phone, MapPin, Clock, Facebook, Instagram } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { submitContactForm, ContactFormData } from "@/services/contactApiService";

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<ContactFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.subject || !formData.message) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await submitContactForm(formData);
      
      if (response.status) {
        toast({
          title: 'Message Sent Successfully!',
          description: response.message || 'Thank you for contacting us. We will get back to you soon.',
        });
        
        // Reset form
        setFormData({
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
        });
      } else {
        throw new Error(response.message || 'Failed to send message');
      }
    } catch (error: any) {
      console.error('Contact form submission error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || error.message || 'Failed to send message. Please try again later.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className='py-10 md:py-20  bg-background'>
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
                 Contact Us
               </h1>
               <p className="text-muted-foreground text-xl mb-8">
                 Have questions or need a custom plan? Our team is here to help your school
                  transition smoothly into smarter management.
               </p>
              
             </div>
           </section>

<div className="max-w-6xl mx-auto pt-5 md:pt-20 px-4 sm:px-6 lg:px-8  grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-start">
        
        {/* === Left: Form === */}
        <div>
          <h2 className="text-xl md:text-2xl font-bold mb-2 text-foreground">
            Send a meassage 
          </h2>
          <p className="text-muted-foreground mb-8">
            Have questions or want to learn more about Learnaz ERP?  
            Fill out the form below, our team will reach out shortly.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input 
                name="first_name"
                placeholder="First Name *" 
                required 
                value={formData.first_name}
                onChange={handleInputChange}
                disabled={isSubmitting}
              />
              <Input 
                name="last_name"
                placeholder="Last Name *" 
                required 
                value={formData.last_name}
                onChange={handleInputChange}
                disabled={isSubmitting}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input 
                name="email"
                type="email" 
                placeholder="Email *" 
                required 
                value={formData.email}
                onChange={handleInputChange}
                disabled={isSubmitting}
              />
              <Input 
                name="phone"
                placeholder="Phone Number" 
                value={formData.phone}
                onChange={handleInputChange}
                disabled={isSubmitting}
              />
            </div>
            <Input 
              name="subject"
              placeholder="Subject *" 
              required 
              value={formData.subject}
              onChange={handleInputChange}
              disabled={isSubmitting}
            />
            <Textarea 
              name="message"
              placeholder="Message *" 
              className="min-h-[150px]" 
              required 
              value={formData.message}
              onChange={handleInputChange}
              disabled={isSubmitting}
            />
            
            <Button 
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary/80 transition-all duration-300"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Message'
              )}
            </Button>
          </form>
        </div>

        {/* === Right: Contact Info === */}
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-8 md:p-10 text-left shadow-sm">
          <h3 className="text-lg font-semibold mb-6 text-foreground">Contact Information</h3>
          
          <div className="space-y-6 text-muted-foreground">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-primary mt-1" />
              <div>
                <p className="font-medium text-foreground">Address</p>
                <p>India</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-primary mt-1" />
              <div>
                <p className="font-medium text-foreground">Contact</p>
                <p>+91 9142109260</p>
                <p>learnaz@lazfort.com</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-primary mt-1" />
              <div>
                <p className="font-medium text-foreground">Office Hours</p>
                <p>24 x 7</p>
              </div>
            </div>

            {/* === Social Icons === */}
            <div className="pt-4">
              <p className="font-medium text-foreground mb-3">Stay Connected</p>
              <div className="flex gap-4 text-primary">
                <a 
                  href="https://www.facebook.com/profile.php?id=61583082576352" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary/70 transition"
                >
                  <Facebook className="h-5 w-5 cursor-pointer" />
                </a>
                <a 
                  href="https://www.instagram.com/learnaz.lazfort/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary/70 transition"
                >
                  <Instagram className="h-5 w-5 cursor-pointer" />
                </a>
                <a 
                  href="https://www.youtube.com/@Learnaz-Lazfort" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary/70 transition"
                >
                  <svg className="h-5 w-5 cursor-pointer" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    
    </div>
  )
}

export default Contact
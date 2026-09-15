import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { School, Loader2, Building, MapPin, Phone, Mail, Calendar, Globe } from "lucide-react";
import axios from "axios";

import { API_BASE_URL } from '@/lib/axios';

export const AdminSchoolSetupPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const userId = location.state?.userId || localStorage.getItem('user_id');
  const userEmail = location.state?.email || localStorage.getItem('email');
  const userPhone = location.state?.phone || localStorage.getItem('phone');

  const [formData, setFormData] = useState({
    name: "",
    email: userEmail || "",
    phone: userPhone || "",
    school_code: "",
    address: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
    board: "",
    affiliation_number: "",
    established_date: "",
    website: "",
    description: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "User ID not found. Please register again.",
      });
      navigate("/signup");
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast({
          variant: "destructive",
          title: "Authentication Required",
          description: "Please complete registration first.",
        });
        navigate("/signup");
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/registration/school/${userId}`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // Check if response is successful (status 200-299)
      if (response.status >= 200 && response.status < 300) {
        // Check if the backend returned success status
        const isSuccess = response.data?.status === true || response.data?.status === 'success';
        
        if (isSuccess) {
          toast({
            title: "Success!",
            description: response.data?.message || "School registered successfully! You can now login.",
          });

          // Clear temporary data
          localStorage.removeItem('user_id');
          localStorage.removeItem('token'); // Clear temporary token
          localStorage.removeItem('phone');
          
          // Redirect to login
          setTimeout(() => {
            navigate("/login", {
              state: { 
                email: userEmail,
                message: "School setup complete! Please login to access your administrator panel." 
              },
            });
          }, 1500);
          return; // Exit successfully
        }
      }

      // If we reach here, the response didn't indicate success
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: response.data?.message || "Failed to register school",
      });
    } catch (error: unknown) {
      console.error("School registration error:", error);
      
      // Handle axios errors properly
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message 
          || error.response?.data?.error 
          || error.message 
          || "Failed to register school. Please try again.";
        
        // Only show error toast for actual errors (status >= 400)
        if (error.response?.status && error.response.status >= 400) {
          toast({
            variant: "destructive",
            title: "Error",
            description: errorMessage,
          });
        } else {
          // Success case - don't show error toast
          if (error.response?.status && error.response.status < 400) {
            toast({
              title: "Success!",
              description: error.response?.data?.message || "School registered successfully!",
            });
            
            // Clear temporary data
            localStorage.removeItem('user_id');
            localStorage.removeItem('token');
            localStorage.removeItem('phone');
            
            // Redirect to login
            setTimeout(() => {
              navigate("/login", {
                state: { 
                  email: userEmail,
                  message: "School setup complete! Please login to access your administrator panel." 
                },
              });
            }, 1500);
          }
        }
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to register school. Please try again.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-white to-primary/5 p-4">
      <Card className="w-full max-w-4xl shadow-2xl">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <School className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">Setup Your School</CardTitle>
          <CardDescription className="text-base">
            Complete your school information to access the administrator panel
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* School Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Building className="h-5 w-5" />
                School Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* School Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">School Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="ABC International School"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>

                {/* School Code */}
                <div className="space-y-2">
                  <Label htmlFor="school_code">School Code (Optional)</Label>
                  <Input
                    id="school_code"
                    name="school_code"
                    type="text"
                    placeholder="SCH001"
                    value={formData.school_code}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>

                {/* School Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">School Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="info@abcschool.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>

                {/* School Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">School Phone *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>

                {/* Board */}
                <div className="space-y-2">
                  <Label htmlFor="board">Board *</Label>
                  <select
                    id="board"
                    name="board"
                    value={formData.board}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                    disabled={isLoading}
                    aria-label="Select school board"
                  >
                    <option value="">Select Board</option>
                    <option value="CBSE">CBSE</option>
                    <option value="ICSE">ICSE</option>
                    <option value="State Board">State Board</option>
                    <option value="IB">IB (International Baccalaureate)</option>
                    <option value="IGCSE">IGCSE</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Affiliation Number */}
                <div className="space-y-2">
                  <Label htmlFor="affiliation_number">Affiliation Number (Optional)</Label>
                  <Input
                    id="affiliation_number"
                    name="affiliation_number"
                    type="text"
                    placeholder="AFF123456"
                    value={formData.affiliation_number}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>

                {/* Established Date */}
                <div className="space-y-2">
                  <Label htmlFor="established_date">Established Date *</Label>
                  <Input
                    id="established_date"
                    name="established_date"
                    type="date"
                    value={formData.established_date}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>

                {/* Website */}
                <div className="space-y-2">
                  <Label htmlFor="website">Website (Optional)</Label>
                  <Input
                    id="website"
                    name="website"
                    type="url"
                    placeholder="https://www.abcschool.com"
                    value={formData.website}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* School Address */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                School Address
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Address */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    name="address"
                    type="text"
                    placeholder="123 Main Street"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>

                {/* City */}
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    name="city"
                    type="text"
                    placeholder="Mumbai"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>

                {/* State */}
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    name="state"
                    type="text"
                    placeholder="Maharashtra"
                    value={formData.state}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>

                {/* Country */}
                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    name="country"
                    type="text"
                    placeholder="India"
                    value={formData.country}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>

                {/* Pincode */}
                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode *</Label>
                  <Input
                    id="pincode"
                    name="pincode"
                    type="text"
                    placeholder="400001"
                    value={formData.pincode}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">School Description (Optional)</Label>
              <textarea
                id="description"
                name="description"
                rows={4}
                placeholder="Brief description about the school..."
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isLoading}
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Registering School...
                </>
              ) : (
                <>
                  <School className="mr-2 h-5 w-5" />
                  Complete School Setup
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSchoolSetupPage;


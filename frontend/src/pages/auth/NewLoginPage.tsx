import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/useAuthStore";
import axios from "axios";
import { Eye, EyeOff, Loader2, School } from "lucide-react";

import { API_BASE_URL } from '@/lib/axios';

export const NewLoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: location.state?.email || "",
    password: "",
  });

  // Show success message if coming from email verification
  useEffect(() => {
    if (location.state?.message) {
      toast({
        title: "Success!",
        description: location.state.message,
      });
    }
  }, [location.state, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: formData.email,
        password: formData.password,
      });

      if (response.data.status) {
        const { token, data } = response.data;

        // Save auth data to localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user_id', data.user_id);
        localStorage.setItem('email', data.email);
        localStorage.setItem('full_name', data.full_name);
        localStorage.setItem('role', data.role);
        localStorage.setItem('school_id', data.school_id || '');
        localStorage.setItem('email_verified', data.email_verified ? 'true' : 'false');
        localStorage.setItem('school_setup_completed', data.school_setup_completed ? 'true' : 'false');
        localStorage.setItem('subscription_active', data.subscription_active ? 'true' : 'false');
        localStorage.setItem('registration_status', data.registration_status);

        // Update auth store directly with the data we have
        useAuthStore.setState({
          authUser: {
            id: data.user_id,
            email: data.email,
            full_name: data.full_name,
            school_id: data.school_id || '',
            role: data.role,
            email_verified: data.email_verified === true,
            school_setup_completed: data.school_setup_completed === true,
            subscription_active: data.subscription_active === true,
            registration_status: data.registration_status,
          },
          isCheckingAuth: false,
        });

        toast({
          title: "Login Successful!",
          description: "Welcome back!",
        });

        // Check if administrator needs to complete school setup
        if (data.role === 'administrator' && !data.school_setup_completed) {
          navigate('/school-setup', {
            state: {
              userId: data.user_id,
              email: data.email
            }
          });
          return;
        }

        // Route to appropriate dashboard based on role
        // Special handling for warden - ensure they have school_id
        if (data.role === 'warden') {
          if (!data.school_id) {
            toast({
              variant: "destructive",
              title: "Login Error",
              description: "Warden account must be associated with a school",
            });
            setIsLoading(false);
            return;
          }
        }
        
        const dashboardRoute = `/${data.role}/dashboard`;
        navigate(dashboardRoute);
      } else {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: response.data.message || "Invalid credentials",
        });
      }
    } catch (error: unknown) {
      console.error("Login error:", error);
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
        : "Login failed. Please try again.";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-white to-primary/5 p-4">
      <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="space-y-3 text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <School className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">Welcome Back</CardTitle>
          <CardDescription className="text-base">
            Sign in to your account to continue
          </CardDescription>
          <CardDescription className="text-xs text-muted-foreground mt-2">
            Login available for: Administrator, Principal, Teacher, Student, Parent, Accountant, Librarian, Warden
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isLoading}
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password *</Label>
                <Link
                  to="/verify-otp"
                  className="text-sm text-primary hover:underline"
                  tabIndex={-1}
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
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
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary font-semibold hover:underline">
              Sign up
            </Link>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Already have a school?</span>
            </div>
          </div>

          {/* Button for existing registered users */}
          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => navigate('/login-with-school')}
            >
              <School className="mr-2 h-4 w-4" />
              Login with School & Role
            </Button>
            <p className="text-xs text-center text-gray-500">
              For users who have already completed school setup and subscription
            </p>
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-blue-800 dark:text-blue-200 text-center">
                <strong>Warden Login:</strong> Use your email and password provided by your principal. 
                If you haven't received your credentials, please contact your principal.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewLoginPage;


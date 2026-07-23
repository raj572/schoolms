import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { registrationApi } from "@/services/registrationApiService";
import { School, Loader2, Mail, CheckCircle2 } from "lucide-react";

export const SignupPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  
  // Two-step flow state
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
  });

  const [otp, setOtp] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Step 1: Send OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation


    setIsLoading(true);

    try {
      const response = await registrationApi.sendOTP({
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
      });

      if (response.status) {
        toast({
          title: "OTP Sent!",
          description: "Please check your email for the verification code.",
        });

        setOtpSent(true);
        setStep('otp');
        
        // Start countdown timer
        setCountdown(600); // 10 minutes
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        toast({
          variant: "destructive",
          title: "Failed to Send OTP",
          description: response.message || "Please try again",
        });
      }
    } catch (error: unknown) {
      console.error("Send OTP error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send OTP. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP and Register
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast({
        variant: "destructive",
        title: "Invalid OTP",
        description: "Please enter a 6-digit OTP",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await registrationApi.verifyOTP({
        email: formData.email,
        otp: otp,
      });

      if (response.status) {
        toast({
          title: "Success!",
          description: "Email verified! Please complete your school setup.",
        });

        // Save user data and token to localStorage
        if (response.data) {
          localStorage.setItem('user_id', response.data.user_id);
          localStorage.setItem('email', response.data.email);
          localStorage.setItem('role', response.data.role);
          localStorage.setItem('phone', formData.phone);
        }
        
        // Save JWT token for school registration
        if (response.token) {
          localStorage.setItem('token', response.token);
        }

        // Redirect to school setup page
        setTimeout(() => {
          navigate("/school-setup", {
            state: { 
              email: formData.email,
              phone: formData.phone,
              userId: response.data?.user_id
            },
          });
        }, 1500);
      } else {
        toast({
          variant: "destructive",
          title: "Verification Failed",
          description: response.message || "Invalid OTP. Please try again.",
        });
      }
    } catch (error: unknown) {
      console.error("Verify OTP error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Verification failed. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (countdown > 0) {
      toast({
        variant: "destructive",
        title: "Please wait",
        description: `You can resend OTP in ${Math.floor(countdown / 60)}:${String(countdown % 60).padStart(2, '0')}`,
      });
      return;
    }

    await handleSendOTP(new Event('submit') as unknown as React.FormEvent);
  };

  // Format countdown timer
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-white to-primary/5 p-4">
      <Card className="w-full max-w-lg shadow-2xl">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            {step === 'details' ? (
              <School className="h-8 w-8 text-primary" />
            ) : (
              <Mail className="h-8 w-8 text-primary" />
            )}
          </div>
          <CardTitle className="text-3xl font-bold">
            {step === 'details' ? 'Create Your Account' : 'Verify Your Email'}
          </CardTitle>
          <CardDescription className="text-base">
            {step === 'details' 
              ? 'Register as System Administrator' 
              : `Enter the 6-digit OTP sent to ${formData.email}`
            }
          </CardDescription>
        </CardHeader>

        <CardContent>
          {step === 'details' ? (
            // Step 1: Registration Form
            <form onSubmit={handleSendOTP} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>

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
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
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
                    Sending OTP...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-5 w-5" />
                    Send Verification Code
                  </>
                )}
              </Button>
            </form>
          ) : (
            // Step 2: OTP Verification
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              {/* Success message */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900">OTP Sent Successfully</p>
                  <p className="text-xs text-green-700 mt-1">
                    We've sent a 6-digit code to <strong>{formData.email}</strong>
                  </p>
                </div>
              </div>

              {/* OTP Input */}
              <div className="space-y-2">
                <Label htmlFor="otp">Enter 6-Digit OTP *</Label>
                <Input
                  id="otp"
                  name="otp"
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setOtp(value);
                  }}
                  required
                  disabled={isLoading}
                  className="text-center text-2xl tracking-widest font-mono"
                  maxLength={6}
                />
                {countdown > 0 && (
                  <p className="text-xs text-gray-500 text-center">
                    OTP expires in: <span className="font-semibold text-orange-600">{formatTime(countdown)}</span>
                  </p>
                )}
              </div>

              {/* Verify Button */}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Verify & Register
                  </>
                )}
              </Button>

              {/* Resend OTP */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={countdown > 0 || isLoading}
                  className="text-sm text-primary hover:underline disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed"
                >
                  {countdown > 0 ? `Resend OTP in ${formatTime(countdown)}` : 'Resend OTP'}
                </button>
              </div>

              {/* Back to edit details */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setStep('details');
                    setOtp('');
                    setOtpSent(false);
                  }}
                  className="text-sm text-gray-600 hover:text-gray-900"
                  disabled={isLoading}
                >
                  ← Change email or details
                </button>
              </div>
            </form>
          )}

          {/* Login Link */}
          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Sign in
            </Link>
          </div>

          {/* Terms */}
          <p className="mt-4 text-xs text-center text-gray-500">
            By creating an account, you agree to our{" "}
            <a href="#" className="text-primary hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-primary hover:underline">
              Privacy Policy
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignupPage;

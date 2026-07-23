import React, { ChangeEvent, useState } from "react";
import { Lock } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import toast from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";
import AuthPattern from "@/components/common/AuthPattern";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface ResetPasswordState {
  email: string;
  role: string;
  school_id: string;
}

function ResetPasswordPage() {
  const location = useLocation();
  const state = location.state as ResetPasswordState | null;

  const [formData, setFormData] = useState({
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const changePassword = useAuthStore((state) => state.changePassword);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.otp || !formData.newPassword || !formData.confirmPassword) {
      toast.error("Please fill all fields");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
console.log("state:" , state)
    const success = await changePassword({
      email: state?.email,
      otp: formData.otp,
      newPassword: formData.newPassword,
      role: state?.role,
      school_id: state?.school_id
    });

    if (success) {
      toast.success("Password reset successful!");
      navigate("/login");
    } else {
      toast.error("Failed to reset password. Check OTP and try again.");
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-card text-slate-800 dark:text-slate-200">
      {/* Left Side Form */}
      <div className="flex flex-col justify-center items-center">
        <Card className="w-full max-w-md border-none shadow-none">
          <CardHeader className="text-center space-y-3">
            <CardTitle className="text-xl md:text-2xl font-bold">
              Reset Your Password
            </CardTitle>
            <CardDescription>
              Enter the OTP sent to your email and set a new password
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* OTP */}
              <div className="space-y-2">
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter OTP"
                  value={formData.otp}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, otp: e.target.value })
                  }
                />
              </div>

              {/* New Password */}
              <div className="space-y-2">
                
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Enter new password"
                  value={formData.newPassword}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, newPassword: e.target.value })
                  }
                />
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  value={formData.confirmPassword}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                />
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full">
                Reset Password
              </Button>

              {/* Back to Login */}
              <Button
                type="button"
                variant="link"
                onClick={() => navigate("/verify-otp")}
                className="w-full text-sm text-primary hover:underline"
              >
                Request Otp Again
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Right Side Pattern */}
      <AuthPattern />
    </div>
  );
}

export default ResetPasswordPage;

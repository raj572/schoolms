import React, { ChangeEvent, useEffect, useState } from "react";
import { Mail, School as SchoolIcon, Book } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { School } from "./LoginPage";



function RequestOtpPage() {
  const [formData, setFormData] = useState({
    email: "",
    role: "",
    school_id: "",
  });

  const [schools, setSchools] = useState<School[]>([]);
  const verifyForOtp = useAuthStore((state) => state.verifyForOtp);
  const getSchoolList = useAuthStore((state) => state.getSchoolList);
  const navigate = useNavigate();

  // Fetch school list
  useEffect(() => {
    const fetchSchools = async () => {
      const schoolList = await getSchoolList();
      if (!schoolList || schoolList.length === 0) {
        toast.error("Failed to fetch schools");
      } else {
        setSchools(schoolList);
      }
    };
    fetchSchools();
  }, [getSchoolList]);

  // Handle OTP Request
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.role || !formData.school_id) {
      toast.error("Please fill email, role, and school first");
      return;
    }

    console.log("formdata: ", formData)

    const success = await verifyForOtp({
      email: formData.email,
      role: formData.role,
      school_id: formData.school_id,
    });

    if (success) {
      toast.success("OTP sent to your email");
      navigate("/reset-password", { state: formData });
    } else {
      toast.error("Failed to send OTP. Check your details.");
    }
  };

  const handleBackToLogin = () => navigate("/login");

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-card text-slate-800 dark:text-slate-200">
      {/* Left Side */}
      <div className="flex flex-col justify-center items-center">
        <Card className="w-full max-w-md border-none shadow-none">
          <CardHeader className="text-center space-y-3">
            <div className="flex flex-col items-center gap-2">
              <CardTitle className="text-xl md:text-2xl font-bold">
                Request Password Reset
              </CardTitle>
              <CardDescription>
                Enter your details to receive an OTP on your registered email
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form className="space-y-4" onSubmit={handleSendOtp}>
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="size-4 text-muted-foreground" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@gmail.com"
                  value={formData.email}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>

              {/* School Dropdown */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <SchoolIcon className="size-4 text-muted-foreground" />
                  School
                </Label>
                <Select
                  value={formData.school_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, school_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select School" />
                  </SelectTrigger>
                  <SelectContent>
                    {schools.map((school) => (
                      <SelectItem key={school.id} value={String(school.id)}>
                        {school.name} / {school.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Role Dropdown */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Book className="size-4 text-muted-foreground" />
                  Role
                </Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) =>
                    setFormData({ ...formData, role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="administrator">Administrator</SelectItem>
                    <SelectItem value="accountant">Accountant</SelectItem>
                    <SelectItem value="librarian">Librarian</SelectItem>
                    <SelectItem value="principal">Principal</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="parent">Parent</SelectItem>
                    <SelectItem value="warden">Warden</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full">
                Send OTP
              </Button>

              {/* Back to Login */}
              <Button
                type="button"
                variant="link"
                onClick={handleBackToLogin}
                className="w-full text-sm text-primary hover:underline"
              >
                Back to Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Right Side */}
      <AuthPattern />
    </div>
  );
}

export default RequestOtpPage;

import Heading from "@/components/common/Heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/useAuthStore";
import { ClassForm, useClassStore } from "@/store/useClassStore";
import { StudentForm, useUsersStore } from "@/store/useUsersStore";
import { Save, School } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface School {
  id: string;
  name: string;
}

const StudentRegister = () => {
  const { authUser } = useAuthStore();

  const { getClasses } = useClassStore();
  const [classes, setClasses] = useState<ClassForm[]>([]);

  const { toast } = useToast();
  const registerStudent = useUsersStore((state) => state.registerStudent);

  const [formData, setFormData] = useState<StudentForm>({
    school_id: authUser.school_id,
    candidate_name: "",
    gender: "",
    addhar: "",
    dob: "",
    class: {},
    roll_no: "",
    email: "",
    parent_email: "",
    father_name: "",
    mother_name: "",
    phone: "",
    address: "",
    // transport_service: false,
    // library_service: false,
    // computer_service: false,
  });

  const fetchClasses = async () => {
    const schoolId = authUser?.school_id;
    if (!schoolId) return;
    const data = await getClasses(schoolId);
    if (data?.length) setClasses(data);
  };

  useEffect(() => {
    fetchClasses();
  }, [])


  // ========================= HANDLE INPUT CHANGE =========================
  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };


  // ========================= HANDLE SUBMIT =========================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.school_id) {
      toast({ title: "Select a school first", variant: "destructive" });
      return;
    }

    if (!formData.email) {
      toast({ title: "Student email is required", variant: "destructive" });
      return;
    }

    const success = await registerStudent(formData.school_id, formData);
    if (success) {

      console.log("fromdata: ", formData);
      console.log("Student registered successfully");
      // Reset form
      setFormData({
       school_id: authUser.school_id,
        candidate_name: "",
        gender: "",
        addhar: "",
        dob: "",
        class: "",
        roll_no: "",
        email: "",
        parent_email: "",
        father_name: "",
        mother_name: "",
        phone: "",
        address: "",
        // transport_service: false,
        // library_service: false,
        // computer_service: false,
      });
    }
  };

  return (
    <div className="min-h-screen  ">
      <div className="space-y-4 md:space-y-6 mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-0 md:justify-between md:items-center mb-8">
          <Heading title="Student Registration" description="Add a new student to the system" />

          <Link to="/principal/dashboard">
            <Button variant="outline" className="">
              Back to Dashboard
            </Button>
          </Link>

        </div>

        
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          {/* ---------------------- PERSONAL INFO ---------------------- */}
          <Card>
            <CardHeader className="text-sm">
              <CardTitle className="text-lg">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">


              <div className="space-y-2">
                <Label htmlFor="candidate_name">Name *</Label>
                <Input
                  id="candidate_name"
                  placeholder="John Doe"
                  value={formData.candidate_name}
                  onChange={(e) => handleInputChange("candidate_name", e.target.value)}
                  required
                />
              </div>

              {/*  Aadhaar Number */}
              <div className="space-y-2">
                <Label htmlFor="addhar">Aadhaar Number</Label>
                <Input
                  id="addhar"
                  
                  value={formData.addhar}
                  onChange={(e) => handleInputChange("addhar", e.target.value)}
                  placeholder="1234 5678 9012"
                />
              </div>

              {/*  Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="johndoe@gmail.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>

              {/*  Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="9876543210"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                />
              </div>

              {/*  Date of Birth */}
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth *</Label>
                <Input
                  id="dob"
                  type="date"
                  value={formData.dob}
                  onChange={(e) => handleInputChange("dob", e.target.value)}
                  required
                />
              </div>

              {/*  Gender */}
              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select onValueChange={(value) => handleInputChange("gender", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/*  Address */}
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  placeholder="A-district, South City, India"
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* ---------------------- ACADEMIC INFO ---------------------- */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Academic Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/*  Roll Number */}
              <div className="space-y-2">
                <Label htmlFor="roll_no">Roll Number *</Label>
                <Input
                  id="roll_no"
                  value={formData.roll_no}
                  onChange={(e) => handleInputChange("roll_no", e.target.value)}
                  required
                />
              </div>

              {/* Class */}
              <div className="space-y-2">
                <Label htmlFor="class">Class *</Label>
                <Select
                  onValueChange={(value) => {
                    const selectedClass = classes.find((c) => String(c.id) === value);
                    if (selectedClass) {
                      // ✅ store complete class object instead of just id
                      handleInputChange("class", {
                        id: selectedClass.id,
                        class: selectedClass.class,
                        section: selectedClass.section || "",
                      });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={String(cls.id)}>
                        {cls.class} {cls.section && `(${cls.section})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* ---------------------- PARENT INFO ---------------------- */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Parent/Guardian Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/*  Parent Email */}
              <div className="space-y-2">
                <Label htmlFor="parent_email">Parent Email</Label>
                <Input
                  id="parent_email"
                  type="email"
                  value={formData.parent_email}
                  onChange={(e) => handleInputChange("parent_email", e.target.value)}
                  placeholder="parent@gmail.com"
                />
              </div>

              {/*  Father Name */}
              <div className="space-y-2">
                <Label htmlFor="father_name">Father's Name *</Label>
                <Input
                  id="father_name"
                  placeholder="Jim Carrey"
                  value={formData.father_name}
                  onChange={(e) => handleInputChange("father_name", e.target.value)}
                  required
                />
              </div>

              {/*  Mother Name */}
              <div className="space-y-2">
                <Label htmlFor="mother_name">Mother's Name *</Label>
                <Input
                  id="mother_name"
                  placeholder="Angelina Joe"
                  value={formData.mother_name}
                  onChange={(e) => handleInputChange("mother_name", e.target.value)}
                  required
                />
              </div>
            </CardContent>
          </Card>

          

          {/* ---------------------- SUBMIT ---------------------- */}
          <div className="flex justify-center md:justify-end gap-4">
            <Link to="/principal/students/list">
              <Button variant="outline" className="">Cancel</Button>
            </Link>
            <Button type="submit" className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Register Student
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentRegister;

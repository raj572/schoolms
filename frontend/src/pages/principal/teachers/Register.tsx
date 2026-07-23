import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, School, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { TeacherForm, useUsersStore } from "@/store/useUsersStore";
import { useAuthStore } from "@/store/useAuthStore";
import { SubjectForm, useSubjectStore } from "@/store/useSubjectStore";
import SubjectSelect from "@/components/SubjectSelect";
import Heading from "@/components/common/Heading";

const Register = () => {
  const { toast } = useToast();
  const { authUser } = useAuthStore();
  const { getSubjects } = useSubjectStore();
  const registerTeacher = useUsersStore((state) => state.registerTeacher);
  const [subjects, setSubjects] = useState<SubjectForm[]>([]);
  const [loading, setLoading] = useState(false);


  const fetchSubjects = async () => {
    const schoolId = Number(authUser.school_id);
    if (!schoolId) return;
    const data = await getSubjects(schoolId);
    if (data) setSubjects(data);
  }
    useEffect(() => {
    fetchSubjects();
  }, []);


  const [formData, setFormData] = useState<TeacherForm>({
  school_id: authUser.school_id,        
  name: '',
  email: '',
  phone: '',
  qualification: '',
  dob: undefined,       
  gender: '',
  address: '',
  city: '',
  state: '',
  employee_code: '',
});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    
    e.preventDefault();
    console.log("Teacher Registration Data:", formData);

    setLoading(true);
    const success = await registerTeacher(authUser.school_id, formData);
    setLoading(false);
    // Reset form
    setFormData({
      school_id: authUser.school_id,        
      name: '',
      email: '',
      phone: '',
      qualification: '',
      dob: undefined,       
      gender: '',
      address: '',
      city: '',
      state: '',
      employee_code: '',
    });
  };

  return (
    <div className="min-h-screen  ">
      <div className="space-y-4 md:space-y-6 mx-auto max-w-7xl">

        {/* Header */}
         <div className="flex flex-col md:flex-row items-start justify-between md:items-center gap-4 mb-8">
          <Heading title='Teacher Registration' description="Add a new teacher to the system"/>
            
              <Link to="/principal/dashboard">
                <Button variant="outline" className="">Back to Dashboard</Button>
              </Link>
              
            </div>

        <form onSubmit={handleSubmit} className="space-y-6 ">

          {/* Personal Information */}
          <Card className="w-full  ">
            <CardHeader>
              <CardTitle className="text-lg">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth *</Label>
                <Input
                  id="dob"
                  type="date"
                  value={formData.dob ? formData.dob.toISOString().split("T")[0] : ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      dob: e.target.value ? new Date(e.target.value) : undefined,
                    }))
                  }
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


            </CardContent>
          </Card>

          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-lg">Address Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                    required
                  />
                </div>

                 <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    required
                  />
                </div>

            </CardContent>
          </Card>

          {/* teacher Information */}
          <Card >
            <CardHeader>
              <CardTitle className="text-lg">Teacher Education</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="qualification">Qualification *</Label>
                <Input
                  id="qualification"
                  value={formData.qualification}
                  onChange={(e) => handleInputChange("qualification", e.target.value)}
                  required
                />
              </div>
               {/* <div className="space-y-2">
               <Label htmlFor="qualification">Subjects</Label>

                <SubjectSelect
                    subjects={subjects}
                    selected={formData.subjects || []}
                    onChange={(newSubjects) =>
                      setFormData((prev) => ({ ...prev, subjects: newSubjects }))
                    }
                  />
              </div> */}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-center md:justify-end gap-4">
            <Link to="/principal/teachers/list">
              <Button variant="outline" className="hover:bg-destructive hover:text-accent">Cancel</Button>
            </Link>
            <Button type="submit" className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              {loading? "Registering..." : "Register Teacher"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
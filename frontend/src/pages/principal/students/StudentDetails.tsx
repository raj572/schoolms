import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit, Phone, Mail, MapPin, Calendar, User, GraduationCap, Heart, Users, UserCheck, Loader2 } from "lucide-react";
import Heading from "@/components/common/Heading";
import { axiosInstance } from "@/lib/axios";
import { toast } from "sonner";
import { StudentForm } from "@/store/useUsersStore";

interface StudentDetailsData extends StudentForm {
  monthlyPayments?: unknown[];
  attendanceSummary?: unknown;
  onlineTransactions?: unknown[];
  extraServices?: unknown[];
}

const StudentDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<StudentDetailsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStudentDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axiosInstance.get(
        `/principal/student/getstudentmoredetails/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status) {
        setStudent(response.data.data);
      } else {
        toast.error(response.data.message || "Failed to fetch student details");
      }
    } catch (error: unknown) {
      console.error("Error fetching student details:", error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Failed to fetch student details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchStudentDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Student not found</p>
          <Button onClick={() => navigate('/principal/students/list')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Students List
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6 p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <Heading 
            title={student.candidate_name || "Student Details"} 
            description={`Roll No: ${student.roll_no || 'N/A'}`} 
          />

          <div className="flex gap-2">
            <Link to="/principal/students/list">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to List
              </Button>
            </Link>
            <Button
              onClick={() => navigate(`/principal/students/attendance/student/${id}`)}
            >
              <UserCheck className="h-4 w-4 mr-2" />
              View Attendance Records
            </Button>
          </div>
        </div>

        {/* Student Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <GraduationCap className="h-8 w-8 text-primary" />
                <div>
                  <div className="text-md font-semibold">
                    {typeof student.class === 'string' ? student.class : String(student.class)} - {student.section}
                  </div>
                  <div className="text-xs text-muted-foreground">Class & Section</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <User className="h-8 w-8 text-blue-600" />
                <div>
                  <div className="text-lg font-semibold">
                    <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                      {student.status || 'N/A'}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">Status</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-8 w-8 text-green-600" />
                <div>
                  <div className="text-sm font-semibold">
                    {student.dob ? new Date(student.dob).toLocaleDateString() : 'N/A'}
                  </div>
                  <div className="text-xs text-muted-foreground">Date of Birth</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Heart className="h-8 w-8 text-red-600" />
                <div>
                  <div className="text-sm font-semibold">{student.gender || 'N/A'}</div>
                  <div className="text-xs text-muted-foreground">Gender</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Information Tabs */}
        <Tabs defaultValue="personal" className="w-full">
          <div className="overflow-x-auto pb-2">
            <TabsList className="flex min-w-max w-full grid-cols-4 bg-muted/60 p-1">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="academic">Academic</TabsTrigger>
              <TabsTrigger value="parent">Parent/Guardian</TabsTrigger>
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="personal" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex text-lg items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{student.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{student.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{student.address || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Born: {student.dob ? new Date(student.dob).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  {student.addhar && (
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Aadhar: {student.addhar}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex text-lg items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Academic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Roll Number</label>
                    <p className="text-sm font-medium">{student.roll_no || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Class</label>
                    <p className="text-sm">{typeof student.class === 'string' ? student.class : String(student.class || 'N/A')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Section</label>
                    <p className="text-sm">{student.section || 'N/A'}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="academic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Academic Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Roll Number</label>
                    <p className="text-sm font-medium">{student.roll_no || 'N/A'}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Class</label>
                    <p className="text-sm">{typeof student.class === 'string' ? student.class : String(student.class || 'N/A')}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Section</label>
                    <p className="text-sm">{student.section || 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="parent" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex text-lg items-center gap-2">
                  <Users className="h-5 w-5" />
                  Parent/Guardian Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Father's Name</label>
                    <p className="text-sm">{student.father_name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Mother's Name</label>
                    <p className="text-sm">{student.mother_name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Parent Email</label>
                    <p className="text-sm">{student.parent_email || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                    <p className="text-sm">{student.phone || 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex text-lg items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Attendance Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground mb-4">
                  View detailed attendance records and analytics for this student.
                </p>
                <Button
                  onClick={() => navigate(`/principal/students/attendance/student/${id}`)}
                  className="w-full sm:w-auto"
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  View Attendance Records & Analytics
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentDetails;


import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit, Phone, Mail, MapPin, Calendar, User, GraduationCap, Heart, Users, UserCheck, Loader2, FileText, Download, Printer, ExternalLink, Award, CreditCard, Receipt, FileCheck, ClipboardCheck } from "lucide-react";
import Heading from "@/components/common/Heading";
import { axiosInstance } from "@/lib/axios";
import { toast } from "sonner";
import { StudentForm } from "@/store/useUsersStore";
import { openDocument } from "@/lib/documentUtils";

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
            <TabsList className="flex min-w-max w-full bg-muted/60 p-1">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="academic">Academic</TabsTrigger>
              <TabsTrigger value="parent">Parent/Guardian</TabsTrigger>
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
              <TabsTrigger value="documents" className="font-semibold text-primary">Official Documents</TabsTrigger>
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

          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex text-lg items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <span>Official Operational Documents & Certificates</span>
                  </div>
                  <Badge variant="outline" className="text-xs">Student ID: {student.id}</Badge>
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Directly generate, view, print, or download official verification certificates and academic slips pre-filled for {student.candidate_name}.
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* ID Card */}
                  <div className="p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <CreditCard className="h-5 w-5 text-primary" />
                        <Badge variant="secondary" className="text-[10px]">CR-80 Badge</Badge>
                      </div>
                      <h4 className="font-semibold text-sm">Student ID Card</h4>
                      <p className="text-xs text-muted-foreground mt-1">Official vertical badge with photo box, validity, and emergency contacts.</p>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => openDocument('id-card', student.id, false)}>
                        <ExternalLink className="h-3.5 w-3.5 mr-1" /> View
                      </Button>
                      <Button size="sm" variant="default" className="w-full text-xs" onClick={() => openDocument('id-card', student.id, true)}>
                        <Download className="h-3.5 w-3.5 mr-1" /> PDF
                      </Button>
                    </div>
                  </div>

                  {/* Admission Receipt */}
                  <div className="p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <FileCheck className="h-5 w-5 text-emerald-600" />
                        <Badge variant="secondary" className="text-[10px]">Enrollment</Badge>
                      </div>
                      <h4 className="font-semibold text-sm">Admission Receipt</h4>
                      <p className="text-xs text-muted-foreground mt-1">Enrollment confirmation with admission number and breakdown of initial fees.</p>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => openDocument('admission-receipt', student.id, false)}>
                        <ExternalLink className="h-3.5 w-3.5 mr-1" /> View
                      </Button>
                      <Button size="sm" variant="default" className="w-full text-xs" onClick={() => openDocument('admission-receipt', student.id, true)}>
                        <Download className="h-3.5 w-3.5 mr-1" /> PDF
                      </Button>
                    </div>
                  </div>

                  {/* Marksheet */}
                  <div className="p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <GraduationCap className="h-5 w-5 text-blue-600" />
                        <Badge variant="secondary" className="text-[10px]">Report Card</Badge>
                      </div>
                      <h4 className="font-semibold text-sm">Academic Marksheet</h4>
                      <p className="text-xs text-muted-foreground mt-1">Official term report card with grades, overall percentage, and teacher remarks.</p>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => openDocument('marksheet', student.id, false)}>
                        <ExternalLink className="h-3.5 w-3.5 mr-1" /> View
                      </Button>
                      <Button size="sm" variant="default" className="w-full text-xs" onClick={() => openDocument('marksheet', student.id, true)}>
                        <Download className="h-3.5 w-3.5 mr-1" /> PDF
                      </Button>
                    </div>
                  </div>

                  {/* Admit Card */}
                  <div className="p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <ClipboardCheck className="h-5 w-5 text-amber-600" />
                        <Badge variant="secondary" className="text-[10px]">Hall Ticket</Badge>
                      </div>
                      <h4 className="font-semibold text-sm">Exam Admit Card</h4>
                      <p className="text-xs text-muted-foreground mt-1">Examination hall ticket with exam schedule timetable, room, and candidate rules.</p>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => openDocument('admit-card', student.id, false)}>
                        <ExternalLink className="h-3.5 w-3.5 mr-1" /> View
                      </Button>
                      <Button size="sm" variant="default" className="w-full text-xs" onClick={() => openDocument('admit-card', student.id, true)}>
                        <Download className="h-3.5 w-3.5 mr-1" /> PDF
                      </Button>
                    </div>
                  </div>

                  {/* Transfer Certificate */}
                  <div className="p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <FileText className="h-5 w-5 text-purple-600" />
                        <Badge variant="secondary" className="text-[10px]">Statutory TC</Badge>
                      </div>
                      <h4 className="font-semibold text-sm">Transfer Certificate</h4>
                      <p className="text-xs text-muted-foreground mt-1">Formal school leaving certificate with student record and clearance status.</p>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => openDocument('transfer-certificate', student.id, false)}>
                        <ExternalLink className="h-3.5 w-3.5 mr-1" /> View
                      </Button>
                      <Button size="sm" variant="default" className="w-full text-xs" onClick={() => openDocument('transfer-certificate', student.id, true)}>
                        <Download className="h-3.5 w-3.5 mr-1" /> PDF
                      </Button>
                    </div>
                  </div>

                  {/* Bonafide Certificate */}
                  <div className="p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <Award className="h-5 w-5 text-indigo-600" />
                        <Badge variant="secondary" className="text-[10px]">Verification</Badge>
                      </div>
                      <h4 className="font-semibold text-sm">Bonafide Certificate</h4>
                      <p className="text-xs text-muted-foreground mt-1">Official letterhead certificate certifying bonafide enrollment and good conduct.</p>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => openDocument('bonafide-certificate', student.id, false)}>
                        <ExternalLink className="h-3.5 w-3.5 mr-1" /> View
                      </Button>
                      <Button size="sm" variant="default" className="w-full text-xs" onClick={() => openDocument('bonafide-certificate', student.id, true)}>
                        <Download className="h-3.5 w-3.5 mr-1" /> PDF
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentDetails;


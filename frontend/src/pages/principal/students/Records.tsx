import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Edit, Phone, Mail, MapPin, Calendar, User, GraduationCap, Heart, Users, Pen } from "lucide-react";
import Heading from "@/components/common/Heading";

interface StudentRecord {
  id: number;
  rollNumber: string;
  name: string;
  class: string;
  section: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  bloodGroup: string;
  parentName: string;
  parentPhone: string;
  parentOccupation: string;
  admissionDate: string;
  status: 'active' | 'inactive';
  attendancePercentage: number;
  totalDaysPresent: number;
  totalDaysAbsent: number;
  subjects: {
    name: string;
    marks: number;
    grade: string;
  }[];
  medicalRecords: {
    date: string;
    condition: string;
    treatment: string;
  }[];
  disciplinaryRecords: {
    date: string;
    incident: string;
    action: string;
  }[];
}

const Records = () => {
  const { id } = useParams();
  
  // Mock data - in real app, fetch based on ID
  const [student] = useState<StudentRecord>({
    id: 1,
    rollNumber: "2024001",
    name: "Aarav Sharma",
    class: "10th",
    section: "A",
    email: "aarav@email.com",
    phone: "9876543210",
    address: "123 Main Street, New Delhi, 110001",
    dateOfBirth: "2008-05-15",
    bloodGroup: "B+",
    parentName: "Rajesh Sharma",
    parentPhone: "9876543200",
    parentOccupation: "Software Engineer",
    admissionDate: "2024-01-15",
    status: "active",
    attendancePercentage: 92,
    totalDaysPresent: 165,
    totalDaysAbsent: 15,
    subjects: [
      { name: "Mathematics", marks: 85, grade: "A" },
      { name: "Physics", marks: 78, grade: "B+" },
      { name: "Chemistry", marks: 92, grade: "A+" },
      { name: "Biology", marks: 88, grade: "A" },
      { name: "English", marks: 76, grade: "B+" },
      { name: "Hindi", marks: 82, grade: "A" }
    ],
    medicalRecords: [
      {
        date: "2024-03-15",
        condition: "Common Cold",
        treatment: "Rest and medication prescribed"
      },
      {
        date: "2024-01-20",
        condition: "Minor injury during sports",
        treatment: "First aid applied, parents informed"
      }
    ],
    disciplinaryRecords: [
      {
        date: "2024-02-10",
        incident: "Late submission of assignment",
        action: "Verbal warning given"
      }
    ]
  });

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-green-600';
    if (grade.startsWith('B')) return 'text-blue-600';
    if (grade.startsWith('C')) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen  ">
      <div className="max-w-7xl mx-auto space-y-6">
        
         {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Heading title={student.name} description={student.rollNumber} />

          <div className="flex gap-2">
            <Link to="/principal/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
            <Link to="/principal/students/register">
              <Button>
                <Edit className="h-4 w-4 mr-2" />
                Edit Student
              </Button>
            </Link>
          </div>
        </div>

        {/* Student Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <GraduationCap className="h-8 w-8 text-primary" />
                <div>
                  <div className="text-md font-semibold">{student.class} - {student.section}</div>
                  <div className="text-xs text-muted-foreground">Class & Section</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-8 w-8 text-green-600" />
                <div>
                  <div className="text-lg font-semibold">{student.attendancePercentage}%</div>
                  <div className="text-sm text-muted-foreground">Attendance</div>
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
                      {student.status}
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
                <Heart className="h-8 w-8 text-red-600" />
                <div>
                  <div className="text-lg font-semibold">{student.bloodGroup}</div>
                  <div className="text-sm text-muted-foreground">Blood Group</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Information Tabs */}
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mt-9">
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="academic">Academic</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="medical">Medical</TabsTrigger>
            <TabsTrigger value="disciplinary">Disciplinary</TabsTrigger>
          </TabsList>

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
                    <span className="text-sm">{student.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{student.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{student.address}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Born: {new Date(student.dateOfBirth).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Admitted: {new Date(student.admissionDate).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex text-lg items-center gap-2">
                    <Users className="h-5 w-5" />
                    Parent/Guardian Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                    <p className="text-sm">{student.parentName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                    <p className="text-sm">{student.parentPhone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Occupation</label>
                    <p className="text-sm">{student.parentOccupation}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="academic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Academic Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {student.subjects.map((subject, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <h3 className="text-sm">{subject.name}</h3>
                            <Badge variant="outline" className={getGradeColor(subject.grade)}>
                              {subject.grade}
                            </Badge>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-xs">Marks</span>
                              <span className="font-medium">{subject.marks}/100</span>
                            </div>
                            <Progress value={subject.marks} className="h-2" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-center">Attendance Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">{student.attendancePercentage}%</div>
                    <p className="text-muted-foreground text-sm">Overall Attendance</p>
                  </div>
                  <Progress value={student.attendancePercentage} className="h-3" />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">{student.totalDaysPresent}</div>
                    <p className="text-sm text-muted-foreground">Days Present</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-600">{student.totalDaysAbsent}</div>
                    <p className="text-sm text-muted-foreground">Days Absent</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="medical" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Medical Records</CardTitle>
              </CardHeader>
              <CardContent>
                {student.medicalRecords.length > 0 ? (
                  <div className="space-y-4">
                    {student.medicalRecords.map((record, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <h3 className="font-medium text-sm">{record.condition}</h3>
                              <Badge variant="outline">{new Date(record.date).toLocaleDateString()}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{record.treatment}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No medical records found.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="disciplinary" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Disciplinary Records</CardTitle>
              </CardHeader>
              <CardContent>
                {student.disciplinaryRecords.length > 0 ? (
                  <div className="space-y-4">
                    {student.disciplinaryRecords.map((record, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <h3 className="font-medium text-sm">{record.incident}</h3>
                              <Badge variant="outline">{new Date(record.date).toLocaleDateString()}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">Action: {record.action}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No disciplinary records found.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Records;
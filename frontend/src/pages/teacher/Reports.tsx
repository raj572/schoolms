import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { FileText, Download, TrendingUp, Users, BookOpen, Calendar, GraduationCap, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StudentPerformance {
  studentName: string;
  class: string;
  subject: string;
  marks: number;
  maxMarks: number;
  grade: string;
  status: "pass" | "fail";
}

interface AttendanceData {
  month: string;
  attendance: number;
  totalDays: number;
}

interface SubjectPerformance {
  subject: string;
  averageScore: number;
  totalStudents: number;
  passRate: number;
}

const mockStudentPerformance: StudentPerformance[] = [
  { studentName: "Alice Johnson", class: "10th Grade", subject: "Mathematics", marks: 85, maxMarks: 100, grade: "A", status: "pass" },
  { studentName: "Bob Smith", class: "10th Grade", subject: "Mathematics", marks: 72, maxMarks: 100, grade: "B", status: "pass" },
  { studentName: "Charlie Brown", class: "10th Grade", subject: "Mathematics", marks: 45, maxMarks: 100, grade: "F", status: "fail" },
  { studentName: "Diana Wilson", class: "10th Grade", subject: "Physics", marks: 78, maxMarks: 100, grade: "B", status: "pass" },
  { studentName: "Eva Davis", class: "10th Grade", subject: "Physics", marks: 92, maxMarks: 100, grade: "A", status: "pass" }
];

const mockAttendanceData: AttendanceData[] = [
  { month: "Sep", attendance: 92, totalDays: 22 },
  { month: "Oct", attendance: 88, totalDays: 23 },
  { month: "Nov", attendance: 95, totalDays: 21 },
  { month: "Dec", attendance: 87, totalDays: 20 },
  { month: "Jan", attendance: 91, totalDays: 22 }
];

const mockSubjectPerformance: SubjectPerformance[] = [
  { subject: "Mathematics", averageScore: 76, totalStudents: 30, passRate: 87 },
  { subject: "Physics", averageScore: 82, totalStudents: 28, passRate: 93 },
  { subject: "Chemistry", averageScore: 79, totalStudents: 25, passRate: 88 },
  { subject: "Biology", averageScore: 84, totalStudents: 32, passRate: 91 }
];

const gradeDistribution = [
  { grade: "A", count: 12, color: "#22c55e" },
  { grade: "B", count: 18, color: "#3b82f6" },
  { grade: "C", count: 8, color: "#f59e0b" },
  { grade: "D", count: 4, color: "#f97316" },
  { grade: "F", count: 3, color: "#ef4444" }
];

const TeacherReports = () => {
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("current-term");
  const { toast } = useToast();

  const handleExportReport = (reportType: string) => {
    toast({
      title: "Export Started",
      description: `${reportType} report is being generated and will be downloaded shortly.`
    });
    // Simulate export functionality
  };

  const getGradeBadge = (grade: string) => {
    const variants = {
      A: "default",
      B: "secondary",
      C: "outline",
      D: "destructive",
      F: "destructive"
    } as const;
    
    return (
      <Badge variant={variants[grade as keyof typeof variants] || "outline"}>
        {grade}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    return (
      <Badge variant={status === "pass" ? "default" : "destructive"} className="capitalize">
        {status}
      </Badge>
    );
  };

  return (
    <div className="p-8 space-y-8 bg-gradient-subtle min-h-screen ml-9">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">
            Teacher Reports
          </h1>
          <p className="text-gray-500 text-xs mt-2">
            Comprehensive analytics and reporting dashboard
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select Class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              <SelectItem value="9th">9th Grade</SelectItem>
              <SelectItem value="10th">10th Grade</SelectItem>
              <SelectItem value="11th">11th Grade</SelectItem>
              <SelectItem value="12th">12th Grade</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select Subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              <SelectItem value="mathematics">Mathematics</SelectItem>
              <SelectItem value="physics">Physics</SelectItem>
              <SelectItem value="chemistry">Chemistry</SelectItem>
              <SelectItem value="biology">Biology</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current-term">Current Term</SelectItem>
              <SelectItem value="last-term">Last Term</SelectItem>
              <SelectItem value="current-year">Current Year</SelectItem>
              <SelectItem value="last-year">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="card-hover w-[250px]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-gray-500 text--xs" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">145</div>
            <p className="text-xs text-gray-500 text--xs">
              +12% from last term
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-500 text--xs" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78.5%</div>
            <p className="text-xs text-gray-500 text--xs">
              +5.2% improvement
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
            <Target className="h-4 w-4 text-gray-500 text--xs" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89.7%</div>
            <p className="text-xs text-gray-500 text--xs">
              Above target of 85%
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <Calendar className="h-4 w-4 text-gray-500 text--xs" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">90.6%</div>
            <p className="text-xs text-gray-500 text--xs">
              Consistent performance
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="text-lg">Subject Performance Overview</CardTitle>
            <CardDescription  className="text-xs text-gray-500">Average scores across different subjects</CardDescription>
          </CardHeader>
          <CardContent className="text-sm">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockSubjectPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="averageScore" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="text-lg">Grade Distribution</CardTitle>
            <CardDescription className="text-xs text-gray-500">Distribution of grades across all students</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={gradeDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="count"
                  label={({ grade, count }) => `${grade}: ${count}`}
                >
                  {gradeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="card-hover">
        <CardHeader>
          <CardTitle  className="text-lg">Attendance Trends</CardTitle>
          <CardDescription className="text-xs text-gray-500">Monthly attendance percentage over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockAttendanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="attendance" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Student Performance</TabsTrigger>
          <TabsTrigger value="subject-analysis">Subject Analysis</TabsTrigger>
          <TabsTrigger value="export">Export Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="performance">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="text-lg">Individual Student Performance</CardTitle>
              <CardDescription className="text-xs text-gray-500">
                Detailed breakdown of student marks and grades
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Marks</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockStudentPerformance.map((student, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium text-xs">{student.studentName}</TableCell>
                      <TableCell className="font-medium text-xs">{student.class}</TableCell>
                      <TableCell className="font-medium text-xs">{student.subject}</TableCell>
                      <TableCell className="font-medium text-xs">{student.marks}/{student.maxMarks}</TableCell>
                      <TableCell className="font-medium text-xs">{((student.marks / student.maxMarks) * 100).toFixed(1)}%</TableCell>
                      <TableCell className="font-medium text-xs">{getGradeBadge(student.grade)}</TableCell>
                      <TableCell className="font-medium text-xs">{getStatusBadge(student.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="subject-analysis">
          <div className="grid gap-6">
            {mockSubjectPerformance.map((subject) => (
              <Card key={subject.subject} className="card-hover">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{subject.subject}</span>
                    <div className="flex items-center space-x-2">
                      <BookOpen className="h-4 w-4 text-gray-500 text--xs" />
                      <span className="text-sm text-gray-500 text--xs">
                        {subject.totalStudents} students
                      </span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <p className="text-sm font-medium">Average Score</p>
                      <p className="text-2xl font-bold">{subject.averageScore}%</p>
                      <Progress value={subject.averageScore} className="mt-2" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Pass Rate</p>
                      <p className="text-2xl font-bold">{subject.passRate}%</p>
                      <Progress value={subject.passRate} className="mt-2" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Total Students</p>
                      <p className="text-2xl font-bold">{subject.totalStudents}</p>
                      <div className="mt-2 text-sm text-gray-500 text--xs">
                        {Math.round((subject.passRate / 100) * subject.totalStudents)} passed
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="export">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="card-hover">
              <CardHeader>
                <CardTitle>Student Performance Reports</CardTitle>
                <CardDescription>
                  Export detailed student performance data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => handleExportReport("Student Performance")}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Export Student Performance Report
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => handleExportReport("Grade Distribution")}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export Grade Distribution Report
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => handleExportReport("Individual Progress")}
                >
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Export Individual Progress Reports
                </Button>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardHeader>
                <CardTitle>Analytics Reports</CardTitle>
                <CardDescription>
                  Export analytical data and trends
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => handleExportReport("Subject Analysis")}
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Export Subject Analysis Report
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => handleExportReport("Attendance Trends")}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Export Attendance Trends Report
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => handleExportReport("Performance Trends")}
                >
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Export Performance Trends Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeacherReports;
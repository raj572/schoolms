import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User, Calendar, Award, Wallet, Bell, Eye } from "lucide-react";
import { ChildExamDetailsCard } from "@/components/parent/ChildExamDetailsCard";

export default function ParentDashboard() {
  const studentInfo = {
    name: "Rohan Sharma",
    grade: "10th Grade",
    rollNo: "10A-23",
    attendance: 92,
    parent: "Mr. Rajesh Sharma"
  };

  const upcomingEvents = [
    { id: 1, title: "PTM (Parent-Teacher Meeting)", date: "2025-04-15" },
    { id: 2, title: "Annual Sports Day", date: "2025-04-20" },
  ];

  const examPerformance = [
    { subject: "Mathematics", marks: 85, max: 100, grade: "A" },
    { subject: "Science", marks: 78, max: 100, grade: "B+" },
    { subject: "English", marks: 92, max: 100, grade: "A+" },
  ];

  const feeStatus = [
    { id: 1, type: "Addmission Fee", dueDate: "2025-04-10", amount: "₹15,000", status: "Paid" },
    { id: 2, type: "Library Fee", dueDate: "2025-04-8", amount: "₹1,000", status: "Pending" },
    { id: 3, type: "Book Fee", dueDate: "2025-04-12", amount: "₹1,500", status: "Pending" },
  ];

  const notices = [
    { id: 1, message: "School will remain closed on 14th April for a public holiday.", date: "2025-04-08" },
    { id: 2, message: "Science exhibition registration closes on 12th April.", date: "2025-04-09" },
  ];

  const gradeColor = (grade: string) => {
    switch (grade) {
      case 'A+': return 'text-green-600';
      case 'A': return 'text-blue-600';
      case 'B+': return 'text-yellow-600';
      case 'B': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className=" space-y-6 ">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold ">Parent Dashboard</h1>
          <p className="text-gray-500 text-xs">Welcome, {studentInfo.parent}. Here's an overview of your child's progress.</p>
        </div>
        <Button >Download Report</Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <User className="h-10 w-10 text-primary" />
            <div>
              <CardTitle className="text-lg">{studentInfo.name}</CardTitle>
              <p className="text-xs text-gray-500">{studentInfo.grade} • Roll No: {studentInfo.rollNo}</p>
            </div>
          </div>
          <Badge variant="secondary">Attendance: {studentInfo.attendance}%</Badge>
        </CardHeader>
        <CardContent>
          <Progress value={studentInfo.attendance} className="w-full" />
        </CardContent>
      </Card>

      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 shadow-md">
          <TabsTrigger value="performance" className="gap-2">
            <Award className="h-4 w-4" />
            Exam Performance
          </TabsTrigger>
          <TabsTrigger value="fees" className="gap-2">
            <Wallet className="h-4 w-4" />
            Fees Status
          </TabsTrigger>
          <TabsTrigger value="events" className="gap-2">
            <Calendar className="h-4 w-4" />
            Upcoming Events
          </TabsTrigger>
          <TabsTrigger value="notices" className="gap-2">
            <Bell className="h-4 w-4" />
            Notices
          </TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Exam Results</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Marks</TableHead>
                    <TableHead>Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {examPerformance.map((exam, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-xs">{exam.subject}</TableCell>
                      <TableCell className="text-xs">{exam.marks}/{exam.max}</TableCell>
                      <TableCell className={`font-semibold ${gradeColor(exam.grade)}`}>{exam.grade}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fees" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Fees Details</CardTitle>
            </CardHeader>
            <CardContent>
              {feeStatus.map((fee) => (
                <div key={fee.id} className="flex items-center justify-between p-4 border rounded-lg mb-2">
                  <div>
                    <h4 className="font-medium text-sm">{fee.type}</h4>
                    <p className="text-xs text-gray-500">Due Date: {fee.dueDate}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-semibold text-xs">{fee.amount}</p>
                    <Badge variant={fee.status === "Paid" ? "secondary" : "destructive"}>{fee.status}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg mb-2">
                  <div>
                    <h4 className="font-medium text-sm">{event.title}</h4>
                    <p className="text-xs text-gray-500">Date: {event.date}</p>
                  </div>
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Notices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {notices.map((notice) => (
                <div key={notice.id} className="p-4 border rounded-lg">
                  <p className="text-sm">{notice.message}</p>
                  <p className="text-xs text-gray-500 mt-1">Date: {notice.date}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detailed Examination Section */}
      <ChildExamDetailsCard />
    </div>
  );
}

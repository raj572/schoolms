import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User, Calendar, Award, Wallet, Bell, Eye, Download, Edit3 } from "lucide-react";
import { ChildExamDetailsCard } from "@/components/parent/ChildExamDetailsCard";
import { exportToCsv } from "@/lib/exportUtils";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ParentDashboard() {
  const { toast } = useToast();
  const [studentInfo, setStudentInfo] = useState({
    name: "Rohan Sharma",
    grade: "10th Grade",
    rollNo: "10A-23",
    attendance: 92,
    parent: "Mr. Rajesh Sharma",
    email: "rajesh.sharma@example.com",
    phone: "+91 9876543210"
  });

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ ...studentInfo });

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
      case 'A+': return 'text-emerald-600 dark:text-emerald-400';
      case 'A': return 'text-blue-600 dark:text-blue-400';
      case 'B+': return 'text-amber-600 dark:text-amber-400';
      case 'B': return 'text-orange-600 dark:text-orange-400';
      default: return 'text-muted-foreground';
    }
  };

  const handleDownloadReport = () => {
    exportToCsv("child_performance_overview.csv", examPerformance, [
      { header: "Subject", key: "subject" },
      { header: "Marks", key: "marks" },
      { header: "Max Marks", key: "max" },
      { header: "Grade", key: "grade" },
    ]);
    toast({
      title: "Report Downloaded",
      description: "Child performance report generated successfully.",
    });
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setStudentInfo({ ...editForm });
    setIsEditOpen(false);
    toast({
      title: "Profile Updated",
      description: "Parent profile details have been saved.",
    });
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Parent Dashboard</h1>
          <p className="text-muted-foreground text-xs">Welcome, {studentInfo.parent}. Here's an overview of your child's progress.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => { setEditForm({ ...studentInfo }); setIsEditOpen(true); }} className="gap-2">
            <Edit3 className="h-4 w-4" />
            Edit Profile
          </Button>
          <Button size="sm" onClick={handleDownloadReport} className="gap-2">
            <Download className="h-4 w-4" />
            Download Report
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <User className="h-10 w-10 text-primary" />
            <div>
              <CardTitle className="text-lg text-foreground">{studentInfo.name}</CardTitle>
              <p className="text-xs text-muted-foreground">{studentInfo.grade} • Roll No: {studentInfo.rollNo}</p>
            </div>
          </div>
          <Badge variant="secondary">Attendance: {studentInfo.attendance}%</Badge>
        </CardHeader>
        <CardContent>
          <Progress value={studentInfo.attendance} className="w-full" />
        </CardContent>
      </Card>

      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 shadow-sm h-auto">
          <TabsTrigger value="performance" className="gap-2 py-2">
            <Award className="h-4 w-4" />
            Exam Performance
          </TabsTrigger>
          <TabsTrigger value="fees" className="gap-2 py-2">
            <Wallet className="h-4 w-4" />
            Fees Status
          </TabsTrigger>
          <TabsTrigger value="events" className="gap-2 py-2">
            <Calendar className="h-4 w-4" />
            Upcoming Events
          </TabsTrigger>
          <TabsTrigger value="notices" className="gap-2 py-2">
            <Bell className="h-4 w-4" />
            Notices
          </TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-foreground">Recent Exam Results</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
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
                      <TableCell className="text-xs font-medium text-foreground">{exam.subject}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{exam.marks}/{exam.max}</TableCell>
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
              <CardTitle className="text-lg text-foreground">Fees Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {feeStatus.map((fee) => (
                <div key={fee.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium text-sm text-foreground">{fee.type}</h4>
                    <p className="text-xs text-muted-foreground">Due Date: {fee.dueDate}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-semibold text-xs text-foreground">{fee.amount}</p>
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
              <CardTitle className="text-lg text-foreground">Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium text-sm text-foreground">{event.title}</h4>
                    <p className="text-xs text-muted-foreground">Date: {event.date}</p>
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
              <CardTitle className="text-lg text-foreground">Recent Notices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {notices.map((notice) => (
                <div key={notice.id} className="p-4 border rounded-lg">
                  <p className="text-sm text-foreground">{notice.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">Date: {notice.date}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detailed Examination Section */}
      <ChildExamDetailsCard />

      {/* Edit Profile Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSaveProfile}>
            <DialogHeader>
              <DialogTitle>Edit Profile Information</DialogTitle>
              <DialogDescription>
                Update your contact details below.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="parent" className="text-right text-xs">
                  Parent Name
                </Label>
                <Input
                  id="parent"
                  value={editForm.parent}
                  onChange={(e) => setEditForm({ ...editForm, parent: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right text-xs">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right text-xs">
                  Phone
                </Label>
                <Input
                  id="phone"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

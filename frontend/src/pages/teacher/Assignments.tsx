import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Users, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Assignment {
  id: string;
  teacherName: string;
  subject: string;
  class: string;
  section: string;
  startDate: string;
  endDate: string;
  status: "active" | "completed" | "pending";
}

const mockAssignments: Assignment[] = [
  {
    id: "1",
    teacherName: "Sarah Johnson",
    subject: "Mathematics",
    class: "10th Grade",
    section: "A",
    startDate: "2024-01-15",
    endDate: "2024-06-15",
    status: "active"
  },
  {
    id: "2",
    teacherName: "Michael Brown",
    subject: "Physics",
    class: "12th Grade",
    section: "B",
    startDate: "2024-01-15",
    endDate: "2024-06-15",
    status: "active"
  },
  {
    id: "3",
    teacherName: "Emily Davis",
    subject: "English",
    class: "9th Grade",
    section: "C",
    startDate: "2024-01-15",
    endDate: "2024-06-15",
    status: "completed"
  }
];


const TeacherAssignments = () => {
  const [assignments, setAssignments] = useState<Assignment[]>(mockAssignments);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    teacherName: "",
    subject: "",
    class: "",
    section: "",
    startDate: "",
    endDate: ""
  });
  const { toast } = useToast();

  const handleAddAssignment = () => {
    if (!newAssignment.teacherName || !newAssignment.subject || !newAssignment.class) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const assignment: Assignment = {
      id: Math.random().toString(36).substr(2, 9),
      ...newAssignment,
      status: "pending"
    };

    setAssignments([...assignments, assignment]);
    setNewAssignment({
      teacherName: "",
      subject: "",
      class: "",
      section: "",
      startDate: "",
      endDate: ""
    });
    setIsDialogOpen(false);
    
    toast({
      title: "Success",
      description: "Teacher assignment added successfully"
    });
  };

  const getStatusBadge = (status: Assignment["status"]) => {
    const variants = {
      active: "default",
      completed: "secondary",
      pending: "outline"
    } as const;
    
    return (
      <Badge variant={variants[status]} className="capitalize">
        {status}
      </Badge>
    );
  };

  return (
    <div className="p-8 ml-9 space-y-8 bg-gradient-subtle min-h-screen w-[1058px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold ">
            Teacher Assignments
          </h1>
          <p className="text-gray-500 text-xs mt-2">
            Manage teacher class and subject assignments
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-glow hover:shadow-lg transition-all">
              <Plus className="mr-2 h-4 w-4" />
              New Assignment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-lg text-center">Create New Assignment</DialogTitle>
              
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="teacher" className="text-right">
                  Teacher
                </Label>
                <Input
                  id="teacher"
                  value={newAssignment.teacherName}
                  onChange={(e) => setNewAssignment({...newAssignment, teacherName: e.target.value})}
                  className="col-span-3"
                  placeholder="Teacher name"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="subject" className="text-right">
                  Subject
                </Label>
                <Select onValueChange={(value) => setNewAssignment({...newAssignment, subject: value})}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mathematics">Mathematics</SelectItem>
                    <SelectItem value="physics">Physics</SelectItem>
                    <SelectItem value="chemistry">Chemistry</SelectItem>
                    <SelectItem value="biology">Biology</SelectItem>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="history">History</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="class" className="text-right">
                  Class
                </Label>
                <Select onValueChange={(value) => setNewAssignment({...newAssignment, class: value})}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="9th Grade">9th Grade</SelectItem>
                    <SelectItem value="10th Grade">10th Grade</SelectItem>
                    <SelectItem value="11th Grade">11th Grade</SelectItem>
                    <SelectItem value="12th Grade">12th Grade</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="section" className="text-right">
                  Section
                </Label>
                <Input
                  id="section"
                  value={newAssignment.section}
                  onChange={(e) => setNewAssignment({...newAssignment, section: e.target.value})}
                  className="col-span-3"
                  placeholder="Section (A, B, C...)"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="startDate" className="text-right">
                  Start Date
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={newAssignment.startDate}
                  onChange={(e) => setNewAssignment({...newAssignment, startDate: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="endDate" className="text-right">
                  End Date
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={newAssignment.endDate}
                  onChange={(e) => setNewAssignment({...newAssignment, endDate: e.target.value})}
                  className="col-span-3"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddAssignment}>
                Create Assignment
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignments.length}</div>
            <p className="text-xs text-gray-500">
              Active teacher assignments
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Assignments</CardTitle>
            <BookOpen className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {assignments.filter(a => a.status === "active").length}
            </div>
            <p className="text-xs text-gray-500">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subjects Covered</CardTitle>
            <BookOpen className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(assignments.map(a => a.subject)).size}
            </div>
            <p className="text-xs text-gray-500">
              Different subjects
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="text-lg">Assignment Overview</CardTitle>
          <CardDescription className="text-xs text-gray-500">
            Current teacher assignments and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Teacher Name</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-xs">
              {assignments.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell className="font-medium">{assignment.teacherName}</TableCell>
                  <TableCell>{assignment.subject}</TableCell>
                  <TableCell>{assignment.class}</TableCell>
                  <TableCell>{assignment.section}</TableCell>
                  <TableCell>
                    {assignment.startDate} to {assignment.endDate}
                  </TableCell>
                  <TableCell>{getStatusBadge(assignment.status)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherAssignments;
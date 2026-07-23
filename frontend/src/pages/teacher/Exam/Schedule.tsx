import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  MapPin, 
  Plus,
  Edit3,
  Trash2
} from "lucide-react";

const ExamSchedule = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const [exams,setExams] = useState([
    {
      id: 1,
      subject: "Mathematics",
      class: "12A",
      date: "2024-01-20",
      time: "09:00 AM - 12:00 PM",
      room: "Room 101",
      students: 45,
      teacher: "Prof. Anderson",
      type: "Final"
    },
    {
      id: 2,
      subject: "Physics",
      class: "11B",
      date: "2024-01-22",
      time: "02:00 PM - 05:00 PM",
      room: "Lab 203",
      students: 38,
      teacher: "Dr. Wilson",
      type: "Midterm"
    },
    {
      id: 3,
      subject: "Chemistry",
      class: "10C",
      date: "2024-01-25",
      time: "10:00 AM - 01:00 PM",
      room: "Lab 105",
      students: 42,
      teacher: "Prof. Davis",
      type: "Quiz"
    }
  ]);

  const handleDelete = (id:number) => {
    if (!window.confirm("Are you sure you want to delete this exam?")) return;

  setExams(prev => prev.filter(exam => exam.id !== id));
  }

  const getExamTypeBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case "final":
        return <Badge className="bg-destructive text-destructive-foreground">Final</Badge>;
      case "midterm":
        return <Badge className="bg-warning text-warning-foreground">Midterm</Badge>;
      case "quiz":
        return <Badge className="bg-success text-success-foreground">Quiz</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6 m-4 ml-9">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Exam Schedule</h2>
          <p className="text-gray-500 text-xs">Manage and organize exam schedules</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button >
              <Plus className=" h-4 w-4" />
              Schedule New Exam
            </Button>
          </DialogTrigger>
          <DialogContent className="xs:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Schedule New Exam</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="Mathematics" />
                </div>
                <div>
                  <Label htmlFor="class">Class</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10a">Class 10A</SelectItem>
                      <SelectItem value="10b">Class 10B</SelectItem>
                      <SelectItem value="11a">Class 11A</SelectItem>
                      <SelectItem value="12a">Class 12A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" type="date" />
                </div>
                <div>
                  <Label htmlFor="time">Time</Label>
                  <Input id="time" placeholder="09:00 AM - 12:00 PM" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="room">Room</Label>
                  <Input id="room" placeholder="Room 101" />
                </div>
                <div>
                  <Label htmlFor="type">Exam Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="quiz">Quiz</SelectItem>
                      <SelectItem value="midterm">Midterm</SelectItem>
                      <SelectItem value="final">Final</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="destructive"  onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button >Schedule Exam</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CalendarIcon className="h-5 w-5" />
              Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Exam List */}
        <div className="lg:col-span-2 " >
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Upcoming Exams</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {exams.map((exam) => (
                  <div key={exam.id} className="bg-gradient-muted p-4 rounded-lg border transition-smooth hover:shadow-card">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-md">{exam.subject}</h3>
                          {getExamTypeBadge(exam.type)}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-2 text-xs">
                            <CalendarIcon className="h-4 w-4 " />
                            {exam.date}
                          </div>
                          <div className="flex text-xs items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {exam.time}
                          </div>
                          <div className="flex items-center text-xs gap-2">
                            <MapPin className="h-4 w-4" />
                            {exam.room}
                          </div>
                          <div className="flex text-xs items-center gap-2">
                            <Users className="h-4 w-4" />
                            {exam.students} students
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <span className="text-xs">
                            <strong>Class:</strong> {exam.class} | <strong>Teacher:</strong> {exam.teacher}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10"  onClick={() => handleDelete(exam.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ExamSchedule;
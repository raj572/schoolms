import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar,
  Clock,
  Plus,
  Download,
  Filter
} from "lucide-react";
import Heading from "@/components/common/Heading";
import { Link } from "react-router-dom";

export const TimeTable= () => {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const timeSlots = [
    "08:00 - 09:00",
    "09:00 - 10:00", 
    "10:00 - 11:00",
    "11:30 - 12:30",
    "12:30 - 13:30",
    "14:00 - 15:00",
    "15:00 - 16:00"
  ];

  const timetableData = {
    "Monday": {
      "08:00 - 09:00": { subject: "Mathematics", teacher: "Dr. Sarah Johnson", room: "Room 101", grade: "10-A" },
      "09:00 - 10:00": { subject: "Physics", teacher: "Dr. Emily Davis", room: "Lab 301", grade: "11-A" },
      "10:00 - 11:00": { subject: "English", teacher: "Prof. Michael Brown", room: "Room 205", grade: "9-B" },
      "11:30 - 12:30": { subject: "Chemistry", teacher: "Dr. Lisa Wilson", room: "Lab 302", grade: "12-A" },
      "12:30 - 13:30": null, // Break
      "14:00 - 15:00": { subject: "History", teacher: "Mr. Robert Wilson", room: "Room 102", grade: "8-C" },
      "15:00 - 16:00": { subject: "Biology", teacher: "Dr. Mark Taylor", room: "Lab 303", grade: "11-B" }
    },
    "Tuesday": {
      "08:00 - 09:00": { subject: "English", teacher: "Prof. Michael Brown", room: "Room 205", grade: "9-B" },
      "09:00 - 10:00": { subject: "Mathematics", teacher: "Dr. Sarah Johnson", room: "Room 101", grade: "10-A" },
      "10:00 - 11:00": { subject: "History", teacher: "Mr. Robert Wilson", room: "Room 102", grade: "8-C" },
      "11:30 - 12:30": { subject: "Physics", teacher: "Dr. Emily Davis", room: "Lab 301", grade: "11-A" },
      "12:30 - 13:30": null,
      "14:00 - 15:00": { subject: "Chemistry", teacher: "Dr. Lisa Wilson", room: "Lab 302", grade: "12-A" },
      "15:00 - 16:00": { subject: "Physical Education", teacher: "Coach Anderson", room: "Gym", grade: "All" }
    },
  };

  const getCurrentClass = (day: string, timeSlot: string) => {
    return timetableData[day as keyof typeof timetableData]?.[timeSlot as keyof typeof timetableData.Monday];
  };

  return (
    <div className="space-y-6 ">

      {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Heading title="Class Timetable" description="Weekly schedule and class timings"/>

          <div className="flex gap-2">
            <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter Grade
          </Button>
            <Link to="/principal/classes/list">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Class
              </Button>
            </Link>
          </div>
        </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 ">
        <Card className="bg-gradient-card shadow-soft ">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500">Total Classes</p>
                <p className="text-lg font-bold">35</p>
              </div>
              <Calendar className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500">Active Teachers</p>
                <p className="text-lg font-bold">18</p>
              </div>
              <Clock className="h-7 w-7 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500">Subjects</p>
                <p className="text-lg font-bold">12</p>
              </div>
              <Badge className="bg-success text-sugray-500text-gray-500">Active</Badge>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500">Grades</p>
                <p className="text-lg font-bold">12</p>
              </div>
              <Badge className="bg-primary text-prgray-500text-gray-500">1-12</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timetable Grid */}
      <Card className="bg-gradient-card shadow-soft w-[1030px]">
        <CardHeader>
          <CardTitle className="text-lg">Weekly Timetable</CardTitle>
          <CardDescription className="text-xs text-gray-500">Current academic week schedule</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border border-border text-sm bg-muted p-3 text-left font-medium">
                    Time Slot
                  </th>
                  {days.map((day) => (
                    <th key={day} className="border border-border bg-muted p-3 text-center font-medium min-w-[100px]">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((timeSlot) => (
                  <tr key={timeSlot}>
                    <td className="border border-border text-xs p-3 font-medium bg-muted/30">
                      {timeSlot}
                    </td>
                    {days.map((day) => {
                      const classInfo = getCurrentClass(day, timeSlot);
                      
                      if (timeSlot === "12:30 - 13:30") {
                        return (
                          <td key={day} className="border border-border p-3 text-center bg-warning/10">
                            <div className="text-xs font-medium text-wagray-500text-gray-500">
                              Lunch Break
                            </div>
                          </td>
                        );
                      }
                      
                      return (
                        <td key={day} className="border border-border p-2">
                          {classInfo ? (
                            <div className="bg-primary/10 p-3 rounded-lg hover:bg-primary/20 transition-colors cursor-pointer">
                              <div className="font-medium text-xs text-primary">
                                {classInfo.subject}
                              </div>
                              <div className="text-xs text-gray-500">
                                {classInfo.teacher}
                              </div>
                              <div className="text-xs text-gray-500">
                                {classInfo.room} • {classInfo.grade}
                              </div>
                            </div>
                          ) : (
                            <div className="h-16 flex items-center justify-center text-gray-500 text-xs">
                              Free Period
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
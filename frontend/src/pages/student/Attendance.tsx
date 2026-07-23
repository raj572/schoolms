import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle, XCircle, Clock } from "lucide-react";

export default function StudentAttendance() {
  const attendanceData = [
    { subject: "Mathematics", total: 45, present: 42, percentage: 93 },
    { subject: "Physics", total: 40, present: 32, percentage: 80 },
    { subject: "Computer Science", total: 38, present: 36, percentage: 95 },
    { subject: "Literature", total: 35, present: 28, percentage: 80 },
    { subject: "Chemistry", total: 42, present: 38, percentage: 90 },
  ];

  const recentAttendance = [
    { date: "2025-03-25", subject: "Mathematics", status: "present" },
    { date: "2025-03-25", subject: "Physics", status: "present" },
    { date: "2025-03-24", subject: "Computer Science", status: "present" },
    { date: "2025-03-24", subject: "Literature", status: "absent" },
    { date: "2025-03-23", subject: "Chemistry", status: "present" },
  ];

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 75) return "text-yellow-600";
    return "text-red-600";
  };

  const getBadgeVariant = (percentage: number) => {
    if (percentage >= 90) return "secondary";
    if (percentage >= 75) return "outline";
    return "destructive";
  };

  return (
    <div className="p-6 space-y-6 ml-12 my-6">
      <div>
        <h1 className="text-lg font-bold ">Attendance</h1>
        <p className="text-gray-500 text-xs">Track your class attendance and performance</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex text-lg  items-center gap-2">
            <Calendar className="h-5 w-5" />
            Overall Attendance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-md font-bold text-green-600">87%</div>
              <p className="text-xs text-gray-500">Overall Attendance</p>
            </div>
            <div className="text-center">
              <div className="text-lg font-boldgray-500">176</div>
              <p className="text-xs text-gray-500">Classes Attended</p>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-destructive">24</div>
              <p className="text-xs text-gray-500">Classes Missed</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Subject-wise Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {attendanceData.map((subject) => (
              <div key={subject.subject} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium text-sm">{subject.subject}</h3>
                  <p className="text-xs text-gray-500">
                    {subject.present}/{subject.total} classes attended
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className={`text-lg font-bold ${getAttendanceColor(subject.percentage)}`}>
                      {subject.percentage}%
                    </div>
                  </div>
                  <Badge variant={getBadgeVariant(subject.percentage)}>
                    {subject.percentage >= 75 ? 'Good' : 'Low'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentAttendance.map((record, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {record.status === 'present' ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <div>
                    <p className="font-medium text-sm">{record.subject}</p>
                    <p className="text-xs text-gray-500">{record.date}</p>
                  </div>
                </div>
                <Badge variant={record.status === 'present' ? 'secondary' : 'destructive'}>
                  {record.status === 'present' ? 'Present' : 'Absent'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
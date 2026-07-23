import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, FileText, Download, Eye, Award } from "lucide-react";

export default function StudentExams() {
  const upcomingExams = [
    {
      id: 1,
      subject: "Mathematics",
      date: "2024-04-15",
      time: "09:00 AM - 12:00 PM",
      room: "Hall A",
      type: "Mid-Semester",
      syllabus: "Chapters 1-6"
    },
    {
      id: 2,
      subject: "Physics",
      date: "2024-04-17",
      time: "02:00 PM - 05:00 PM",
      room: "Hall B",
      type: "Mid-Semester",
      syllabus: "Units 1-4"
    },
    {
      id: 3,
      subject: "Computer Science",
      date: "2024-04-20",
      time: "09:00 AM - 12:00 PM",
      room: "Lab 201",
      type: "Practical",
      syllabus: "Programming Assignments"
    }
  ];

  const examResults = [
    {
      id: 1,
      subject: "Literature",
      examType: "Quiz",
      date: "2024-03-10",
      maxMarks: 25,
      obtainedMarks: 22,
      grade: "A"
    },
    {
      id: 2,
      subject: "Chemistry",
      examType: "Mid-Semester",
      date: "2024-02-28",
      maxMarks: 100,
      obtainedMarks: 87,
      grade: "A+"
    },
    {
      id: 3,
      subject: "Mathematics",
      examType: "Assignment",
      date: "2024-02-20",
      maxMarks: 50,
      obtainedMarks: 45,
      grade: "A"
    }
  ];

  const examTimetable = [
    { date: "2024-04-15", time: "09:00 AM", subject: "Mathematics", room: "Hall A" },
    { date: "2024-04-16", time: "02:00 PM", subject: "Literature", room: "Hall C" },
    { date: "2024-04-17", time: "02:00 PM", subject: "Physics", room: "Hall B" },
    { date: "2024-04-18", time: "09:00 AM", subject: "Chemistry", room: "Hall A" },
    { date: "2024-04-20", time: "09:00 AM", subject: "Computer Science", room: "Lab 201" },
  ];

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+': return 'text-green-600';
      case 'A': return 'text-blue-600';
      case 'B+': return 'text-yellow-600';
      case 'B': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="p-6 space-y-6  ml-12 my-6">
      <div>
        <h1 className="text-lg font-bold ">Examinations</h1>
        <p className="text-gray-500 text-xs">View exam schedules, results, and important information</p>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 shadow-md">
          <TabsTrigger value="upcoming" className="gap-2">
            <Calendar className="h-4 w-4" />
            Upcoming
          </TabsTrigger>
          <TabsTrigger value="timetable" className="gap-2">
            <Clock className="h-4 w-4" />
            Timetable
          </TabsTrigger>
          <TabsTrigger value="results" className="gap-2">
            <Award className="h-4 w-4" />
            Results
          </TabsTrigger>
          <TabsTrigger value="resources" className="gap-2">
            <FileText className="h-4 w-4" />
            Resources
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          <div className="grid gap-4">
            {upcomingExams.map((exam) => (
              <Card key={exam.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-md">{exam.subject}</CardTitle>
                      <p className="text-xs text-gray-500">{exam.type} Examination</p>
                    </div>
                    <Badge variant="outline">{exam.type}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-xs">{exam.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-xs">{exam.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-xs">{exam.room}</span>
                    </div>
                    <div className="text-xs">
                      <span className="font-medium">Syllabus: </span>
                      <span className="text-gray-500">{exam.syllabus}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="timetable" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Mid-Semester Examination Timetable</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {examTimetable.map((exam, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="font-semibold text-sm">{exam.date.split('-')[2]}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(exam.date).toLocaleDateString('en', { month: 'short' })}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{exam.subject}</h4>

                        <p className="text-xs text-gray-500">{exam.room}</p>
                      </div>
                    </div>
                    <Badge variant="outline">{exam.time}</Badge>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-end">
                <Button >
                  <Download className="h-4 w-4" />
                  Download Timetable
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <div className="grid gap-4">
            {examResults.map((result) => (
              <Card key={result.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="font-semibold text-sm">{result.subject}</h3>
                        <p className="text-xs text-gray-500">{result.examType} • {result.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-xs text-gray-500">Score</div>
                        <div className="font-semibold text-xs">
                          {result.obtainedMarks}/{result.maxMarks}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-500">Grade</div>
                        <div className={`text-sm font-bold ${getGradeColor(result.grade)}`}>
                          {result.grade}
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Exam Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Previous Year Papers</h4>
                  <p className="text-xs text-gray-500 mb-3">
                    Access previous examination papers for practice
                  </p>
                  <Button >
                    <Download className="h-3 w-3" />
                    Download
                  </Button>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Syllabus & Guidelines</h4>
                  <p className="text-xs text-gray-500 mb-3">
                    Detailed syllabus and exam guidelines
                  </p>
                  <Button size="sm" variant="outline" className="gap-2">
                    <Eye className="h-3 w-3" />
                    View
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
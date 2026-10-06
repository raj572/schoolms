import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Calendar, Clock, FileText, Download, Eye, Award } from "lucide-react";
import { exportToCsv } from "@/lib/exportUtils";
import { toast } from "sonner";
import { useState } from "react";

export default function StudentExams() {
  const [selectedResult, setSelectedResult] = useState<any>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showGuidelinesModal, setShowGuidelinesModal] = useState(false);

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

  const handleDownloadTimetable = () => {
    const headers = ["Date", "Time", "Subject", "Room"];
    const rows = examTimetable.map(item => [item.date, item.time, item.subject, item.room]);
    exportToCsv("exam_timetable.csv", headers, rows);
    toast.success("Exam timetable downloaded successfully");
  };

  const handleDownloadPreviousPapers = () => {
    const headers = ["Year", "Subject", "Exam Type", "Status"];
    const rows = [
      ["2023", "Mathematics", "Mid-Semester", "Available"],
      ["2023", "Physics", "Mid-Semester", "Available"],
      ["2023", "Chemistry", "Mid-Semester", "Available"],
    ];
    exportToCsv("previous_year_papers_sample.csv", headers, rows);
    toast.success("Previous year papers pack downloaded");
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+': return 'text-emerald-600 dark:text-emerald-400';
      case 'A': return 'text-blue-600 dark:text-blue-400';
      case 'B+': return 'text-amber-600 dark:text-amber-400';
      case 'B': return 'text-orange-600 dark:text-orange-400';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-full">
      <div>
        <h1 className="text-xl font-bold text-foreground">Examinations</h1>
        <p className="text-muted-foreground text-xs mt-1">View exam schedules, results, and important information</p>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1 p-1">
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
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <div>
                      <CardTitle className="text-md">{exam.subject}</CardTitle>
                      <p className="text-xs text-muted-foreground">{exam.type} Examination</p>
                    </div>
                    <Badge variant="outline">{exam.type}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs">{exam.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs">{exam.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs">{exam.room}</span>
                    </div>
                    <div className="text-xs">
                      <span className="font-medium">Syllabus: </span>
                      <span className="text-muted-foreground">{exam.syllabus}</span>
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
                  <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-2">
                    <div className="flex items-center gap-6">
                      <div className="text-center min-w-12">
                        <div className="font-semibold text-sm">{exam.date.split('-')[2]}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(exam.date).toLocaleDateString('en', { month: 'short' })}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{exam.subject}</h4>
                        <p className="text-xs text-muted-foreground">{exam.room}</p>
                      </div>
                    </div>
                    <Badge variant="outline">{exam.time}</Badge>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-end">
                <Button onClick={handleDownloadTimetable}>
                  <Download className="h-4 w-4 mr-2" />
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
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="font-semibold text-sm">{result.subject}</h3>
                        <p className="text-xs text-muted-foreground">{result.examType} • {result.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground">Score</div>
                        <div className="font-semibold text-xs">
                          {result.obtainedMarks}/{result.maxMarks}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground">Grade</div>
                        <div className={`text-sm font-bold ${getGradeColor(result.grade)}`}>
                          {result.grade}
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setSelectedResult(result);
                          setShowResultModal(true);
                        }}
                        title="View Result Details"
                      >
                        <Eye className="h-3 w-3 mr-1" /> View
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
                  <p className="text-xs text-muted-foreground mb-3">
                    Access previous examination papers for practice
                  </p>
                  <Button onClick={handleDownloadPreviousPapers}>
                    <Download className="h-3 w-3 mr-2" />
                    Download
                  </Button>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Syllabus & Guidelines</h4>
                  <p className="text-xs text-muted-foreground mb-3">
                    Detailed syllabus and exam guidelines
                  </p>
                  <Button size="sm" variant="outline" className="gap-2" onClick={() => setShowGuidelinesModal(true)}>
                    <Eye className="h-3 w-3" />
                    View
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Result Details Dialog */}
      <Dialog open={showResultModal} onOpenChange={setShowResultModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedResult?.subject} Result</DialogTitle>
            <DialogDescription>{selectedResult?.examType} • {selectedResult?.date}</DialogDescription>
          </DialogHeader>
          {selectedResult && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg text-center">
                <div>
                  <p className="text-xs text-muted-foreground">Obtained / Max</p>
                  <p className="text-lg font-bold">{selectedResult.obtainedMarks} / {selectedResult.maxMarks}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Grade</p>
                  <p className={`text-lg font-bold ${getGradeColor(selectedResult.grade)}`}>{selectedResult.grade}</p>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                <p><strong>Status:</strong> Passed</p>
                <p className="mt-1"><strong>Remarks:</strong> Excellent performance. Keep up the good work!</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Syllabus Guidelines Dialog */}
      <Dialog open={showGuidelinesModal} onOpenChange={setShowGuidelinesModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Examination Guidelines & Syllabus</DialogTitle>
            <DialogDescription>General instructions for students</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-xs text-foreground pt-2">
            <p><strong>1. Reporting Time:</strong> Arrive 15 minutes before exam commencement.</p>
            <p><strong>2. ID Card:</strong> Carrying valid student ID card is mandatory.</p>
            <p><strong>3. Electronic Devices:</strong> Mobile phones, smartwatches, and electronic gadgets are strictly prohibited.</p>
            <p><strong>4. Syllabus:</strong> All topics covered up to current term units.</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
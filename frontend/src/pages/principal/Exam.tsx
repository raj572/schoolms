import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  ClipboardCheck,
  Calendar,
  Award,
  BarChart3,
  Plus,
  Search,
  Download,
  Eye,
  Edit,
  FileText,
  Loader2,
  Clock,
  BookOpen,
  MapPin
} from "lucide-react";
import { Link } from "react-router-dom";
import Heading from "@/components/common/Heading";
import { useAuthStore } from "@/store/useAuthStore";
import { getAllExams as getAllExamsService, getExamSchedules, getExamStats, createExam as createExamService, getStudentResults, getExamResults, getClasses, generateReportCard, type Exam as ExamType, type ExamSchedule } from "@/services/examApiService";
import { useToast } from "@/hooks/use-toast";
import { ExamScheduleDialog } from "@/components/principal/ExamScheduleDialog";
import { MarksEntryDialog } from "@/components/principal/MarksEntryDialog";
import { StudentWiseMarksEntry } from "@/components/principal/StudentWiseMarksEntry";
import { CsvMarksImport } from "@/components/principal/CsvMarksImport";
import { formatTime12Hour, formatDate, calculateDuration } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Exam = () => {
  const { toast } = useToast();
  const authUser = useAuthStore((state) => state.authUser);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [exams, setExams] = useState<ExamType[]>([]);
  const [examSchedules, setExamSchedules] = useState<ExamSchedule[]>([]);
  const [examResultsData, setExamResultsData] = useState<any[]>([]);
  const [studentResultsData, setStudentResultsData] = useState<any[]>([]);
  const [isExamDialogOpen, setIsExamDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState<number | null>(null);
  const [isMarksDialogOpen, setIsMarksDialogOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);
  const [examSchedulesByExam, setExamSchedulesByExam] = useState<Record<number, ExamSchedule[]>>({});
  const [scheduleDialogMode, setScheduleDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedExamForReport, setSelectedExamForReport] = useState<string>("");
  const [selectedClassForResults, setSelectedClassForResults] = useState<string>("");
  const [selectedExamForResults, setSelectedExamForResults] = useState<string>("");
  const [classes, setClasses] = useState<Array<{ id: number; class: string; section: string; class_name?: string }>>([]);
  const [stats, setStats] = useState({
    upcomingExams: 0,
    completedExams: 0,
    averageScore: 0,
    passRate: 0,
  });

  // Helper function to format class name
  const formatClassName = (schoolClass: any) => {
    if (!schoolClass) return 'Class';
    const classNum = schoolClass.class || '';
    const section = schoolClass.section || '';
    return section ? `Class ${classNum}-${section}` : `Class ${classNum}`;
  };

  // Helper function to aggregate classes from schedules
  const aggregateClasses = (schedules: ExamSchedule[]): string => {
    if (!schedules || schedules.length === 0) return 'All Grades';
    
    const uniqueClasses = schedules
      .map(s => s.school_class)
      .filter(Boolean)
      .map(c => `Class ${c?.class}${c?.section ? `-${c.section}` : ''}`)
      .filter((v, i, arr) => arr.indexOf(v) === i);
    
    if (uniqueClasses.length === 0) return 'All Grades';
    if (uniqueClasses.length > 3) return 'All Classes';
    return uniqueClasses.join(', ');
  };

  // Helper function to aggregate subjects from schedules
  const aggregateSubjects = (schedules: ExamSchedule[]): string => {
    if (!schedules || schedules.length === 0) return 'All Subjects';
    
    const uniqueSubjects = schedules
      .map(s => s.subject?.subject_name)
      .filter(Boolean)
      .filter((v, i, arr) => arr.indexOf(v) === i);
    
    if (uniqueSubjects.length === 0) return 'All Subjects';
    if (uniqueSubjects.length > 3) return 'All Subjects';
    return uniqueSubjects.join(', ');
  };

  useEffect(() => {
    fetchExamsData();
  }, [authUser?.school_id]);

  const fetchExamsData = async () => {
    if (!authUser?.school_id) return;
    
    const schoolId = Number(authUser.school_id);
    if (isNaN(schoolId)) return;

    setIsLoading(true);
    try {
      // Fetch exams
      const examsResult = await getAllExamsService(schoolId);
      if (examsResult.status && examsResult.data) {
        setExams(examsResult.data);
      }

      // Fetch stats
      const statsResult = await getExamStats(schoolId);
      if (statsResult.status && statsResult.data) {
        setStats(statsResult.data);
      }

      // Fetch exam results with calculated stats
      const examResultsResult = await getExamResults(schoolId);
      if (examResultsResult.status && examResultsResult.data) {
        setExamResultsData(examResultsResult.data);
      }

      // Fetch classes for dropdown
      const classesResult = await getClasses(schoolId);
      if (classesResult.status && classesResult.data) {
        setClasses(classesResult.data);
      }

      // Don't fetch student results here - wait for user to select class and exam

      // Fetch schedules for all exams
      if (examsResult.data && examsResult.data.length > 0) {
        const schedulesPromises = examsResult.data.map(exam => getExamSchedules(exam.id));
        const schedulesResults = await Promise.all(schedulesPromises);
        
        const schedulesByExam: Record<number, ExamSchedule[]> = {};
        
        examsResult.data.forEach((exam, index) => {
          if (schedulesResults[index].status && schedulesResults[index].data) {
            schedulesByExam[exam.id] = schedulesResults[index].data;
          }
        });
        
        setExamSchedulesByExam(schedulesByExam);
        
        // Also set flat array for backwards compatibility
        const allSchedules: ExamSchedule[] = Object.values(schedulesByExam).flat();
        setExamSchedules(allSchedules);
      }
    } catch (error) {
      console.error('Error fetching exam data:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch exam data',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch student results when class, exam, or search term changes
  useEffect(() => {
    if (authUser?.school_id && selectedClassForResults && selectedExamForResults) {
      const schoolId = Number(authUser.school_id);
      const classId = parseInt(selectedClassForResults);
      const examId = parseInt(selectedExamForResults);
      
      if (!isNaN(schoolId) && !isNaN(classId) && !isNaN(examId)) {
        setIsLoading(true);
        getStudentResults(schoolId, examId, classId, searchTerm || undefined).then(result => {
          if (result.status && result.data) {
            setStudentResultsData(result.data);
          } else {
            setStudentResultsData([]);
          }
          setIsLoading(false);
        }).catch(() => {
          setStudentResultsData([]);
          setIsLoading(false);
        });
      }
    } else {
      // Clear results if filters not complete
      setStudentResultsData([]);
    }
  }, [selectedClassForResults, selectedExamForResults, searchTerm, authUser?.school_id]);

  // Calculate upcoming exams with dynamic data from schedules
  const upcomingExams = exams
    .filter(exam => new Date(exam.end_date) >= new Date() && exam.status === 'scheduled')
    .slice(0, 10)
    .map(exam => {
      const schedules = examSchedulesByExam[exam.id] || [];
      const firstSchedule = schedules[0];
      
      return {
        id: exam.id.toString(),
        title: exam.exam_name,
        grade: aggregateClasses(schedules),
        subject: aggregateSubjects(schedules),
        date: formatDate(exam.start_date),
        time: firstSchedule ? formatTime12Hour(firstSchedule.start_time) : 'N/A',
        duration: firstSchedule ? calculateDuration(firstSchedule.start_time, firstSchedule.end_time) : 'N/A',
        room: firstSchedule?.room_number || 'Not Assigned',
        status: exam.status.charAt(0).toUpperCase() + exam.status.slice(1)
      };
    });

  // Use API exam results data which includes calculated stats
  const displayExamResults = examResultsData.map(result => ({
    examId: result.examId.toString(),
    title: result.title,
    grade: result.grade,
    totalStudents: result.totalStudents,
    avgScore: result.avgScore,
    passRate: result.passRate,
    status: result.status,
    date: formatDate(result.date)
  }));

  // Use actual data or show message if no student results
  const studentResults = studentResultsData.length > 0 ? studentResultsData : [];

  const handleCreateExam = async (examData: any) => {
    if (!authUser?.school_id) return;

    try {
      const result = await createExamService({
        ...examData,
        school_id: Number(authUser.school_id),
      });

      if (result.status) {
        toast({
          title: "Success",
          description: "Exam created successfully! Now add subjects and classes.",
        });
        setIsExamDialogOpen(false);
        fetchExamsData(); // Refresh the list
        
        // Open schedule dialog if we have an exam ID
        if (result.data?.id) {
          setSelectedExamId(result.data.id);
          setScheduleDialogMode('create');
          setIsScheduleDialogOpen(true);
        }
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message || "Failed to create exam",
        });
      }
    } catch (error) {
      console.error("Error creating exam:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create exam",
      });
    }
  };

  const handleGenerateReportCard = async (examId: number, studentId?: number) => {
    if (!examId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select an exam",
      });
      return;
    }

    try {
      // For now, just show a message - full report card generation would need student selection
      toast({
        title: "Info",
        description: "Report card generation feature - Select a student to generate their report card",
      });
    } catch (error) {
      console.error("Error generating report card:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate report card",
      });
    }
  };

  const handleExportResults = () => {
    // Export results to CSV
    if (displayExamResults.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No results to export",
      });
      return;
    }

    const csvHeaders = ['Exam Title', 'Grade', 'Students', 'Average Score', 'Pass Rate', 'Status', 'Date'];
    const csvRows = displayExamResults.map(result => [
      result.title,
      result.grade,
      result.totalStudents.toString(),
      `${result.avgScore}%`,
      `${result.passRate}%`,
      result.status,
      result.date,
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exam-results-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Results exported successfully",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
          <Heading title="Exams Management" description="Schedule exams, manage results, and generate reports" />

              <div className="flex gap-2">
                <Button variant="outline" onClick={handleExportResults}>
              <Download className="mr-2 h-4 w-4" />
              Export Results
            </Button>
                <Button onClick={() => setIsExamDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Exam
                </Button>
              </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-card shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Upcoming Exams</p>
                <p className="text-xl font-bold text-center">{stats.upcomingExams}</p>
              </div>
              <Calendar className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 ">Completed Exams</p>
                <p className="text-xl font-bold text-center">{stats.completedExams}</p>
              </div>
              <ClipboardCheck className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Average Score</p>
                <p className="text-xl font-bold text-center">{(stats.averageScore || 0).toFixed(1)}%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pass Rate</p>
                <p className="text-xl font-bold">{(stats.passRate || 0).toFixed(1)}%</p>
              </div>
              <Award className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="schedule" className="w-full">
        <div className="overflow-x-auto pb-2">
          <TabsList className="flex min-w-max w-full grid-cols-5 bg-muted/60 p-1">
            <TabsTrigger value="schedule">Exam Schedule</TabsTrigger>
            <TabsTrigger value="mark-entry">Marks Entry</TabsTrigger>
            <TabsTrigger value="results">Results Overview</TabsTrigger>
            <TabsTrigger value="students">Student Results</TabsTrigger>
            <TabsTrigger value="reports">Report Cards</TabsTrigger>
          </TabsList>
        </div>

        {/* Exam Schedule Tab */}
        <TabsContent value="schedule" className="space-y-4">
          <Card className="bg-gradient-card shadow-soft">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-lg">Upcoming Exams</CardTitle>
                  <CardDescription className="text-xs">Scheduled examinations for all grades</CardDescription>
                </div>
                <Button onClick={() => setIsExamDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule New Exam
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : exams.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="font-medium">No exams scheduled yet</p>
                  <p className="text-sm">Click "Schedule New Exam" to create your first exam</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {exams.map((exam) => (
                    <div key={exam.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-lg">{exam.exam_name}</h4>
                            <Badge variant={exam.status === 'scheduled' ? 'default' : exam.status === 'ongoing' ? 'default' : 'secondary'}>
                              {exam.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Type:</span> {exam.exam_type || 'Standard'}
                            </div>
                            <div>
                              <span className="font-medium">Start Date:</span> {new Date(exam.start_date).toLocaleDateString()}
                            </div>
                            <div>
                              <span className="font-medium">End Date:</span> {new Date(exam.end_date).toLocaleDateString()}
                            </div>
                            <div>
                              <span className="font-medium">Schedules:</span> {examSchedulesByExam[exam.id]?.length || 0}
                            </div>
                          </div>
                          {exam.description && (
                            <p className="text-sm text-gray-500 mt-2">{exam.description}</p>
                          )}
                          
                          {/* Show schedules if any */}
                          {examSchedulesByExam[exam.id] && examSchedulesByExam[exam.id].length > 0 && (
                            <div className="mt-4 pt-4 border-t">
                              <div className="flex justify-between items-center mb-3">
                                <h5 className="text-sm font-medium">Exam Schedules ({examSchedulesByExam[exam.id].length})</h5>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedExamId(exam.id);
                                    setScheduleDialogMode('edit');
                                    setIsScheduleDialogOpen(true);
                                  }}
                                  className="h-8"
                                >
                                  <Edit className="h-3 w-3 mr-1" />
                                  Edit Schedules
                                </Button>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {examSchedulesByExam[exam.id].map((schedule) => (
                                  <div key={schedule.id} className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <div className="flex items-start justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <BookOpen className="h-4 w-4 text-blue-600" />
                                        <span className="font-semibold text-sm text-blue-900 dark:text-blue-100">
                                          {schedule.subject?.subject_name || 'Subject'}
                                        </span>
                                      </div>
                                      <Badge variant="outline" className="text-xs">
                                        {schedule.total_marks} marks
                                      </Badge>
                                    </div>
                                    <div className="space-y-1 text-xs text-gray-700 dark:text-gray-300">
                                      <div className="flex items-center gap-2">
                                        <Calendar className="h-3 w-3" />
                                        <span>{formatDate(schedule.exam_date)}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Clock className="h-3 w-3" />
                                        <span>{formatTime12Hour(schedule.start_time)} - {formatTime12Hour(schedule.end_time)}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium">Class:</span>
                                        <span>{formatClassName(schedule.school_class)}</span>
                                      </div>
                                      {schedule.room_number && (
                                        <div className="flex items-center gap-2">
                                          <MapPin className="h-3 w-3" />
                                          <span>Room {schedule.room_number}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {!(examSchedulesByExam[exam.id]?.length > 0) && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => {
                                setSelectedExamId(exam.id);
                                setScheduleDialogMode('create');
                                setIsScheduleDialogOpen(true);
                              }}
                            >
                              Add Schedules
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Marks Entry Tab with three modes */}
        <TabsContent value="mark-entry" className="space-y-4">
          <Card className="bg-gradient-card shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg">Marks Entry</CardTitle>
              <CardDescription className="text-xs">Choose a method to enter exam marks</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : exams.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No exams scheduled yet
                </div>
              ) : (
                <Tabs defaultValue="schedule-wise" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="schedule-wise">By Schedule</TabsTrigger>
                    <TabsTrigger value="student-wise">By Student</TabsTrigger>
                    <TabsTrigger value="csv-import">CSV Import</TabsTrigger>
                  </TabsList>

                  {/* Schedule-wise (Original) */}
                  <TabsContent value="schedule-wise" className="space-y-4 mt-4">
                    <div className="space-y-4">
                      {exams.map((exam) => (
                        <div key={exam.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-center mb-4">
                            <div>
                              <h4 className="font-semibold">{exam.exam_name}</h4>
                              <p className="text-sm text-gray-500">
                                {new Date(exam.start_date).toLocaleDateString()} - {new Date(exam.end_date).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-sm text-gray-600">
                              Status: <Badge variant="secondary">{exam.status}</Badge>
                            </div>
                          </div>
                          
                          {examSchedulesByExam[exam.id] && examSchedulesByExam[exam.id].length > 0 ? (
                            <div className="mt-4 space-y-2">
                              <h5 className="text-sm font-medium mb-2">Exam Schedules:</h5>
                              {examSchedulesByExam[exam.id].map((schedule) => {
                                const marksCount = (schedule as any).marks?.length || 0;
                                const totalStudents = schedule.total_students || 0;
                                const hasMarks = marksCount > 0;
                                const progressText = totalStudents > 0 ? `${marksCount}/${totalStudents} students` : `${marksCount} entered`;
                                const progressPercentage = totalStudents > 0 ? Math.round((marksCount / totalStudents) * 100) : 0;
                                
                                const className = formatClassName(schedule.school_class);
                                const classNum = schedule.school_class?.class || '';
                                const section = schedule.school_class?.section || '';
                                
                                return (
                                  <div key={schedule.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-medium">{schedule.subject?.subject_name || 'Subject'}</span>
                                        {classNum && (
                                          <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-300">
                                            Class {classNum}
                                          </Badge>
                                        )}
                                        {section && (
                                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-300">
                                            Section {section}
                                          </Badge>
                                        )}
                                        {totalStudents > 0 && (
                                          <Badge 
                                            variant="outline" 
                                            className={`text-xs ${
                                              progressPercentage === 100 
                                                ? 'bg-green-50 text-green-700 border-green-300' 
                                                : hasMarks 
                                                  ? 'bg-yellow-50 text-yellow-700 border-yellow-300'
                                                  : 'bg-gray-50 text-gray-700 border-gray-300'
                                            }`}
                                          >
                                            {progressText}
                                          </Badge>
                                        )}
                                      </div>
                                      <span className="text-sm text-gray-500">
                                        • {schedule.total_marks} marks
                                      </span>
                                    </div>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedSchedule(schedule);
                                        setIsMarksDialogOpen(true);
                                      }}
                                    >
                                      {hasMarks ? 'Edit Marks' : 'Enter Marks'}
                                    </Button>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="mt-4 text-sm text-gray-500">
                              No schedules yet. Create schedules to enter marks.
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {examSchedules.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <p>No exam schedules yet. Create exam schedules to enter marks.</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* Student-wise */}
                  <TabsContent value="student-wise" className="mt-4">
                    <StudentWiseMarksEntry
                      exams={exams}
                      schoolId={Number(authUser?.school_id)}
                      onSuccess={fetchExamsData}
                    />
                  </TabsContent>

                  {/* CSV Import */}
                  <TabsContent value="csv-import" className="mt-4">
                    <CsvMarksImport
                      exams={exams}
                      onSuccess={fetchExamsData}
                    />
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Results Overview Tab */}
        <TabsContent value="results" className="space-y-4">
          <Card className="bg-gradient-card shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg">Exam Results Overview</CardTitle>
              <CardDescription className="text-xs text-gray-500">Summary of completed examinations</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : displayExamResults.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No completed exam results yet
                </div>
              ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Exam Title</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Students</TableHead>
                      <TableHead>Average Score</TableHead>
                      <TableHead>Pass Rate</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                      {displayExamResults.map((result) => (
                      <TableRow key={result.examId}>
                        <TableCell className="font-medium text-xs">{result.title}</TableCell>
                        <TableCell className="font-medium text-xs">{result.grade}</TableCell>
                        <TableCell className="font-medium text-xs">{result.totalStudents}</TableCell>
                        <TableCell className="font-medium text-xs">{result.avgScore}%</TableCell>
                        <TableCell>
                          <Badge variant={result.passRate >= 80 ? "default" : "destructive"}>
                            {result.passRate}%
                          </Badge>
                        </TableCell>
                        <TableCell>{result.date}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={result.status === "Results Published" ? "default" : "secondary"}
                          >
                            {result.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              // View/download individual exam report
                              const examId = parseInt(result.examId);
                              handleGenerateReportCard(examId);
                            }}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Student Results Tab */}
        <TabsContent value="students" className="space-y-4">
          <Card className="bg-gradient-card shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg">Individual Student Results</CardTitle>
              <CardDescription  className="text-xs text-gray-500">Select a class and exam to view student results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Class and Exam Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="select-class-results">Select Class *</Label>
                    <Select value={selectedClassForResults} onValueChange={setSelectedClassForResults}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a class..." />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id.toString()}>
                            {cls.class_name || `Class ${cls.class}${cls.section ? ` - ${cls.section}` : ''}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="select-exam-results">Select Exam *</Label>
                    <Select value={selectedExamForResults} onValueChange={setSelectedExamForResults}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose an exam..." />
                      </SelectTrigger>
                      <SelectContent>
                        {exams.map((exam) => (
                          <SelectItem key={exam.id} value={exam.id.toString()}>
                            {exam.exam_name} - {formatDate(exam.start_date)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Search Filter */}
                {selectedClassForResults && selectedExamForResults && (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                    <Input
                      placeholder="Search by student name or roll number..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                )}

                {/* Results Table */}
                {!selectedClassForResults || !selectedExamForResults ? (
                  <div className="text-center py-12 text-gray-500">
                    <p>Please select both a class and an exam to view student results.</p>
                  </div>
                ) : isLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : studentResults.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p>No student results found for the selected class and exam.</p>
                    <p className="text-sm mt-2">Results will appear here once marks are entered.</p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student Name</TableHead>
                          <TableHead>Roll No.</TableHead>
                          <TableHead>Grade</TableHead>
                          <TableHead>Subject</TableHead>
                          <TableHead>Marks</TableHead>
                          <TableHead>Grade</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {studentResults.map((student, index) => (
                          <TableRow key={`${student.studentId}-${student.subject}-${index}`}>
                            <TableCell className="font-medium text-xs">{student.name}</TableCell>
                            <TableCell className="font-medium text-xs">{student.rollNo}</TableCell>
                            <TableCell className="font-medium text-xs">{student.grade}</TableCell>
                            <TableCell className="font-medium text-xs">{student.subject}</TableCell>
                            <TableCell className="font-medium text-xs">{student.marks}</TableCell>
                            <TableCell>
                              <Badge variant="default">{student.grade_obtained}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={student.status === "Pass" ? "default" : "destructive"}
                              >
                                {student.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  if (selectedExamForResults && (student.studentDetailsId || student.studentId)) {
                                    // Use studentDetailsId if available, otherwise fallback to studentId
                                    const studentDetailsId = student.studentDetailsId || student.studentId;
                                    handleGenerateReportCard(parseInt(selectedExamForResults), studentDetailsId);
                                  }
                                }}
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Report Cards Tab */}
        <TabsContent value="reports" className="space-y-4">
          <Card className="bg-gradient-card shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg">Generate Report Cards</CardTitle>
              <CardDescription  className="text-xs text-gray-500">Create and manage student report cards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="select-exam">Select Exam</Label>
                    <Select value={selectedExamForReport} onValueChange={setSelectedExamForReport}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose an exam..." />
                      </SelectTrigger>
                      <SelectContent>
                        {exams.map((exam) => (
                          <SelectItem key={exam.id} value={exam.id.toString()}>
                            {exam.exam_name} - {formatDate(exam.start_date)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={() => selectedExamForReport && handleGenerateReportCard(parseInt(selectedExamForReport))}>
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Report Card
                    </Button>
                    <Button variant="outline" disabled={!selectedExamForReport}>
                      <Download className="h-4 w-4 mr-2" />
                      Download All
                    </Button>
                  </div>
                </div>
                
                {displayExamResults.length > 0 && (
                  <div className="mt-8">
                    <h4 className="font-semibold mb-4">Completed Exams - Ready for Report Cards</h4>
                    <div className="space-y-2">
                      {displayExamResults.map((result) => (
                        <div key={result.examId} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{result.title}</p>
                            <p className="text-sm text-gray-500">{result.date}</p>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleGenerateReportCard(parseInt(result.examId))}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Generate Reports
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {displayExamResults.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Completed Exams</h3>
                    <p className="text-gray-500 text-sm mb-4">
                      Complete exams and enter marks to generate report cards.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Schedule Exam Dialog */}
      <ScheduleExamDialog
        open={isExamDialogOpen}
        onOpenChange={setIsExamDialogOpen}
        onSave={handleCreateExam}
      />

      {/* Exam Schedule Dialog */}
      {selectedExamId && authUser?.school_id && (
        <ExamScheduleDialog
          open={isScheduleDialogOpen}
          onOpenChange={setIsScheduleDialogOpen}
          examId={selectedExamId}
          schoolId={Number(authUser.school_id)}
          mode={scheduleDialogMode}
          existingSchedules={
            scheduleDialogMode === 'edit' 
              ? (examSchedulesByExam[selectedExamId] || []).map(schedule => ({
                  id: schedule.id,
                  class_id: schedule.class_id,
                  subject_id: schedule.subject_id,
                  exam_date: schedule.exam_date,
                  start_time: schedule.start_time,
                  end_time: schedule.end_time,
                  total_marks: schedule.total_marks.toString(),
                  passing_marks: schedule.passing_marks.toString(),
                  room_number: schedule.room_number || '',
                  instructions: schedule.instructions || '',
                }))
              : []
          }
          onSave={(schedules) => {
            console.log('Schedules saved:', schedules);
            fetchExamsData();
          }}
        />
      )}

      {/* Marks Entry Dialog */}
      {selectedSchedule && (
        <MarksEntryDialog
          open={isMarksDialogOpen}
          onOpenChange={setIsMarksDialogOpen}
          scheduleId={selectedSchedule.id}
          scheduleName={selectedSchedule.subject?.subject_name || 'Exam'}
          totalMarks={selectedSchedule.total_marks}
          className={formatClassName(selectedSchedule.school_class)}
          classNumber={selectedSchedule.school_class?.class}
          section={selectedSchedule.school_class?.section}
          totalStudents={selectedSchedule.total_students}
        />
      )}
    </div>
  );
};

// Schedule Exam Dialog Component
const ScheduleExamDialog = ({
  open,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: any) => void;
}) => {
  const [formData, setFormData] = useState({
    exam_name: "",
    exam_type: "",
    start_date: "",
    end_date: "",
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Schedule New Exam</DialogTitle>
          <DialogDescription>
            Create a new examination schedule for your school
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="exam_name">Exam Name *</Label>
                <Input
                  id="exam_name"
                  placeholder="e.g., Mid-Term, Final Exam"
                  value={formData.exam_name}
                  onChange={(e) =>
                    setFormData({ ...formData, exam_name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="exam_type">Exam Type</Label>
                <Input
                  id="exam_type"
                  placeholder="e.g., Mid-Term, Final"
                  value={formData.exam_type}
                  onChange={(e) =>
                    setFormData({ ...formData, exam_type: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start_date">Start Date *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) =>
                    setFormData({ ...formData, start_date: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end_date">End Date *</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) =>
                    setFormData({ ...formData, end_date: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter exam description or instructions..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create Exam</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
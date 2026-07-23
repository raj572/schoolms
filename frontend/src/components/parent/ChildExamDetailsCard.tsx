import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Clock, 
  BookOpen, 
  AlertCircle, 
  Award, 
  TrendingUp,
  FileText,
  ChevronDown,
  ChevronUp,
  Download,
  BarChart3,
  Target
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { getAllExams, getExamSchedules, getStudentExamMarks, Exam, ExamSchedule, StudentExamMark } from '@/services/examApiService';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO, isFuture, isPast, isToday } from 'date-fns';

interface ExamWithSchedulesAndMarks extends Exam {
  schedules: ExamSchedule[];
  marks: StudentExamMark[];
}

export const ChildExamDetailsCard = () => {
  const { authUser } = useAuthStore();
  const { toast } = useToast();
  const [exams, setExams] = useState<ExamWithSchedulesAndMarks[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedExam, setExpandedExam] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    if (authUser?.school_id && authUser?.id) {
      fetchExamDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser?.school_id, authUser?.id]);

  const fetchExamDetails = async () => {
    if (!authUser?.school_id || !authUser?.id) return;

    try {
      setLoading(true);

      // Fetch all exams
      const examsResult = await getAllExams(parseInt(authUser.school_id));
      if (!examsResult.status || !examsResult.data) {
        throw new Error('Failed to fetch exams');
      }

      // Fetch student marks
      const marksResult = await getStudentExamMarks(
        parseInt(authUser.id),
        parseInt(authUser.school_id)
      );

      const studentMarks = marksResult.data || [];

      // Fetch schedules and combine with marks for each exam
      const examsWithData = await Promise.all(
        examsResult.data.map(async (exam) => {
          const schedulesResult = await getExamSchedules(exam.id);
          const schedules = schedulesResult.data || [];

          // Filter marks for this exam
          const examMarks = studentMarks.filter((mark) =>
            schedules.some((schedule) => schedule.id === mark.exam_schedule_id)
          );

          return {
            ...exam,
            schedules,
            marks: examMarks,
          };
        })
      );

      setExams(examsWithData);
    } catch (error) {
      console.error('Error fetching exam details:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load exam details. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const getExamStatus = (exam: Exam) => {
    const now = new Date();
    const startDate = parseISO(exam.start_date);
    const endDate = parseISO(exam.end_date);

    if (isPast(endDate)) {
      return { label: 'Completed', color: 'bg-gray-100 text-gray-700' };
    }
    if (isFuture(startDate)) {
      return { label: 'Upcoming', color: 'bg-blue-100 text-blue-700' };
    }
    if (now >= startDate && now <= endDate) {
      return { label: 'Ongoing', color: 'bg-green-100 text-green-700' };
    }
    return { label: 'Scheduled', color: 'bg-yellow-100 text-yellow-700' };
  };

  const getScheduleStatus = (schedule: ExamSchedule) => {
    const examDate = parseISO(schedule.exam_date);
    
    if (isToday(examDate)) {
      return { label: 'Today', color: 'bg-red-100 text-red-700', icon: <AlertCircle className="w-3 h-3" /> };
    }
    if (isFuture(examDate)) {
      return { label: 'Upcoming', color: 'bg-blue-100 text-blue-700', icon: <Calendar className="w-3 h-3" /> };
    }
    return { label: 'Completed', color: 'bg-gray-100 text-gray-700', icon: <Award className="w-3 h-3" /> };
  };

  const calculateExamPerformance = (examMarks: StudentExamMark[]) => {
    if (examMarks.length === 0) return null;

    const totalMarksObtained = examMarks.reduce((sum, mark) => sum + (mark.marks_obtained || 0), 0);
    const totalMarksMax = examMarks.reduce((sum, mark) => sum + mark.marks_total, 0);
    const percentage = totalMarksMax > 0 ? (totalMarksObtained / totalMarksMax) * 100 : 0;

    // Calculate pass/fail status
    const passedSubjects = examMarks.filter((mark) => {
      if (mark.marks_obtained === null) return false;
      const percentage = (mark.marks_obtained / mark.marks_total) * 100;
      return percentage >= 33; // Assuming 33% is passing
    }).length;

    return {
      totalObtained: totalMarksObtained,
      totalMax: totalMarksMax,
      percentage: percentage.toFixed(2),
      subjectsCompleted: examMarks.filter(m => m.status === 'submitted').length,
      totalSubjects: examMarks.length,
      passedSubjects,
      grade: percentage >= 90 ? 'A+' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B' : percentage >= 60 ? 'C' : percentage >= 50 ? 'D' : percentage >= 33 ? 'E' : 'F',
    };
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 75) return 'text-blue-600';
    if (percentage >= 60) return 'text-yellow-600';
    if (percentage >= 33) return 'text-orange-600';
    return 'text-red-600';
  };

  const filterExams = (filterType: string) => {
    const now = new Date();
    
    return exams.filter((exam) => {
      const endDate = parseISO(exam.end_date);
      const startDate = parseISO(exam.start_date);

      switch (filterType) {
        case 'upcoming':
          return isFuture(startDate) || (now >= startDate && now <= endDate);
        case 'completed':
          return isPast(endDate);
        case 'all':
        default:
          return true;
      }
    });
  };

  const renderExamCard = (exam: ExamWithSchedulesAndMarks) => {
    const status = getExamStatus(exam);
    const performance = calculateExamPerformance(exam.marks);
    const isExpanded = expandedExam === exam.id;
    const percentageColor = performance ? getPerformanceColor(parseFloat(performance.percentage)) : '';

    return (
      <Card key={exam.id} className="overflow-hidden border-l-4 border-l-primary shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <CardTitle className="text-lg">{exam.exam_name}</CardTitle>
                <Badge variant="outline" className={status.color}>
                  {status.label}
                </Badge>
                {exam.exam_type && (
                  <Badge variant="secondary" className="text-xs">
                    {exam.exam_type}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600 mt-2 flex-wrap">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {format(parseISO(exam.start_date), 'MMM dd')} - {format(parseISO(exam.end_date), 'MMM dd, yyyy')}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  <span>{exam.schedules.length} subjects</span>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpandedExam(isExpanded ? null : exam.id)}
              className="ml-2"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>

          {/* Enhanced Performance Summary for Parents */}
          {performance && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                  <p className={`text-3xl font-bold ${percentageColor}`}>{performance.percentage}%</p>
                  <p className="text-xs text-gray-500 mt-1">Overall Score</p>
                  <Badge variant="outline" className="mt-1">
                    Grade {performance.grade}
                  </Badge>
                </div>
                <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                  <p className="text-2xl font-bold text-gray-700">
                    {performance.totalObtained}/{performance.totalMax}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Total Marks</p>
                  <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-primary h-1.5 rounded-full transition-all"
                      style={{ width: `${performance.percentage}%` }}
                    />
                  </div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                  <p className="text-2xl font-bold text-green-600">
                    {performance.passedSubjects}/{performance.totalSubjects}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Passed</p>
                  <p className="text-xs text-green-600 font-medium mt-1">
                    {((performance.passedSubjects / performance.totalSubjects) * 100).toFixed(0)}% Pass Rate
                  </p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                  <p className="text-2xl font-bold text-blue-600">
                    {performance.subjectsCompleted}/{performance.totalSubjects}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Results Declared</p>
                  {performance.subjectsCompleted === performance.totalSubjects ? (
                    <Badge variant="outline" className="mt-1 bg-green-50 text-green-700">Complete</Badge>
                  ) : (
                    <Badge variant="outline" className="mt-1 bg-yellow-50 text-yellow-700">Pending</Badge>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardHeader>

        {/* Expanded Content */}
        {isExpanded && (
          <CardContent className="pt-4">
            {exam.description && (
              <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                <p className="text-sm text-gray-700 flex items-start gap-2">
                  <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  {exam.description}
                </p>
              </div>
            )}

            {/* Performance Insights for Parents */}
            {performance && (
              <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-sm flex items-center gap-2 mb-3 text-purple-900">
                  <BarChart3 className="w-4 h-4" />
                  Performance Insights
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Target className="w-3.5 h-3.5 text-purple-600" />
                    <span>
                      {parseFloat(performance.percentage) >= 75 ? 'Excellent' : parseFloat(performance.percentage) >= 60 ? 'Good' : parseFloat(performance.percentage) >= 40 ? 'Average' : 'Needs Improvement'} performance overall
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <TrendingUp className="w-3.5 h-3.5 text-green-600" />
                    <span>
                      {performance.passedSubjects === performance.totalSubjects 
                        ? 'Passed all subjects!' 
                        : `${performance.totalSubjects - performance.passedSubjects} subject(s) need attention`}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Subject-wise Details */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Subject-wise Performance
              </h4>
              
              {exam.schedules.map((schedule) => {
                const mark = exam.marks.find((m) => m.exam_schedule_id === schedule.id);
                const scheduleStatus = getScheduleStatus(schedule);
                const marksPercentage = mark && mark.marks_obtained !== null 
                  ? ((mark.marks_obtained / mark.marks_total) * 100).toFixed(1)
                  : null;
                const isPassed = marksPercentage ? parseFloat(marksPercentage) >= 33 : false;

                return (
                  <div
                    key={schedule.id}
                    className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-all bg-white"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h5 className="font-medium text-sm">{schedule.subject?.subject_name}</h5>
                          <Badge variant="outline" className={scheduleStatus.color}>
                            {scheduleStatus.icon}
                            {scheduleStatus.label}
                          </Badge>
                          {mark && mark.marks_obtained !== null && (
                            <Badge variant={isPassed ? "default" : "destructive"} className="text-xs">
                              {isPassed ? '✓ Passed' : '✗ Failed'}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(parseISO(schedule.exam_date), 'EEE, MMM dd, yyyy')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {schedule.start_time} - {schedule.end_time}
                          </span>
                          {schedule.room_number && (
                            <span>Room: {schedule.room_number}</span>
                          )}
                        </div>
                      </div>
                      
                      {/* Marks Display */}
                      {mark ? (
                        <div className="text-right ml-4">
                          <div className={`text-xl font-bold ${marksPercentage ? getPerformanceColor(parseFloat(marksPercentage)) : 'text-gray-400'}`}>
                            {mark.marks_obtained !== null ? mark.marks_obtained : '-'} / {mark.marks_total}
                          </div>
                          {marksPercentage && (
                            <div className={`text-sm font-semibold ${getPerformanceColor(parseFloat(marksPercentage))}`}>
                              {marksPercentage}%
                            </div>
                          )}
                          {mark.grade && (
                            <Badge variant="secondary" className="mt-1">
                              Grade: {mark.grade}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-400 ml-4">
                          Max: {schedule.total_marks}
                        </div>
                      )}
                    </div>

                    {schedule.instructions && (
                      <div className="mt-2 p-2 bg-yellow-50 rounded text-xs text-gray-600 border border-yellow-200">
                        <span className="font-medium">Instructions:</span> {schedule.instructions}
                      </div>
                    )}

                    {mark?.remarks && (
                      <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-gray-600 border border-blue-200">
                        <span className="font-medium">Teacher's Remarks:</span> {mark.remarks}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Action Buttons for Parents */}
            <div className="flex flex-col sm:flex-row gap-2 mt-4 pt-4 border-t border-gray-200">
              <Button variant="default" size="sm" className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Download Report Card
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <BarChart3 className="w-4 h-4 mr-2" />
                Detailed Analysis
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <TrendingUp className="w-4 h-4 mr-2" />
                Compare Performance
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    );
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Your Child's Examination Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const filteredExams = filterExams(activeTab);

  return (
    <Card className="h-full shadow-lg">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
        <CardTitle className="text-lg flex items-center gap-2">
          <Award className="w-5 h-5 text-primary" />
          Your Child's Examination Details
        </CardTitle>
        <p className="text-xs text-gray-600 mt-1">
          Track academic performance and examination schedules
        </p>
      </CardHeader>
      <CardContent className="pt-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="all">All Exams</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {filteredExams.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Calendar className="w-12 h-12 text-gray-300 mb-2" />
                <p className="text-sm text-gray-600">No exams found</p>
                <p className="text-xs text-gray-400 mt-1">Check back later for examination updates</p>
              </div>
            ) : (
              filteredExams.map(renderExamCard)
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ChildExamDetailsCard;


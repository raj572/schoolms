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
  Download
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { getStudentExams, getStudentExamSchedules, getStudentMarks, Exam, ExamSchedule, StudentExamMark } from '@/services/studentExamApiService';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO, isFuture, isPast, isToday } from 'date-fns';

interface ExamWithSchedulesAndMarks extends Exam {
  schedules: ExamSchedule[];
  marks: StudentExamMark[];
}

interface ExamDetailsCardProps {
  studentClassId?: number;
}

export const ExamDetailsCard = ({ studentClassId }: ExamDetailsCardProps) => {
  const { authUser } = useAuthStore();
  const { toast } = useToast();
  const [exams, setExams] = useState<ExamWithSchedulesAndMarks[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    if (authUser?.school_id && authUser?.id) {
      fetchExamDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser?.school_id, authUser?.id, studentClassId]);

  const fetchExamDetails = async () => {
    if (!authUser?.school_id || !authUser?.id) return;

    try {
      setLoading(true);

      const studentId = parseInt(authUser.id);
      const schoolId = parseInt(authUser.school_id);

      // Fetch exams for student's class (already filtered and sorted by backend)
      const examsResult = await getStudentExams(studentId, schoolId);
      if (!examsResult.status || !examsResult.data) {
        throw new Error('Failed to fetch exams');
      }

      // Fetch student marks
      const marksResult = await getStudentMarks(studentId, schoolId);
      const studentMarks = marksResult.data || [];

      // Fetch schedules for each exam
      const examsWithData = await Promise.all(
        examsResult.data.map(async (exam) => {
          const schedulesResult = await getStudentExamSchedules(studentId, exam.id);
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

    return {
      totalObtained: totalMarksObtained,
      totalMax: totalMarksMax,
      percentage: percentage.toFixed(2),
      subjectsCompleted: examMarks.filter(m => m.status === 'submitted').length,
      totalSubjects: examMarks.length,
    };
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
        default:
          return true;
      }
    });
  };

  const renderExamCard = (exam: ExamWithSchedulesAndMarks) => {
    const status = getExamStatus(exam);
    const performance = calculateExamPerformance(exam.marks);

    return (
      <div key={exam.id} className="space-y-3">
        {/* Exam Header */}
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">{exam.exam_name}</CardTitle>
                  <Badge variant="outline" className={status.color}>
                    {status.label}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {format(parseISO(exam.start_date), 'MMM dd')} - {format(parseISO(exam.end_date), 'MMM dd, yyyy')}
                </p>
              </div>

              {/* Performance Summary */}
              {performance && (
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">{performance.percentage}%</p>
                  <p className="text-xs text-gray-500">
                    {performance.totalObtained}/{performance.totalMax} marks
                  </p>
                </div>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Schedule Rows */}
        <div className="space-y-2">
          {exam.schedules.map((schedule, index) => {
            const mark = exam.marks.find((m) => m.exam_schedule_id === schedule.id);
            const scheduleStatus = getScheduleStatus(schedule);

            return (
              <Card key={schedule.id} className="hover:shadow-sm transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    {/* Left: Schedule Info */}
                    <div className="flex items-center gap-3 flex-1">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center font-semibold text-xs">
                        {index + 1}
                      </span>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-base">
                            {schedule.subject?.subject_name || 'Subject'}
                          </h4>
                          <Badge variant="outline" className={scheduleStatus.color} size="sm">
                            {scheduleStatus.label}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>📅 {format(parseISO(schedule.exam_date), 'MMM dd, yyyy')}</span>
                          <span>🕐 {schedule.start_time} - {schedule.end_time}</span>
                          {schedule.room_number && <span>🚪 Room {schedule.room_number}</span>}
                        </div>

                        {schedule.instructions && (
                          <p className="mt-2 text-xs text-gray-600 bg-yellow-50 p-2 rounded">
                            💡 {schedule.instructions}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Marks */}
                    <div className="flex-shrink-0">
                      {mark ? (
                        <div className="text-center bg-green-50 rounded-lg p-3 min-w-[100px] border border-green-200">
                          <div className="text-2xl font-bold text-green-700">
                            {mark.marks_obtained !== null ? mark.marks_obtained : '-'}
                          </div>
                          <div className="text-xs text-gray-600">/ {mark.marks_total}</div>
                          {mark.marks_obtained !== null && (
                            <Badge variant="default" className="mt-1 bg-green-600">
                              {((mark.marks_obtained / mark.marks_total) * 100).toFixed(0)}%
                            </Badge>
                          )}
                          {mark.grade && (
                            <div className="text-xs text-gray-600 mt-1">Grade: {mark.grade}</div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center bg-gray-50 rounded-lg p-3 min-w-[100px] border">
                          <div className="text-lg font-bold text-gray-700">{schedule.total_marks}</div>
                          <div className="text-xs text-gray-500">Total Marks</div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Examination Details
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
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Award className="w-5 h-5 text-primary" />
          Examination Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {filteredExams.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Calendar className="w-12 h-12 text-gray-300 mb-2" />
                <p className="text-sm text-gray-600">No {activeTab} exams found</p>
                <p className="text-xs text-gray-400 mt-1">
                  {activeTab === 'upcoming' 
                    ? 'No upcoming exams scheduled for your class' 
                    : 'No completed exams to display'}
                </p>
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

export default ExamDetailsCard;


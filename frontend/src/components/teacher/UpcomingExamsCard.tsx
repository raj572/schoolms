import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, BookOpen, AlertCircle, ChevronRight, Bell } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { getAllExams, getExamSchedules, Exam, ExamSchedule } from '@/services/examApiService';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO, isFuture, isToday, isTomorrow, differenceInDays } from 'date-fns';

interface UpcomingExamWithSchedules extends Exam {
  relevantSchedules: ExamSchedule[];
}

export const UpcomingExamsCard = () => {
  const { authUser } = useAuthStore();
  const { toast } = useToast();
  const [upcomingExams, setUpcomingExams] = useState<UpcomingExamWithSchedules[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authUser?.school_id) {
      fetchUpcomingExams();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser?.school_id]);

  const fetchUpcomingExams = async () => {
    if (!authUser?.school_id) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch all exams for the school
      const examsResult = await getAllExams(parseInt(authUser.school_id));

      if (!examsResult.status || !examsResult.data) {
        throw new Error('Failed to fetch exams');
      }

      // Filter for upcoming and ongoing exams
      const relevantExams = examsResult.data.filter((exam) => {
        const endDate = parseISO(exam.end_date);
        return (
          (exam.status === 'scheduled' || exam.status === 'ongoing') &&
          isFuture(endDate)
        );
      });

      // Fetch schedules for each relevant exam
      const examsWithSchedules = await Promise.all(
        relevantExams.map(async (exam) => {
          const schedulesResult = await getExamSchedules(exam.id);
          
          if (schedulesResult.status && schedulesResult.data) {
            // Filter schedules for upcoming dates
            const upcomingSchedules = schedulesResult.data.filter((schedule) => {
              const examDate = parseISO(schedule.exam_date);
              return isFuture(examDate) || isToday(examDate);
            });

            return {
              ...exam,
              relevantSchedules: upcomingSchedules,
            };
          }

          return {
            ...exam,
            relevantSchedules: [],
          };
        })
      );

      // Sort by start date
      const sortedExams = examsWithSchedules
        .filter((exam) => exam.relevantSchedules.length > 0)
        .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());

      setUpcomingExams(sortedExams);
    } catch (err) {
      console.error('Error fetching upcoming exams:', err);
      setError('Failed to load upcoming exams');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load upcoming exams. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const getDateBadgeInfo = (dateString: string) => {
    const date = parseISO(dateString);
    
    if (isToday(date)) {
      return { text: 'Today', variant: 'destructive' as const, icon: <AlertCircle className="w-3 h-3" /> };
    }
    
    if (isTomorrow(date)) {
      return { text: 'Tomorrow', variant: 'default' as const, icon: <Bell className="w-3 h-3" /> };
    }

    const daysUntil = differenceInDays(date, new Date());
    
    if (daysUntil <= 7) {
      return { 
        text: `In ${daysUntil} days`, 
        variant: 'secondary' as const, 
        icon: <Calendar className="w-3 h-3" /> 
      };
    }

    return { 
      text: format(date, 'MMM dd'), 
      variant: 'outline' as const, 
      icon: <Calendar className="w-3 h-3" /> 
    };
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: { label: 'Scheduled', className: 'bg-blue-100 text-blue-700' },
      ongoing: { label: 'Ongoing', className: 'bg-green-100 text-green-700' },
      completed: { label: 'Completed', className: 'bg-gray-100 text-gray-700' },
      cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-700' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.scheduled;

    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Upcoming Exams
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Upcoming Exams
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mb-2" />
            <p className="text-sm text-gray-600">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchUpcomingExams} className="mt-3">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (upcomingExams.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Upcoming Exams
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mb-2" />
            <p className="text-sm text-gray-600">No upcoming exams scheduled</p>
            <p className="text-xs text-gray-400 mt-1">Check back later for updates</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Upcoming Exams
            <Badge variant="secondary" className="ml-2">
              {upcomingExams.length}
            </Badge>
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-xs">
            View All
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          {upcomingExams.map((exam) => (
            <div
              key={exam.id}
              className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow bg-gradient-to-r from-white to-gray-50"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm text-gray-900 mb-1">
                    {exam.exam_name}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {format(parseISO(exam.start_date), 'MMM dd')} - {format(parseISO(exam.end_date), 'MMM dd, yyyy')}
                    </span>
                  </div>
                  {exam.exam_type && (
                    <Badge variant="outline" className="mt-1 text-xs">
                      {exam.exam_type}
                    </Badge>
                  )}
                </div>
                {getStatusBadge(exam.status)}
              </div>

              {exam.description && (
                <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                  {exam.description}
                </p>
              )}

              {/* Show upcoming schedules */}
              {exam.relevantSchedules.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="text-xs font-medium text-gray-700 mb-2">
                    Next Exams:
                  </div>
                  <div className="space-y-2">
                    {exam.relevantSchedules.slice(0, 3).map((schedule) => {
                      const dateBadge = getDateBadgeInfo(schedule.exam_date);
                      
                      return (
                        <div
                          key={schedule.id}
                          className="flex items-center justify-between text-xs bg-white p-2 rounded border border-gray-100"
                        >
                          <div className="flex items-center gap-2 flex-1">
                            <BookOpen className="w-3 h-3 text-gray-400 flex-shrink-0" />
                            <span className="font-medium text-gray-700">
                              {schedule.subject?.subject_name || 'Subject'}
                            </span>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-500">
                              {schedule.school_class?.class_name || 'Class'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Badge variant={dateBadge.variant} className="flex items-center gap-1">
                              {dateBadge.icon}
                              {dateBadge.text}
                            </Badge>
                            <div className="flex items-center gap-1 text-gray-500">
                              <Clock className="w-3 h-3" />
                              <span>{schedule.start_time}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {exam.relevantSchedules.length > 3 && (
                      <p className="text-xs text-gray-400 text-center pt-1">
                        +{exam.relevantSchedules.length - 3} more
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingExamsCard;


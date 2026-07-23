import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Calendar, 
  Clock, 
  MapPin, 
  Eye,
  BookOpen,
  Loader2
} from "lucide-react";
import { useAuthStore } from '@/store/useAuthStore';
import { getTeacherAssignedClasses, getTodayClasses, getWeeklyTimetable, AssignedClass, TodayClass, WeeklyTimetable } from '@/services/teacherApiService';
import { useToast } from '@/hooks/use-toast';

export default function MyClasses() {
  const navigate = useNavigate();
  const { authUser } = useAuthStore();
  const { toast } = useToast();
  const [classes, setClasses] = useState<AssignedClass[]>([]);
  const [todayClasses, setTodayClasses] = useState<TodayClass[]>([]);
  const [weeklyTimetable, setWeeklyTimetable] = useState<WeeklyTimetable | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTimetableLoading, setIsTimetableLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!authUser?.id || !authUser?.school_id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const teacherId = parseInt(authUser.id);
        const schoolId = parseInt(authUser.school_id);

        if (isNaN(teacherId) || isNaN(schoolId)) {
          throw new Error('Invalid IDs');
        }

        // Fetch assigned classes
        const classesResponse = await getTeacherAssignedClasses(teacherId, schoolId);
        if (classesResponse.status) {
          setClasses(classesResponse.data || []);
        }

        // Fetch today's schedule
        const todayResponse = await getTodayClasses(teacherId, schoolId);
        if (todayResponse.status) {
          setTodayClasses(todayResponse.data || []);
        }

        // Fetch weekly timetable
        setIsTimetableLoading(true);
        try {
          const timetableResponse = await getWeeklyTimetable(teacherId, schoolId);
          if (timetableResponse.status && timetableResponse.data) {
            setWeeklyTimetable(timetableResponse.data);
          }
        } catch (error) {
          console.error('Error fetching timetable:', error);
        } finally {
          setIsTimetableLoading(false);
        }
      } catch (error) {
        console.error('Error fetching classes:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load class data',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [authUser?.id, authUser?.school_id, toast]);

  interface ScheduleItem {
    day_of_week: string;
    start_time: string;
  }

  interface NextClass {
    day_of_week: string;
    start_time: string;
  }

  const formatSchedule = (schedule: ScheduleItem[]) => {
    if (!schedule || schedule.length === 0) return 'No schedule';
    
    // Group by days
    const days = [...new Set(schedule.map(s => s.day_of_week))];
    const dayAbbr: Record<string, string> = {
      Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed',
      Thursday: 'Thu', Friday: 'Fri', Saturday: 'Sat', Sunday: 'Sun'
    };
    
    return days.slice(0, 3).map(d => dayAbbr[d] || d).join(', ');
  };

  const formatTime = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getNextClassTime = (nextClass: NextClass | null) => {
    if (!nextClass) return 'No upcoming class';
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    
    if (nextClass.day_of_week === today) {
      return `Today at ${formatTime(nextClass.start_time)}`;
    }
    return `${nextClass.day_of_week} at ${formatTime(nextClass.start_time)}`;
  };

  const totalStudents = classes.reduce((sum, cls) => sum + cls.student_count, 0);
  const classesToday = todayClasses.length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in px-16 py-9">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold">My Classes</h1>
          <p className="text-gray-500 text-xs mt-1">
            View your assigned classes and student groups
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-card shadow-md border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Total Classes</p>
                <p className="text-lg font-bold text-foreground">{classes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-md border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <Users className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Total Students</p>
                <p className="text-lg font-bold text-foreground">{totalStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-md border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <Calendar className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Classes Today</p>
                <p className="text-lg font-bold text-foreground">{classesToday}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-md border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-info/10 rounded-lg">
                <Clock className="w-5 h-5 text-info" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Subjects</p>
                <p className="text-lg font-bold text-foreground">
                  {[...new Set(classes.flatMap(c => c.subjects.map(s => s.subject_name)))].length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Classes Grid */}
      {classes.length === 0 ? (
        <Card className="bg-gradient-card shadow-md">
          <CardContent className="p-12 text-center">
            <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Classes Assigned</h3>
            <p className="text-sm text-muted-foreground">
              You don't have any classes assigned yet. Contact your administrator for class assignments.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((classItem) => (
            <Card 
              key={classItem.class_id} 
              className="bg-gradient-card shadow-md hover:shadow-hover transition-all duration-300 border-l-4 border-primary"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-md font-semibold text-foreground">
                      Class {classItem.class_name}{classItem.section && `-${classItem.section}`}
                    </CardTitle>
                    <p className="text-xs text-gray-500 mt-1">
                      {classItem.subjects.map(s => s.subject_name).join(', ')}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Active
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Student Count */}
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-medium">{classItem.student_count} students</span>
                </div>

                {/* Schedule */}
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {formatSchedule(classItem.schedule)}
                  </span>
                </div>

                {/* Room */}
                {classItem.room_no && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Room {classItem.room_no}</span>
                  </div>
                )}

                {/* Subjects */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Teaching Subjects:</p>
                  <div className="flex flex-wrap gap-1">
                    {classItem.subjects.map((subject) => (
                      <Badge key={subject.subject_id} variant="outline" className="text-xs">
                        {subject.subject_name}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Next Class */}
                <div className="pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-1">Next Class:</p>
                  <p className="text-xs font-medium text-foreground">
                    {getNextClassTime(classItem.next_class)}
                  </p>
                </div>

                {/* Actions */}
                <div className="pt-2">
                  <Button 
                    className="w-full" 
                    size="sm"
                    onClick={() => navigate(`/teacher/class-details/${classItem.class_id}`)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Weekly Timetable */}
      <Card className="bg-gradient-card shadow-md">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Weekly Class Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isTimetableLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : weeklyTimetable && Object.values(weeklyTimetable).some(day => day.length > 0) ? (
            <div className="space-y-6">
              {Object.entries(weeklyTimetable).map(([day, classes]) => {
                if (classes.length === 0) return null;
                
                return (
                  <div key={day} className="border-l-4 border-primary pl-4">
                    <h4 className="text-md font-semibold mb-3 text-primary">{day}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {classes.map((classItem) => (
                        <div 
                          key={classItem.id}
                          className="p-3 bg-secondary/10 rounded-lg border border-border hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <p className="font-semibold text-sm">
                                {classItem.subject_name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Class {classItem.class}-{classItem.section}
                              </p>
                            </div>
                            <BookOpen className="w-4 h-4 text-primary flex-shrink-0" />
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{formatTime(classItem.start_time)} - {formatTime(classItem.end_time)}</span>
                          </div>
                          {classItem.room_no && (
                            <div className="mt-2">
                              <Badge variant="outline" className="text-xs">
                                Room {classItem.room_no}
                              </Badge>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">No classes scheduled yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

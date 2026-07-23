import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Calendar, 
  Clock, 
  MapPin, 
  ArrowLeft,
  BookOpen,
  Loader2,
  GraduationCap
} from "lucide-react";
import { useAuthStore } from '@/store/useAuthStore';
import { getTeacherClassDetails } from '@/services/teacherApiService';
import { useToast } from '@/hooks/use-toast';

export default function ClassDetails() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { authUser } = useAuthStore();
  const { toast } = useToast();
  const [classDetails, setClassDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchClassDetails = async () => {
      if (!authUser?.id || !authUser?.school_id || !classId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const teacherId = parseInt(authUser.id);
        const schoolId = parseInt(authUser.school_id);
        const classIdNum = parseInt(classId);

        if (isNaN(teacherId) || isNaN(schoolId) || isNaN(classIdNum)) {
          throw new Error('Invalid IDs');
        }

        const response = await getTeacherClassDetails(teacherId, schoolId, classIdNum);
        if (response.status) {
          setClassDetails(response.data);
        } else {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: response.message || 'Failed to load class details',
          });
        }
      } catch (error) {
        console.error('Error fetching class details:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load class details',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchClassDetails();
  }, [authUser?.id, authUser?.school_id, classId, toast]);

  const formatTime = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!classDetails) {
    return (
      <div className="space-y-6 animate-fade-in px-16 py-9">
        <Button onClick={() => navigate('/teacher/my-classes')} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to My Classes
        </Button>
        <Card className="bg-gradient-card shadow-md">
          <CardContent className="p-12 text-center">
            <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Class Not Found</h3>
            <p className="text-sm text-muted-foreground">
              The class you're looking for doesn't exist or you don't have access to it.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Extract class info
  const classInfo = classDetails.class || {};
  const subjects = classDetails.subjects || [];
  const students = classDetails.students || [];
  const timetable = classDetails.timetable || [];

  // Group timetable by day
  const timetableByDay = timetable.reduce((acc: any, slot: any) => {
    const day = slot.day_of_week || 'Unknown';
    if (!acc[day]) acc[day] = [];
    acc[day].push(slot);
    return acc;
  }, {});

  const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const sortedDays = Object.keys(timetableByDay).sort((a, b) => 
    daysOrder.indexOf(a) - daysOrder.indexOf(b)
  );

  return (
    <div className="space-y-6 animate-fade-in px-16 py-9">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button onClick={() => navigate('/teacher/my-classes')} variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-lg font-bold">
              Class {classInfo.class}{classInfo.section && `-${classInfo.section}`}
            </h1>
            <p className="text-gray-500 text-xs mt-1">
              Detailed information about this class
            </p>
          </div>
        </div>
        <Badge variant="secondary">Active</Badge>
      </div>

      {/* Class Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-card shadow-md border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Total Students</p>
                <p className="text-lg font-bold text-foreground">{students.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-md border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <BookOpen className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Subjects Teaching</p>
                <p className="text-lg font-bold text-foreground">{subjects.length}</p>
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
                <p className="text-xs font-medium text-muted-foreground">Weekly Periods</p>
                <p className="text-lg font-bold text-foreground">{timetable.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-md border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-info/10 rounded-lg">
                <MapPin className="w-5 h-5 text-info" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Room Number</p>
                <p className="text-lg font-bold text-foreground">{classInfo.room_no || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Class Information */}
        <Card className="bg-gradient-card shadow-md border-0">
          <CardHeader>
            <CardTitle className="text-md">Class Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Class</p>
                <p className="text-sm font-medium">{classInfo.class || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Section</p>
                <p className="text-sm font-medium">{classInfo.section || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Room Number</p>
                <p className="text-sm font-medium">{classInfo.room_no || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Total Students</p>
                <p className="text-sm font-medium">{students.length}</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-2">Teaching Subjects</p>
              <div className="flex flex-wrap gap-2">
                {subjects.length > 0 ? (
                  subjects.map((subject: any) => (
                    <Badge key={subject.subject_id} variant="outline">
                      {subject.subject?.subject_name || 'Unknown Subject'}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No subjects assigned</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Students List */}
        <Card className="bg-gradient-card shadow-md border-0">
          <CardHeader>
            <CardTitle className="text-md">Students ({students.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {students.length > 0 ? (
                students.map((student: any) => (
                  <div key={student.id} className="flex items-center gap-3 p-2 bg-secondary/30 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <GraduationCap className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium">{student.name || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">
                        Roll No: {student.roll_no || 'N/A'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No students enrolled in this class
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Timetable */}
      <Card className="bg-gradient-card shadow-md border-0">
        <CardHeader>
          <CardTitle className="text-md">Weekly Timetable</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedDays.length > 0 ? (
            <div className="space-y-4">
              {sortedDays.map((day) => (
                <div key={day} className="space-y-2">
                  <h3 className="text-sm font-semibold text-foreground">{day}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {timetableByDay[day].map((slot: any, index: number) => (
                      <div
                        key={index}
                        className="p-3 bg-secondary/30 rounded-lg border-l-2 border-primary"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant="secondary" className="text-xs">
                            {slot.subject?.subject_name || 'Unknown'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No timetable available for this class
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


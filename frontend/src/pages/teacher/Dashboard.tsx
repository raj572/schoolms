import { useState, useEffect } from 'react';
import {StaticsCart} from "@/components/Dashboard/StaticsCart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  ClipboardList, 
  Calendar, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Loader2
} from "lucide-react";
import { useAuthStore } from '@/store/useAuthStore';
import { getTodayClasses, getTeacherDashboardStats, TodayClass, TeacherDashboardStats } from '@/services/teacherApiService';
import { useToast } from '@/hooks/use-toast';
import { UpcomingExamsCard } from '@/components/teacher/UpcomingExamsCard';

export default function Dashboard() { 
  const { authUser } = useAuthStore();
  const { toast } = useToast();
  const [todayClasses, setTodayClasses] = useState<TodayClass[]>([]);
  const [stats, setStats] = useState<TeacherDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!authUser?.id || !authUser?.school_id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Convert string IDs to numbers for API calls
        const teacherId = parseInt(authUser.id);
        const schoolId = parseInt(authUser.school_id);

        if (isNaN(teacherId) || isNaN(schoolId)) {
          throw new Error('Invalid teacher or school ID');
        }
        
        // Fetch today's classes
        const classesResponse = await getTodayClasses(teacherId, schoolId);
        if (classesResponse.status) {
          setTodayClasses(classesResponse.data || []);
        }

        // Fetch dashboard stats
        const statsResponse = await getTeacherDashboardStats(teacherId, schoolId);
        if (statsResponse.status) {
          setStats(statsResponse.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load dashboard data. Please refresh the page.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [authUser?.id, authUser?.school_id, toast]);

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getNextClassTime = () => {
    const upcomingClass = todayClasses.find(cls => cls.status === 'upcoming');
    if (!upcomingClass) return 'No more classes today';
    
    const now = new Date();
    const [hours, minutes] = upcomingClass.start_time.split(':');
    const classTime = new Date();
    classTime.setHours(parseInt(hours), parseInt(minutes), 0);
    
    const diffMs = classTime.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins <= 0) return 'Starting now';
    if (diffMins < 60) return `Next in ${diffMins} min`;
    return `Next in ${Math.floor(diffMins / 60)}h ${diffMins % 60}m`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="ml-6">
          <h1 className="text-lg font-bold text-foreground">Welcome, {authUser?.full_name || 'Teacher'}</h1>
          <p className="text-gray-500 text-xs mt-1">
            Here's what's happening with your classes today
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-4 gap-6">
        <StaticsCart
          title="Total Students"
          value={stats?.total_students || 0}
          change={`${stats?.assigned_classes || 0} classes assigned`}
          changeType="neutral"
          icon={Users}
          color="primary"
        />
        <StaticsCart
          title="Classes Today"
          value={stats?.classes_today || 0}
          change={getNextClassTime()}
          changeType="neutral"
          icon={Calendar}
          color="info"
        />
        <StaticsCart
          title="Assigned Classes"
          value={stats?.assigned_classes || 0}
          change="Total assigned"
          changeType="neutral"
          icon={BookOpen}
          color="warning"
        />
        <StaticsCart
          title="Attendance"
          value={`${stats?.attendance.attendance_percentage || 0}%`}
          change={`${stats?.attendance.present_days || 0}/${stats?.attendance.total_days || 0} days present`}
          changeType={stats?.attendance.attendance_percentage >= 90 ? "positive" : stats?.attendance.attendance_percentage >= 75 ? "neutral" : "negative"}
          icon={TrendingUp}
          color="success"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <Card className="lg:col-span-2  bg-gradient-card shadow-md border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="w-5 h-5 text-primary " />
              Today's Schedule ({new Date().toLocaleDateString('en-US', { weekday: 'long' })})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayClasses.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">No classes scheduled for today</p>
              </div>
            ) : (
              <div className="space-y-4">
                {todayClasses.map((cls) => (
                  <div
                    key={cls.id}
                    className={`flex items-center justify-between p-4 rounded-lg border-l-4 transition-colors ${
                      cls.status === 'ongoing' 
                        ? 'bg-green-50 dark:bg-green-950/20 border-green-500' 
                        : cls.status === 'upcoming' 
                        ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-500' 
                        : 'bg-secondary/30 border-muted opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="text-center min-w-[80px]">
                        <div className="text-sm font-semibold text-foreground">
                          {formatTime(cls.start_time)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatTime(cls.end_time)}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm text-foreground">{cls.subject_name}</h4>
                        <p className="text-xs text-gray-500">
                          Class {cls.class}{cls.section ? `-${cls.section}` : ''} 
                          {cls.room_no && ` • Room ${cls.room_no}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={
                          cls.status === 'ongoing' ? 'default' : 
                          cls.status === 'upcoming' ? 'secondary' : 
                          'outline'
                        }
                        className="text-xs"
                      >
                        {cls.status === 'ongoing' ? '🟢 Ongoing' : 
                         cls.status === 'upcoming' ? '🔵 Upcoming' : 
                         '✓ Completed'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="bg-gradient-card shadow-md border-0">
          <CardHeader>
            <CardTitle className="flex text-lg items-center gap-2">
              <ClipboardList className="w-5 h-5 text-primary" />
              Quick Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-secondary/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Today's Classes</span>
                  <span className="text-xl font-bold text-primary">{stats?.classes_today || 0}</span>
                </div>
                <div className="flex gap-2 text-xs">
                  <Badge variant="outline" className="text-green-600">
                    {todayClasses.filter(c => c.status === 'completed').length} Completed
                  </Badge>
                  <Badge variant="outline" className="text-blue-600">
                    {todayClasses.filter(c => c.status === 'upcoming').length} Upcoming
                  </Badge>
                </div>
              </div>

              <div className="p-4 bg-secondary/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Monthly Attendance</span>
                  <span className="text-xl font-bold text-primary">{stats?.attendance.attendance_percentage || 0}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${stats?.attendance.attendance_percentage || 0}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {stats?.attendance.present_days || 0} out of {stats?.attendance.total_days || 0} days
                </p>
              </div>

              <div className="p-4 bg-secondary/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Total Students</span>
                  <span className="text-xl font-bold text-primary">{stats?.total_students || 0}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Across {stats?.assigned_classes || 0} assigned classes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Class Status Summary & Upcoming Exams */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Class Status Summary */}
        {todayClasses.length > 0 && (
          <Card className="bg-gradient-card shadow-card border-0 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Class Status Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                        {todayClasses.filter(c => c.status === 'completed').length}
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-500">Completed</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-3">
                    <Clock className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                        {todayClasses.filter(c => c.status === 'upcoming').length}
                      </p>
                      <p className="text-sm text-blue-600 dark:text-blue-500">Upcoming</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-8 h-8 text-orange-600" />
                    <div>
                      <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">
                        {todayClasses.filter(c => c.status === 'ongoing').length}
                      </p>
                      <p className="text-sm text-orange-600 dark:text-orange-500">Ongoing</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upcoming Exams Card */}
        <div className={todayClasses.length > 0 ? "lg:col-span-1" : "lg:col-span-3"}>
          <UpcomingExamsCard />
        </div>
      </div>
    </div>
  );
}
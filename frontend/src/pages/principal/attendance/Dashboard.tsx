import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AttendanceChart } from '@/components/attendance/AttendanceCharts';
import { getAttendanceAnalytics } from '@/services/attendanceService';
import {
  TrendingUp,
  TrendingDown,
  Users,
  UserCheck,
  UserX,
  Clock,
  Award,
  AlertTriangle,
  Download,
  Calendar,
  Mail,
  Phone,
} from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

interface TeacherStats {
  total_records: number;
  present_count: number;
  absent_count: number;
  late_count: number;
  leave_count?: number;
}

interface TeacherWiseStat {
  id: number;
  name: string;
  email: string;
  phone: string;
  total_records: number;
  present_count: number;
  absent_count: number;
  late_count: number;
  leave_count?: number;
  attendance_percentage: number;
}

interface TeacherAtRisk {
  id: number;
  name: string;
  email: string;
  phone: string;
  attendance_percentage: number;
}

interface AnalyticsData {
  teacher_stats?: TeacherStats;
  teacher_wise_stats?: TeacherWiseStat[];
  teachers_at_risk?: TeacherAtRisk[];
}

const AttendanceDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState('month');
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      
      let startDate, endDate;
      const today = new Date();
      
      switch (dateRange) {
        case 'week':
          startDate = format(subDays(today, 7), 'yyyy-MM-dd');
          endDate = format(today, 'yyyy-MM-dd');
          break;
        case 'month':
          startDate = format(startOfMonth(today), 'yyyy-MM-dd');
          endDate = format(endOfMonth(today), 'yyyy-MM-dd');
          break;
        case 'year':
          startDate = format(new Date(today.getFullYear(), 0, 1), 'yyyy-MM-dd');
          endDate = format(today, 'yyyy-MM-dd');
          break;
        default:
          startDate = format(startOfMonth(today), 'yyyy-MM-dd');
          endDate = format(today, 'yyyy-MM-dd');
      }

      const response = await getAttendanceAnalytics('principal', {
        start_date: startDate,
        end_date: endDate,
        type: 'teacher', // Only fetch teacher-related analytics
      });

      if (response.status) {
        setAnalytics(response.data);
      }
    } catch (error) {
      console.error('Fetch analytics error:', error);
      // Set mock data for development
      setAnalytics({
        teacher_stats: {
          total_records: 180,
          present_count: 165,
          absent_count: 10,
          late_count: 5,
          leave_count: 0,
        },
        teacher_wise_stats: [
          { id: 1, name: 'John Doe', email: 'john@example.com', phone: '1234567890', total_records: 30, present_count: 28, absent_count: 1, late_count: 1, leave_count: 0, attendance_percentage: 93.33 },
          { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '0987654321', total_records: 30, present_count: 27, absent_count: 2, late_count: 1, leave_count: 0, attendance_percentage: 90.00 },
          { id: 3, name: 'Bob Johnson', email: 'bob@example.com', phone: '1122334455', total_records: 30, present_count: 25, absent_count: 3, late_count: 2, leave_count: 0, attendance_percentage: 83.33 },
        ],
        teachers_at_risk: [],
      });
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const teacherPercentage = analytics?.teacher_stats
    ? Math.round((analytics.teacher_stats.present_count / analytics.teacher_stats.total_records) * 100)
    : 0;

  const pieData = analytics?.teacher_stats
    ? [
        { name: 'Present', value: analytics.teacher_stats.present_count },
        { name: 'Absent', value: analytics.teacher_stats.absent_count },
        { name: 'Late', value: analytics.teacher_stats.late_count },
        { name: 'Leave', value: analytics.teacher_stats.leave_count || 0 },
      ]
    : [];

  const teacherWiseData = analytics?.teacher_wise_stats || [];

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Teacher Attendance Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive insights and trends for teachers
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Teacher Attendance */}
        <Card className="border-2 border-blue-200 bg-blue-50 dark:bg-blue-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Teacher Attendance</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className="text-3xl font-bold text-blue-700">{teacherPercentage}%</p>
                  <Badge variant="outline" className="text-blue-600 border-blue-300">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Good
                  </Badge>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              {analytics?.teacher_stats?.present_count || 0} / {analytics?.teacher_stats?.total_records || 0} records
            </div>
          </CardContent>
        </Card>

        {/* Total Teachers */}
        <Card className="border-2 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Teachers</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className="text-3xl font-bold text-foreground">{teacherWiseData.length}</p>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              {analytics?.teacher_stats?.total_records || 0} total records
            </div>
          </CardContent>
        </Card>

        {/* Absent Count */}
        <Card className="border-2 border-rose-200 bg-rose-50 dark:bg-rose-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Absences</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className="text-3xl font-bold text-rose-700">
                    {analytics?.teacher_stats?.absent_count || 0}
                  </p>
                  <Badge variant="outline" className="text-rose-600 border-rose-300">
                    <TrendingDown className="w-3 h-3 mr-1" />
                    Low
                  </Badge>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center">
                <UserX className="w-6 h-6 text-rose-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              Absent records
            </div>
          </CardContent>
        </Card>

        {/* Late Count */}
        <Card className="border-2 border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Late Arrivals</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className="text-3xl font-bold text-amber-700">
                    {analytics?.teacher_stats?.late_count || 0}
                  </p>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              Late records
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Teacher-wise Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Teacher-wise Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-[300px]">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : teacherWiseData.length > 0 ? (
              <AttendanceChart
                type="bar"
                data={teacherWiseData.map((teacher: TeacherWiseStat) => ({
                  name: teacher.name,
                  present: teacher.present_count,
                  absent: teacher.absent_count,
                  late: teacher.late_count,
                  leave: teacher.leave_count || 0,
                }))}
                height={300}
              />
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Attendance Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-[300px]">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : pieData.length > 0 ? (
              <AttendanceChart
                type="pie"
                data={pieData}
                dataKey="value"
                height={300}
              />
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Teachers & At-Risk Teachers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Teachers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Award className="w-5 h-5 text-yellow-500" />
              Top Performing Teachers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {teacherWiseData.length > 0 ? (
              <div className="space-y-3">
                {teacherWiseData
                  .sort((a: TeacherWiseStat, b: TeacherWiseStat) => b.attendance_percentage - a.attendance_percentage)
                  .slice(0, 5)
                  .map((teacher: TeacherWiseStat, index: number) => (
                    <div
                      key={teacher.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">
                            {teacher.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {teacher.present_count} / {teacher.total_records} present
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300">
                        {Number(teacher.attendance_percentage).toFixed(1)}%
                      </Badge>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Award className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Teachers at Risk */}
        <Card className="border-2 border-destructive/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Teachers at Risk (&lt; 75%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics?.teachers_at_risk?.length > 0 ? (
              <div className="space-y-3">
                {analytics.teachers_at_risk.map((teacher: TeacherAtRisk) => (
                  <div
                    key={teacher.id}
                    className="flex items-center justify-between p-3 bg-destructive/5 rounded-lg border border-destructive/20"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{teacher.name}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        {teacher.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {teacher.email}
                          </span>
                        )}
                        {teacher.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {teacher.phone}
                          </span>
                        )}
                      </div>
                      <Badge variant="outline" className="mt-2 text-destructive border-destructive">
                        {teacher.attendance_percentage}% attendance
                      </Badge>
                    </div>
                    <Button size="sm" variant="outline">
                      Contact
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Award className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Great! No teachers at risk</p>
                <p className="text-xs mt-1">All teachers have &gt; 75% attendance</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AttendanceDashboard;

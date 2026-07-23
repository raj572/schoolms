import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AttendanceChart } from '@/components/attendance/AttendanceCharts';
import { getAttendanceAnalytics, getSchoolClasses } from '@/services/attendanceService';
import { useAuthStore } from '@/store/useAuthStore';
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
  BookOpen,
  GraduationCap,
} from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

interface StudentStats {
  total_records: number;
  present_count: number;
  absent_count: number;
  late_count: number;
  half_day?: number;
}

interface ClassWiseStat {
  class: string;
  section: string;
  total_records: number;
  present_count: number;
  absent_count: number;
  late_count?: number;
  attendance_percentage: number;
}

interface StudentAtRisk {
  id: number;
  name: string;
  roll_no: string;
}

interface AnalyticsData {
  student_stats?: StudentStats;
  class_wise_stats?: ClassWiseStat[];
  students_at_risk?: StudentAtRisk[];
}

interface Class {
  id: number;
  class: string;
  section: string;
}

const StudentAttendanceAnalytics: React.FC = () => {
  const navigate = useNavigate();
  const { authUser } = useAuthStore();
  const [dateRange, setDateRange] = useState('month');
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<number>();

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      
      let calculatedStartDate = startDate;
      let calculatedEndDate = endDate;
      
      // If using preset ranges, calculate dates
      if (dateRange !== 'custom') {
        const today = new Date();
        switch (dateRange) {
          case 'week':
            calculatedStartDate = format(subDays(today, 7), 'yyyy-MM-dd');
            calculatedEndDate = format(today, 'yyyy-MM-dd');
            break;
          case 'month':
            calculatedStartDate = format(startOfMonth(today), 'yyyy-MM-dd');
            calculatedEndDate = format(endOfMonth(today), 'yyyy-MM-dd');
            break;
          case 'year':
            calculatedStartDate = format(new Date(today.getFullYear(), 0, 1), 'yyyy-MM-dd');
            calculatedEndDate = format(today, 'yyyy-MM-dd');
            break;
        }
      }

      const response = await getAttendanceAnalytics('principal', {
        start_date: calculatedStartDate,
        end_date: calculatedEndDate,
        type: 'student', // Only fetch student-related analytics
        class_id: selectedClass, // Filter by class if selected
      });

      if (response.status) {
        // Ensure all values have defaults to prevent null/NaN
        const data = response.data;
        setAnalytics({
          student_stats: {
            total_records: data?.student_stats?.total_records || 0,
            present_count: data?.student_stats?.present_count || 0,
            absent_count: data?.student_stats?.absent_count || 0,
            late_count: data?.student_stats?.late_count || 0,
            half_day: data?.student_stats?.half_day || 0,
          },
          class_wise_stats: (data?.class_wise_stats || []).map((cls: ClassWiseStat) => ({
            class: cls.class || '',
            section: cls.section || '',
            total_records: cls.total_records || 0,
            present_count: cls.present_count || 0,
            absent_count: cls.absent_count || 0,
            attendance_percentage: cls.attendance_percentage || 0,
          })),
          students_at_risk: data?.students_at_risk || [],
        });
      }
    } catch (error) {
      console.error('Fetch analytics error:', error);
      // Set mock data for development
      setAnalytics({
        student_stats: {
          total_records: 450,
          present_count: 380,
          absent_count: 50,
          late_count: 20,
          half_day: 0,
        },
        class_wise_stats: [
          { class: '10', section: 'A', total_records: 90, present_count: 80, absent_count: 8, attendance_percentage: 88.89 },
          { class: '10', section: 'B', total_records: 90, present_count: 75, absent_count: 12, attendance_percentage: 83.33 },
          { class: '9', section: 'A', total_records: 85, present_count: 78, absent_count: 5, attendance_percentage: 91.76 },
          { class: '9', section: 'B', total_records: 85, present_count: 70, absent_count: 12, attendance_percentage: 82.35 },
          { class: '8', section: 'A', total_records: 100, present_count: 77, absent_count: 18, attendance_percentage: 77.00 },
        ],
        students_at_risk: [],
      });
    } finally {
      setLoading(false);
    }
  }, [dateRange, startDate, endDate, selectedClass]);

  const fetchClasses = useCallback(async () => {
    const schoolId = Number(localStorage.getItem('school_id')) || authUser?.school_id;
    if (!schoolId) return;
    
    try {
      const response = await getSchoolClasses(Number(schoolId));
      if (response.status && response.data) {
        const classList = Array.isArray(response.data) ? response.data : [];
        setClasses(classList.map((c: { id: number; class: string; section: string }) => ({
          id: c.id,
          class: c.class,
          section: c.section,
        })));
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  }, [authUser]);

  useEffect(() => {
    fetchAnalytics();
    fetchClasses();
  }, [fetchAnalytics, fetchClasses]);

  const handleViewClass = (classStat: ClassWiseStat) => {
    // Find the class ID from the classes list
    const classObj = classes.find(
      (c) => c.class === classStat.class && c.section === classStat.section
    );
    if (classObj) {
      navigate(`/principal/students/attendance/class/${classObj.id}`);
    }
  };

  const handleViewStudent = (student: StudentAtRisk) => {
    navigate(`/principal/students/attendance/student/${student.id}`);
  };

  const studentPercentage = analytics?.student_stats && analytics.student_stats.total_records > 0
    ? Math.round(((analytics.student_stats.present_count || 0) / (analytics.student_stats.total_records || 1)) * 100)
    : 0;

  const pieData = analytics?.student_stats
    ? [
        { name: 'Present', value: analytics.student_stats.present_count || 0 },
        { name: 'Absent', value: analytics.student_stats.absent_count || 0 },
        { name: 'Late', value: analytics.student_stats.late_count || 0 },
        { name: 'Half Day', value: analytics.student_stats.half_day || 0 },
      ].filter(item => item.value > 0) // Only show non-zero values
    : [];

  const classWiseData = analytics?.class_wise_stats || [];

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Student Attendance Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive insights and trends for students
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={dateRange} onValueChange={(value) => {
            setDateRange(value);
            if (value !== 'custom') {
              const today = new Date();
              switch (value) {
                case 'week':
                  setStartDate(format(subDays(today, 7), 'yyyy-MM-dd'));
                  setEndDate(format(today, 'yyyy-MM-dd'));
                  break;
                case 'month':
                  setStartDate(format(startOfMonth(today), 'yyyy-MM-dd'));
                  setEndDate(format(endOfMonth(today), 'yyyy-MM-dd'));
                  break;
                case 'year':
                  setStartDate(format(new Date(today.getFullYear(), 0, 1), 'yyyy-MM-dd'));
                  setEndDate(format(today, 'yyyy-MM-dd'));
                  break;
              }
            }
          }}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          
          {dateRange === 'custom' && (
            <>
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-[140px]"
                />
                <span className="text-muted-foreground">to</span>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-[140px]"
                />
              </div>
            </>
          )}
          
          <Select 
            value={selectedClass?.toString() || 'all'} 
            onValueChange={(value) => setSelectedClass(value === 'all' ? undefined : Number(value))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Classes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id.toString()}>
                  {cls.class} - {cls.section}
                </SelectItem>
              ))}
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
        {/* Student Attendance */}
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Student Attendance</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className="text-3xl font-bold text-primary">{studentPercentage}%</p>
                  <Badge variant="outline" className="text-emerald-600 border-emerald-300">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Good
                  </Badge>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              {analytics?.student_stats?.present_count || 0} / {analytics?.student_stats?.total_records || 0} records
            </div>
          </CardContent>
        </Card>

        {/* Total Classes */}
        <Card className="border-2 border-blue-200 bg-blue-50 dark:bg-blue-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Classes</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className="text-3xl font-bold text-blue-700">{classWiseData.length}</p>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              {analytics?.student_stats?.total_records || 0} total records
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
                    {analytics?.student_stats?.absent_count || 0}
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
                    {analytics?.student_stats?.late_count || 0}
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
        {/* Class-wise Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Class-wise Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-[300px]">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : classWiseData.length > 0 ? (
              <AttendanceChart
                type="bar"
                data={classWiseData.map((cls: ClassWiseStat) => ({
                  name: `${cls.class}-${cls.section}`,
                  present: cls.present_count || 0,
                  absent: cls.absent_count || 0,
                  late: (cls.total_records || 0) - (cls.present_count || 0) - (cls.absent_count || 0),
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

      {/* Top Performing Classes & At-Risk Students */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Classes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Award className="w-5 h-5 text-yellow-500" />
              Top Performing Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {classWiseData.length > 0 ? (
              <div className="space-y-3">
                {classWiseData
                  .sort((a: ClassWiseStat, b: ClassWiseStat) => (b.attendance_percentage || 0) - (a.attendance_percentage || 0))
                  .slice(0, 5)
                  .map((cls: ClassWiseStat, index: number) => (
                    <div
                      key={`${cls.class}-${cls.section}`}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 cursor-pointer transition-colors"
                      onClick={() => handleViewClass(cls)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">
                            Class {cls.class} - {cls.section}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {cls.present_count || 0} / {cls.total_records || 0} students
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300">
                          {Number(cls.attendance_percentage || 0).toFixed(1)}%
                        </Badge>
                        <Button size="sm" variant="ghost" className="h-8">
                          View →
                        </Button>
                      </div>
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

        {/* Students at Risk */}
        <Card className="border-2 border-destructive/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Students at Risk (&lt; 75%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics?.students_at_risk?.length > 0 ? (
              <div className="space-y-3">
                {analytics.students_at_risk.map((student: StudentAtRisk) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-3 bg-destructive/5 rounded-lg border border-destructive/20 hover:bg-destructive/10 cursor-pointer transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{student.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Roll No: {student.roll_no}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewStudent(student);
                        }}
                      >
                        View Details
                      </Button>
                      <Button size="sm" variant="outline">
                        Contact
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Award className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Great! No students at risk</p>
                <p className="text-xs mt-1">All students have &gt; 75% attendance</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentAttendanceAnalytics;


import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AttendanceChart } from '@/components/attendance/AttendanceCharts';
import { getClassWiseStudentAttendance } from '@/services/attendanceService';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Users,
  UserCheck,
  UserX,
  Clock,
  TrendingUp,
  Calendar,
  Download,
  Search,
  GraduationCap,
  Loader2,
} from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { useAuthStore } from '@/store/useAuthStore';

interface StudentWithStats {
  student_id: number;
  student_name: string;
  roll_no: string;
  class: string;
  section: string;
  total_records: number;
  present_count: number;
  absent_count: number;
  late_count: number;
  half_day_count: number;
  attendance_percentage: number;
}

interface ClassData {
  class: {
    id: number;
    class: string;
    section: string;
  };
  class_stats: {
    total_students: number;
    total_records: number;
    present_count: number;
    absent_count: number;
    late_count: number;
    attendance_percentage: number;
  };
  students: StudentWithStats[];
  date_range: {
    start: string;
    end: string;
  };
}

const ClassWiseAttendanceAnalysis: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { authUser } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('month');

  const fetchClassData = useCallback(async () => {
    if (!classId) return;

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

      const response = await getClassWiseStudentAttendance(Number(classId), {
        start_date: startDate,
        end_date: endDate,
      });

      if (response.status) {
        setClassData(response.data);
      }
    } catch (error) {
      console.error('Fetch class data error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch class attendance data',
      });
    } finally {
      setLoading(false);
    }
  }, [classId, dateRange, toast]);

  useEffect(() => {
    fetchClassData();
  }, [fetchClassData]);

  const filteredStudents = classData?.students.filter((student) => {
    const query = searchQuery.toLowerCase();
    return (
      student.student_name.toLowerCase().includes(query) ||
      student.roll_no.toLowerCase().includes(query)
    );
  }) || [];

  const handleViewStudent = (studentId: number) => {
    navigate(`/principal/students/attendance/student/${studentId}`);
  };

  const getStatusBadge = (percentage: number) => {
    if (percentage >= 90) {
      return <Badge className="bg-emerald-500 text-white">Excellent</Badge>;
    } else if (percentage >= 75) {
      return <Badge className="bg-blue-500 text-white">Good</Badge>;
    } else if (percentage >= 60) {
      return <Badge className="bg-amber-500 text-white">Fair</Badge>;
    } else {
      return <Badge className="bg-rose-500 text-white">Poor</Badge>;
    }
  };

  if (loading && !classData) {
    return (
      <div className="container mx-auto p-4 sm:p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="container mx-auto p-4 sm:p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">Class data not found</p>
            <Button onClick={() => navigate('/principal/students/attendance/analytics')} className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Analytics
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const chartData = filteredStudents.map((student) => ({
    name: student.student_name,
    present: student.present_count,
    absent: student.absent_count,
    late: student.late_count,
  }));

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/principal/students/attendance/analytics')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Class {classData.class.class} - {classData.class.section}
          </h1>
          <p className="text-muted-foreground mt-1">Student Attendance Analysis</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date-range">Date Range</Label>
              <Select
                value={dateRange}
                onValueChange={(val) => setDateRange(val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Search Student</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or roll number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Class Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-2 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Class Attendance</p>
                <p className="text-2xl font-bold text-primary">
                  {classData.class_stats.attendance_percentage.toFixed(1)}%
                </p>
              </div>
              <UserCheck className="w-8 h-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">{classData.class_stats.total_students}</p>
              </div>
              <Users className="w-8 h-8 text-muted-foreground opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Present</p>
                <p className="text-2xl font-bold text-emerald-700">
                  {classData.class_stats.present_count}
                </p>
              </div>
              <UserCheck className="w-8 h-8 text-emerald-700 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-rose-200 bg-rose-50 dark:bg-rose-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Absent</p>
                <p className="text-2xl font-bold text-rose-700">
                  {classData.class_stats.absent_count}
                </p>
              </div>
              <UserX className="w-8 h-8 text-rose-700 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Late</p>
                <p className="text-2xl font-bold text-amber-700">
                  {classData.class_stats.late_count}
                </p>
              </div>
              <Clock className="w-8 h-8 text-amber-700 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Student Attendance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <AttendanceChart
              type="bar"
              data={chartData}
              height={300}
            />
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              No data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Students ({filteredStudents.length})</CardTitle>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredStudents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No students found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Roll No</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Total Records</TableHead>
                    <TableHead>Present</TableHead>
                    <TableHead>Absent</TableHead>
                    <TableHead>Late</TableHead>
                    <TableHead>Attendance %</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.student_id}>
                      <TableCell className="font-medium">{student.roll_no}</TableCell>
                      <TableCell>{student.student_name}</TableCell>
                      <TableCell>{student.total_records}</TableCell>
                      <TableCell>
                        <Badge className="bg-emerald-500 text-white">
                          {student.present_count}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-rose-500 text-white">
                          {student.absent_count}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-amber-500 text-white">
                          {student.late_count}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">
                            {student.attendance_percentage.toFixed(1)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(student.attendance_percentage)}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewStudent(student.student_id)}
                        >
                          View Details
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
    </div>
  );
};

export default ClassWiseAttendanceAnalysis;


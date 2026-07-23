import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AttendanceChart } from '@/components/attendance/AttendanceCharts';
import { getStudentIndividualAttendance } from '@/services/attendanceService';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  User,
  UserCheck,
  UserX,
  Clock,
  TrendingUp,
  Calendar,
  Download,
  GraduationCap,
  Loader2,
  Award,
  AlertTriangle,
} from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

interface AttendanceRecord {
  id: number;
  attendance_date: string;
  status: string;
  check_in_time: string | null;
  check_out_time: string | null;
  subject: string | null;
  period_number: number | null;
  remarks: string | null;
}

interface MonthlyStat {
  month: string;
  total_records: number;
  present_count: number;
  absent_count: number;
  late_count: number;
  attendance_percentage: number;
}

interface StudentData {
  student: {
    id: number;
    name: string;
    roll_no: string;
    class: string;
    section: string;
  };
  stats: {
    total_records: number;
    present_count: number;
    absent_count: number;
    late_count: number;
    half_day_count: number;
    attendance_percentage: number;
  };
  records: AttendanceRecord[];
  monthly_stats: MonthlyStat[];
  date_range: {
    start: string;
    end: string;
  };
}

const StudentIndividualAnalysis: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [dateRange, setDateRange] = useState('month');

  const fetchStudentData = useCallback(async () => {
    if (!studentId) return;

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

      const response = await getStudentIndividualAttendance(Number(studentId), {
        start_date: startDate,
        end_date: endDate,
      });

      if (response.status) {
        setStudentData(response.data);
      }
    } catch (error) {
      console.error('Fetch student data error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch student attendance data',
      });
    } finally {
      setLoading(false);
    }
  }, [studentId, dateRange, toast]);

  useEffect(() => {
    fetchStudentData();
  }, [fetchStudentData]);

  const getStatusBadge = (status: string) => {
    const config = {
      present: {
        variant: 'default' as const,
        className: 'bg-emerald-500 text-white',
        label: 'Present',
      },
      absent: {
        variant: 'destructive' as const,
        className: 'bg-rose-500 text-white',
        label: 'Absent',
      },
      late: {
        variant: 'secondary' as const,
        className: 'bg-amber-500 text-white',
        label: 'Late',
      },
      half_day: {
        variant: 'secondary' as const,
        className: 'bg-purple-500 text-white',
        label: 'Half Day',
      },
    };

    const statusConfig = config[status as keyof typeof config] || config.present;
    return (
      <Badge className={statusConfig.className}>
        {statusConfig.label}
      </Badge>
    );
  };

  if (loading && !studentData) {
    return (
      <div className="container mx-auto p-4 sm:p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="container mx-auto p-4 sm:p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">Student data not found</p>
            <Button onClick={() => navigate('/principal/students/attendance/analytics')} className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Analytics
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pieData = [
    { name: 'Present', value: studentData.stats.present_count },
    { name: 'Absent', value: studentData.stats.absent_count },
    { name: 'Late', value: studentData.stats.late_count },
    { name: 'Half Day', value: studentData.stats.half_day_count },
  ];

  const monthlyChartData = studentData.monthly_stats.map((stat) => ({
    name: format(new Date(stat.month + '-01'), 'MMM yyyy'),
    present: stat.present_count,
    absent: stat.absent_count,
    late: stat.late_count,
    percentage: stat.attendance_percentage,
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
          <h1 className="text-3xl font-bold text-foreground">{studentData.student.name}</h1>
          <p className="text-muted-foreground mt-1">
            Roll No: {studentData.student.roll_no} • Class {studentData.student.class} - {studentData.student.section}
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="space-y-2">
              <Label htmlFor="date-range">Date Range</Label>
              <select
                id="date-range"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                aria-label="Select date range"
              >
                <option value="week">Last 7 Days</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>
            <div className="ml-auto">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Attendance</p>
                <p className="text-2xl font-bold text-primary">
                  {studentData.stats.attendance_percentage.toFixed(1)}%
                </p>
              </div>
              <UserCheck className="w-8 h-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Present</p>
                <p className="text-2xl font-bold text-emerald-700">
                  {studentData.stats.present_count}
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
                  {studentData.stats.absent_count}
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
                  {studentData.stats.late_count}
                </p>
              </div>
              <Clock className="w-8 h-8 text-amber-700 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Records</p>
                <p className="text-2xl font-bold">{studentData.stats.total_records}</p>
              </div>
              <Calendar className="w-8 h-8 text-muted-foreground opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Attendance Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <AttendanceChart
              type="pie"
              data={pieData}
              dataKey="value"
              height={300}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyChartData.length > 0 ? (
              <AttendanceChart
                type="bar"
                data={monthlyChartData}
                height={300}
              />
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No monthly data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Stats */}
      {studentData.monthly_stats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Monthly Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {studentData.monthly_stats.map((stat) => (
                <div
                  key={stat.month}
                  className="p-4 bg-muted rounded-lg border"
                >
                  <p className="font-semibold text-foreground">
                    {format(new Date(stat.month + '-01'), 'MMMM yyyy')}
                  </p>
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Attendance:</span>
                      <span className="font-medium">{stat.attendance_percentage.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Present:</span>
                      <Badge className="bg-emerald-500 text-white">{stat.present_count}</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Absent:</span>
                      <Badge className="bg-rose-500 text-white">{stat.absent_count}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Attendance Records Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Attendance Records ({studentData.records.length})</CardTitle>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {studentData.records.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No attendance records found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentData.records.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        {format(new Date(record.attendance_date), 'dd MMM yyyy')}
                      </TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell>{record.check_in_time || '-'}</TableCell>
                      <TableCell>{record.check_out_time || '-'}</TableCell>
                      <TableCell>{record.subject || '-'}</TableCell>
                      <TableCell>
                        {record.period_number ? `P${record.period_number}` : '-'}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {record.remarks || '-'}
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

export default StudentIndividualAnalysis;


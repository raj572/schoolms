import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getTeacherAttendanceRecords, getSchoolTeachers } from '@/services/attendanceService';
import { CheckCircle, XCircle, Clock, Calendar, Search, Download, FileText, Filter, Loader2, User } from 'lucide-react';
import { format } from 'date-fns';
import { useAuthStore } from '@/store/useAuthStore';

interface Teacher {
  id: number;
  name: string;
  email: string;
}

interface TeacherAttendanceRecord {
  id: number;
  teacher_id: number;
  teacher_name: string;
  teacher_email: string;
  teacher_phone: string;
  profile_picture?: string;
  attendance_date: string;
  status: 'present' | 'absent' | 'late' | 'leave' | 'half_day';
  check_in_time?: string;
  check_out_time?: string;
  remarks?: string;
  marked_by_name?: string;
}

const TeacherDetailedView: React.FC = () => {
  const { toast } = useToast();
  const { authUser } = useAuthStore();
  
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<TeacherAttendanceRecord[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 50,
    total: 0,
    last_page: 1,
  });

  // Filters
  const [startDate, setStartDate] = useState(format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedTeacher, setSelectedTeacher] = useState<number>();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchTeachers = useCallback(async () => {
    const schoolId = Number(localStorage.getItem('school_id')) || authUser?.school_id;
    if (!schoolId) return;
    
    try {
      const response = await getSchoolTeachers(Number(schoolId));
      
      if (response.status && response.data) {
        const teacherList = Array.isArray(response.data) ? response.data : [];
        const transformedTeachers: Teacher[] = teacherList.map((t: Record<string, unknown>) => ({
          id: t.id as number,
          name: (t.name as string) || `${(t.first_name as string) || ''} ${(t.last_name as string) || ''}`.trim(),
          email: (t.email as string) || '',
        }));
        setTeachers(transformedTeachers);
      }
    } catch (error) {
      console.error('Fetch teachers error:', error);
    }
  }, [authUser]);

  const fetchRecords = useCallback(async () => {
    const schoolId = Number(localStorage.getItem('school_id')) || authUser?.school_id;
    if (!schoolId) return;

    try {
      setLoading(true);

      const response = await getTeacherAttendanceRecords({
        start_date: startDate,
        end_date: endDate,
        teacher_id: selectedTeacher,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchQuery || undefined,
      });

      if (response.status && response.data) {
        setRecords(response.data.records || []);
        setPagination(response.data.pagination || {
          current_page: 1,
          per_page: 50,
          total: 0,
          last_page: 1,
        });
      }
    } catch (error) {
      console.error('Fetch records error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch attendance records',
      });
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, selectedTeacher, statusFilter, searchQuery, authUser, toast]);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  useEffect(() => {
    if (startDate && endDate) {
      fetchRecords();
    }
  }, [fetchRecords, startDate, endDate]);

  const handleExport = () => {
    toast({
      title: 'Export Started',
      description: 'Your teacher attendance report is being generated...',
    });
    // TODO: Implement export functionality
  };

  const getStatusBadge = (status: string) => {
    const config = {
      present: {
        variant: 'default' as const,
        className: 'bg-emerald-500 text-white',
        icon: CheckCircle,
      },
      absent: {
        variant: 'destructive' as const,
        className: 'bg-rose-500 text-white',
        icon: XCircle,
      },
      late: {
        variant: 'secondary' as const,
        className: 'bg-amber-500 text-white',
        icon: Clock,
      },
      leave: {
        variant: 'secondary' as const,
        className: 'bg-blue-500 text-white',
        icon: Calendar,
      },
      half_day: {
        variant: 'secondary' as const,
        className: 'bg-purple-500 text-white',
        icon: Clock,
      },
    };

    const statusConfig = config[status as keyof typeof config] || config.present;
    const Icon = statusConfig.icon;

    return (
      <Badge variant={statusConfig.variant} className={statusConfig.className}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
      </Badge>
    );
  };

  const stats = useMemo(() => {
    const total = records.length;
    const present = records.filter((r) => r.status === 'present').length;
    const absent = records.filter((r) => r.status === 'absent').length;
    const late = records.filter((r) => r.status === 'late').length;
    const leave = records.filter((r) => r.status === 'leave').length;
    
    const attendancePercentage = total > 0 ? ((present / total) * 100).toFixed(1) : '0';
    
    return { total, present, absent, late, leave, attendancePercentage };
  }, [records]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Teacher Attendance Records</h2>
          <p className="text-muted-foreground">View and analyze teacher attendance history</p>
        </div>
        <Button onClick={handleExport} className="bg-primary hover:bg-primary/90">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="border-2 border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Records
            </CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="border-2 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Present</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-700" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-700">{stats.present}</div>
            <p className="text-xs text-muted-foreground mt-1">{stats.attendancePercentage}%</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-rose-200 bg-rose-50 dark:bg-rose-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Absent</CardTitle>
            <XCircle className="h-4 w-4 text-rose-700" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-700">{stats.absent}</div>
          </CardContent>
        </Card>

        <Card className="border-2 border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Late</CardTitle>
            <Clock className="h-4 w-4 text-amber-700" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-700">{stats.late}</div>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200 bg-blue-50 dark:bg-blue-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">On Leave</CardTitle>
            <Calendar className="h-4 w-4 text-blue-700" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{stats.leave}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-2 border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground flex items-center">
            <Filter className="w-5 h-5 mr-2 text-primary" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {/* Date Range */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border-2 border-input focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border-2 border-input focus:border-primary"
              />
            </div>

            {/* Teacher Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Teacher</Label>
              <Select 
                value={selectedTeacher?.toString() || 'all'} 
                onValueChange={(value) => setSelectedTeacher(value === 'all' ? undefined : Number(value))}
              >
                <SelectTrigger className="border-2 border-input focus:border-primary">
                  <SelectValue placeholder="All Teachers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teachers</SelectItem>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id.toString()}>
                      {teacher.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="border-2 border-input focus:border-primary">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="late">Late</SelectItem>
                  <SelectItem value="leave">Leave</SelectItem>
                  <SelectItem value="half_day">Half Day</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Search */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Name, email, phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-2 border-input focus:border-primary"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Records Table */}
      <Card className="border-2 border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground flex items-center">
            <User className="w-5 h-5 mr-2 text-primary" />
            Attendance Records ({records.length})
            {pagination.total > 0 && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                (Page {pagination.current_page} of {pagination.last_page})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No records found</p>
              <p className="text-sm text-muted-foreground/80 mt-1">
                Try adjusting your filters or date range
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b-2 border-border">
                    <TableHead className="font-semibold text-foreground">Teacher</TableHead>
                    <TableHead className="font-semibold text-foreground">Date</TableHead>
                    <TableHead className="font-semibold text-foreground">Status</TableHead>
                    <TableHead className="font-semibold text-foreground">Check In</TableHead>
                    <TableHead className="font-semibold text-foreground">Check Out</TableHead>
                    <TableHead className="font-semibold text-foreground">Marked By</TableHead>
                    <TableHead className="font-semibold text-foreground">Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record) => (
                    <TableRow key={record.id} className="border-b border-border hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            {record.profile_picture ? (
                              <img
                                src={record.profile_picture}
                                alt={record.teacher_name}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <User className="w-5 h-5 text-primary" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{record.teacher_name}</div>
                            <div className="text-xs text-muted-foreground">{record.teacher_email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(record.attendance_date), 'dd MMM yyyy')}
                      </TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {record.check_in_time || '-'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {record.check_out_time || '-'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {record.marked_by_name || '-'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
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

      {/* Pagination */}
      {pagination.last_page > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (pagination.current_page > 1) {
                // TODO: Implement pagination
              }
            }}
            disabled={pagination.current_page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {pagination.current_page} of {pagination.last_page}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (pagination.current_page < pagination.last_page) {
                // TODO: Implement pagination
              }
            }}
            disabled={pagination.current_page === pagination.last_page}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default TeacherDetailedView;

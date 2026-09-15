import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/useAuthStore';
import {
  getSchoolClasses,
  getSchoolSubjects,
  getAttendanceRecords,
} from '@/services/attendanceService';
import {
  Calendar,
  Download,
  Filter,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  FileText,
  TrendingUp,
  Users,
} from 'lucide-react';
import { format } from 'date-fns';
import axios from 'axios';

interface AttendanceRecord {
  id: number;
  student_name: string;
  roll_no: string;
  class: string;
  section: string;
  subject?: string;
  period_number?: number;
  attendance_date: string;
  status: 'present' | 'absent' | 'late' | 'half_day';
  check_in_time?: string;
  remarks?: string;
}

const AttendanceRecords: React.FC = () => {
  const { toast } = useToast();
  const { authUser } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [classes, setClasses] = useState<Array<{ id: number; class: string; section: string }>>([]);
  const [subjects, setSubjects] = useState<Array<{ id: number; subject_name: string }>>([]);

  // Filters
  const [selectedClass, setSelectedClass] = useState<number>();
  const [selectedSubject, setSelectedSubject] = useState<number>();
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (authUser?.school_id) {
      fetchInitialData();
      fetchRecords();
    }
  }, [authUser?.school_id]);

  const fetchInitialData = async () => {
    if (!authUser?.school_id) return;

    try {
      const [classesRes, subjectsRes] = await Promise.all([
        getSchoolClasses(Number(authUser.school_id)),
        getSchoolSubjects(Number(authUser.school_id)),
      ]);

      if (classesRes.status && classesRes.data) {
        setClasses(Array.isArray(classesRes.data) ? classesRes.data : []);
      }

      if (subjectsRes.status && subjectsRes.data) {
        setSubjects(Array.isArray(subjectsRes.data) ? subjectsRes.data : []);
      }
    } catch (error) {
      console.error('Fetch initial data error:', error);
    }
  };

  const fetchRecords = async () => {
    if (!authUser?.school_id) return;

    try {
      setLoading(true);

      const response = await getAttendanceRecords({
        start_date: startDate,
        end_date: endDate,
        class_id: selectedClass,
        subject_id: selectedSubject,
        status: statusFilter,
        search: searchQuery,
      });

      if (response.status && response.data) {
        setRecords(response.data.records || []);
        
        // Update stats if provided by API
        if (response.data.stats) {
          // Stats are already calculated and displayed from filtered records
          // But we could use API stats here if needed
        }
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
  };

  const handleExport = () => {
    toast({
      title: 'Export Started',
      description: 'Your attendance report is being generated...',
    });
    // TODO: Implement export functionality
  };

  const getStatusBadge = (status: string) => {
    const config = {
      present: {
        variant: 'default' as const,
        className: 'bg-primary text-primary-foreground',
        icon: CheckCircle,
      },
      absent: {
        variant: 'destructive' as const,
        className: 'bg-destructive text-destructive-foreground',
        icon: XCircle,
      },
      late: {
        variant: 'secondary' as const,
        className: 'bg-muted text-muted-foreground',
        icon: Clock,
      },
      half_day: {
        variant: 'secondary' as const,
        className: 'bg-accent text-accent-foreground',
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

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.roll_no.includes(searchQuery);
    return matchesSearch;
  });

  const stats = {
    total: filteredRecords.length,
    present: filteredRecords.filter((r) => r.status === 'present').length,
    absent: filteredRecords.filter((r) => r.status === 'absent').length,
    late: filteredRecords.filter((r) => r.status === 'late').length,
  };

  const attendancePercentage =
    stats.total > 0 ? ((stats.present / stats.total) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Attendance Records</h2>
          <p className="text-muted-foreground">View and analyze student attendance history</p>
        </div>
        <Button onClick={handleExport} className="bg-primary hover:bg-primary/90">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
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

        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Present</CardTitle>
            <CheckCircle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.present}</div>
            <p className="text-xs text-muted-foreground mt-1">{attendancePercentage}%</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-destructive/20 bg-destructive/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Absent</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.absent}</div>
          </CardContent>
        </Card>

        <Card className="border-2 border-muted-foreground/20 bg-muted/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Late</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">{stats.late}</div>
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

            {/* Class Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Class</Label>
              <Select
                value={selectedClass?.toString() || 'all'}
                onValueChange={(value) => setSelectedClass(value === 'all' ? undefined : Number(value))}
              >
                <SelectTrigger className="border-2 border-input focus:border-primary">
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
            </div>

            {/* Subject Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Subject</Label>
              <Select
                value={selectedSubject?.toString() || 'all'}
                onValueChange={(value) =>
                  setSelectedSubject(value === 'all' ? undefined : Number(value))
                }
              >
                <SelectTrigger className="border-2 border-input focus:border-primary">
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map((sub) => (
                    <SelectItem key={sub.id} value={sub.id.toString()}>
                      {sub.subject_name}
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
                  <SelectItem value="half_day">Half Day</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or roll number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-2 border-input focus:border-primary"
              />
            </div>

            <Button onClick={fetchRecords} disabled={loading} className="bg-primary hover:bg-primary/90">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Records Table */}
      <Card className="border-2 border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground flex items-center">
            <Users className="w-5 h-5 mr-2 text-primary" />
            Attendance Records ({filteredRecords.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredRecords.length === 0 ? (
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
                    <TableHead className="font-semibold text-foreground">Roll No</TableHead>
                    <TableHead className="font-semibold text-foreground">Student Name</TableHead>
                    <TableHead className="font-semibold text-foreground">Class</TableHead>
                    <TableHead className="font-semibold text-foreground">Subject</TableHead>
                    <TableHead className="font-semibold text-foreground">Period</TableHead>
                    <TableHead className="font-semibold text-foreground">Date</TableHead>
                    <TableHead className="font-semibold text-foreground">Time</TableHead>
                    <TableHead className="font-semibold text-foreground">Status</TableHead>
                    <TableHead className="font-semibold text-foreground">Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id} className="border-b border-border hover:bg-muted/50">
                      <TableCell className="font-medium text-foreground">
                        {record.roll_no}
                      </TableCell>
                      <TableCell className="text-foreground">{record.student_name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {record.class}-{record.section}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {record.subject || '-'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {record.period_number ? `P${record.period_number}` : '-'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(record.attendance_date), 'dd MMM yyyy')}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {record.check_in_time 
                          ? format(new Date(record.check_in_time), 'hh:mm a')
                          : '-'}
                      </TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
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

export default AttendanceRecords;


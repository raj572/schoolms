import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Download, Calendar as CalendarIcon, Users, UserCheck, UserX, Clock, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useAuthStore } from '@/store/useAuthStore';

interface AttendanceRecord {
  id: string;
  studentName: string;
  rollNo: string;
  class: string;
  section: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateComings: number;
  attendancePercentage: number;
  lastAbsent: string;
}

interface DailyAttendance {
  date: string;
  totalStudents: number;
  present: number;
  absent: number;
  attendanceRate: number;
}

const AttendanceReport = () => {
  const authUser = useAuthStore((state) => state.authUser);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dailyAttendance, setDailyAttendance] = useState<DailyAttendance[]>([]);

  // Fetch attendance data from API
  useEffect(() => {
    const fetchAttendanceData = async () => {
      if (!authUser?.school_id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // Fetch attendance data
        const response = await fetch(`http://localhost:8000/api/principal/reports/attendance-trends/${authUser.school_id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const result = await response.json();
          // Transform API data to match our interface
          if (result.data && result.data.studentAttendance) {
            // Process attendance data - this would need to be adapted based on actual API response
            setAttendanceRecords([]);
          }
        } else {
          setError('Failed to fetch attendance data');
        }
      } catch (err) {
        console.error('Error fetching attendance:', err);
        setError('Failed to load attendance data');
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, [authUser]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  // Get unique classes from loaded data
  const availableClasses = [...new Set(attendanceRecords.map(r => r.class))].sort();

  const filteredRecords = attendanceRecords.filter(record => {
    const matchesSearch = record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.rollNo.includes(searchTerm);
    const matchesClass = selectedClass === 'all' || record.class === selectedClass;
    
    return matchesSearch && matchesClass;
  });

  // Calculate summary statistics
  const averageAttendance = attendanceRecords.length > 0 
    ? attendanceRecords.reduce((sum, record) => sum + record.attendancePercentage, 0) / attendanceRecords.length 
    : 0;
  const lowAttendanceStudents = attendanceRecords.filter(record => record.attendancePercentage < 75).length;
  const perfectAttendance = attendanceRecords.filter(record => record.attendancePercentage >= 95).length;

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 95) return 'default';
    if (percentage >= 85) return 'secondary';
    if (percentage >= 75) return 'outline';
    return 'destructive';
  };

  const downloadReport = () => {
    console.log('Downloading attendance report...');
  };

  const markAttendance = () => {
    console.log('Opening attendance marking interface...');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading attendance data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 ">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold ">Attendance Reports</h2>
          <p className="text-gray-500 text-xs">Track and manage student attendance</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={markAttendance}>
            <Clock className="h-4 w-4 mr-2" />
            Mark Attendance
          </Button>
          <Button onClick={downloadReport}>
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Attendance</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{averageAttendance.toFixed(1)}%</div>
            <p className="text-xs text-gray-500">School average</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Perfect Attendance</CardTitle>
            <UserCheck className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{perfectAttendance}</div>
            <p className="text-xs text-gray-500">Students ≥95%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Attendance</CardTitle>
            <UserX className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{lowAttendanceStudents}</div>
            <p className="text-xs text-gray-500">Students &lt;75%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Attendance</CardTitle>
            <CalendarIcon className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {dailyAttendance.length > 0 ? `${dailyAttendance[0].attendanceRate.toFixed(1)}%` : 'N/A'}
            </div>
            <p className="text-xs text-gray-500">
              {dailyAttendance.length > 0 ? `${dailyAttendance[0].present}/${dailyAttendance[0].totalStudents}` : 'No data'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="student-wise" className="space-y-4 w-full">
        <div className="overflow-x-auto pb-2">
          <TabsList className="flex min-w-max w-full bg-muted/60 p-1">
            <TabsTrigger value="student-wise">Student-wise</TabsTrigger>
            <TabsTrigger value="daily">Daily Report</TabsTrigger>
            <TabsTrigger value="mark-attendance">Mark Attendance</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="student-wise" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-md">Filter Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Search Student</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      id="search"
                      placeholder="Name or Roll No."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="class">Class</Label>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
                      {availableClasses.map(cls => (
                        <SelectItem key={cls} value={cls}>Class {cls}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date Range</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Student Attendance Table */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Student Attendance Records</CardTitle>
              <CardDescription className='text-xs text-gray-500'>
                Individual attendance records for all students ({filteredRecords.length} results)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Roll No.</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Total Days</TableHead>
                    <TableHead>Present</TableHead>
                    <TableHead>Absent</TableHead>
                    <TableHead>Late</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead>Last Absent</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium text-xs">{record.rollNo}</TableCell>
                      <TableCell className="font-medium text-xs">{record.studentName}</TableCell>
                      <TableCell className="font-medium text-xs">{record.class}-{record.section}</TableCell>
                      <TableCell className="font-medium text-xs">{record.totalDays}</TableCell>
                      <TableCell  className="font-medium text-xs">{record.presentDays}</TableCell>
                      <TableCell className="font-medium text-xs">{record.absentDays}</TableCell>
                      <TableCell className="font-medium text-xs">{record.lateComings}</TableCell>
                      <TableCell className="font-medium">{record.attendancePercentage}%</TableCell>
                      <TableCell className="font-medium text-xs">{record.lastAbsent}</TableCell>
                      <TableCell>
                        <Badge variant={getAttendanceColor(record.attendancePercentage)}>
                          {record.attendancePercentage >= 95 ? 'Excellent' :
                           record.attendancePercentage >= 85 ? 'Good' :
                           record.attendancePercentage >= 75 ? 'Average' : 'Poor'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="daily" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Daily Attendance Summary</CardTitle>
              <CardDescription className='text-xs text-gray-500'>Daily attendance statistics for the school</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Total Students</TableHead>
                    <TableHead>Present</TableHead>
                    <TableHead>Absent</TableHead>
                    <TableHead>Attendance Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dailyAttendance.map((day, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium text-xs">{day.date}</TableCell>
                      <TableCell className="font-medium text-xs">{day.totalStudents}</TableCell>
                      <TableCell className="text-green-600 text-xs">{day.present}</TableCell>
                      <TableCell className="text-red-600 text-xs">{day.absent}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-xs">{day.attendanceRate}%</span>
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${day.attendanceRate}%` }}
                            ></div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mark-attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mark Attendance</CardTitle>
              <CardDescription>Mark attendance for today's classes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">Class 10</SelectItem>
                      <SelectItem value="9">Class 9</SelectItem>
                      <SelectItem value="8">Class 8</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select section" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">Section A</SelectItem>
                      <SelectItem value="B">Section B</SelectItem>
                      <SelectItem value="C">Section C</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button>
                    Load Students
                  </Button>
                </div>
                <div className="text-center py-8 text-gray-500">
                  Select a class and section to begin marking attendance
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AttendanceReport;
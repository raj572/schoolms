import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/useAuthStore';
import { TeacherAttendanceCard } from '@/components/attendance/TeacherAttendanceCard';
import { TeacherBulkActionBar } from '@/components/attendance/TeacherBulkActionBar';
import { Search } from 'lucide-react';
import {
  markTeacherAttendance,
  getSchoolTeachers,
  getTodayTeacherAttendance,
} from '@/services/attendanceService';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import Confetti from 'react-confetti';

interface Teacher {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  designation: string;
  avatar?: string;
}

interface AttendanceStatus {
  [teacherId: number]: 'present' | 'absent' | 'late' | 'leave' | null;
}

interface AttendanceTime {
  [teacherId: number]: {
    check_in_time?: string;
    check_out_time?: string;
  };
}

const TeacherQuickMark: React.FC = () => {
  const { authUser } = useAuthStore();
  const { toast } = useToast();
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [attendanceStatus, setAttendanceStatus] = useState<AttendanceStatus>({});
  const [attendanceTime, setAttendanceTime] = useState<AttendanceTime>({});
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [attendanceAlreadyTaken, setAttendanceAlreadyTaken] = useState(false);

  // Fetch teachers
  useEffect(() => {
    fetchTeachers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch today's attendance when date or teachers change
  useEffect(() => {
    if (teachers.length > 0) {
      fetchTodayAttendance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, teachers.length]);

  const fetchTeachers = async () => {
    const schoolId = Number(localStorage.getItem('school_id')) || authUser?.school_id;
    if (!schoolId) return;
    
    try {
      setLoading(true);
      const response = await getSchoolTeachers(Number(schoolId));
      
      if (response.status && response.data) {
        const teacherList = Array.isArray(response.data) ? response.data : [];
        
        // Transform teacher data to match the interface
        const transformedTeachers: Teacher[] = teacherList.map((t: Record<string, unknown>) => ({
          id: t.id as number,
          name: (t.name as string) || `${(t.first_name as string) || ''} ${(t.last_name as string) || ''}`.trim() || 'Unknown Teacher',
          email: (t.email as string) || '',
          phone: (t.phone as string) || (t.contact_number as string) || '',
          subject: (t.subject as string) || (t.subjects as string) || 'Not Assigned',
          designation: (t.designation as string) || 'Teacher',
          avatar: (t.avatar as string) || (t.profile_picture as string),
        }));
        
        setTeachers(transformedTeachers);
        
        // Initialize attendance status and time
        const initialStatus: AttendanceStatus = {};
        const initialTime: AttendanceTime = {};
        transformedTeachers.forEach(teacher => {
          initialStatus[teacher.id] = null;
          initialTime[teacher.id] = {
            check_in_time: '09:00',
            check_out_time: '17:00',
          };
        });
        setAttendanceStatus(initialStatus);
        setAttendanceTime(initialTime);
        setHasChanges(false);
        setAttendanceAlreadyTaken(false);
      }
    } catch (error) {
      console.error('Fetch teachers error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch teachers',
      });
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayAttendance = async () => {
    const schoolId = Number(localStorage.getItem('school_id')) || authUser?.school_id;
    if (!schoolId) return;
    
    try {
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      const response = await getTodayTeacherAttendance(dateString);
      
      if (response.status && response.data) {
        const { teachers: teachersData, attendance_taken } = response.data;
        
        if (attendance_taken && teachersData) {
          // Pre-populate attendance status and time from existing records
          const existingStatus: AttendanceStatus = { ...attendanceStatus };
          const existingTime: AttendanceTime = { ...attendanceTime };
          
          teachersData.forEach((teacherData: {
            teacher_id: number;
            status: 'present' | 'absent' | 'late' | 'leave' | null;
            check_in_time?: string;
            check_out_time?: string;
          }) => {
            if (teacherData.status) {
              existingStatus[teacherData.teacher_id] = teacherData.status;
              if (teacherData.status === 'present') {
                existingTime[teacherData.teacher_id] = {
                  check_in_time: teacherData.check_in_time || '09:00',
                  check_out_time: teacherData.check_out_time || '17:00',
                };
              }
            }
          });
          
          setAttendanceStatus(existingStatus);
          setAttendanceTime(existingTime);
          setHasChanges(false);
          setAttendanceAlreadyTaken(true);
        } else {
          setAttendanceAlreadyTaken(false);
        }
      }
    } catch (error) {
      console.error('Fetch today attendance error:', error);
      // Don't show toast for this, it's not critical
    }
  };

  // Filter teachers
  const filteredTeachers = useMemo(() => {
    if (!searchQuery) return teachers;
    
    const query = searchQuery.toLowerCase();
    return teachers.filter(
      (teacher) =>
        teacher.name.toLowerCase().includes(query) ||
        teacher.email.toLowerCase().includes(query) ||
        teacher.subject.toLowerCase().includes(query)
    );
  }, [teachers, searchQuery]);

  // Count marked teachers
  const markedCount = useMemo(() => {
    return Object.values(attendanceStatus).filter((status) => status !== null).length;
  }, [attendanceStatus]);

  const handleAttendanceChange = (teacherId: number, status: 'present' | 'absent' | 'late' | 'leave') => {
    setAttendanceStatus((prev) => ({
      ...prev,
      [teacherId]: prev[teacherId] === status ? null : status,
    }));
    setHasChanges(true);
  };

  const handleTimeChange = (teacherId: number, field: 'check_in_time' | 'check_out_time', value: string) => {
    setAttendanceTime((prev) => ({
      ...prev,
      [teacherId]: {
        ...prev[teacherId],
        [field]: value,
      },
    }));
    setHasChanges(true);
  };

  const handleMarkAllPresent = () => {
    const newStatus: AttendanceStatus = {};
    teachers.forEach((teacher) => {
      newStatus[teacher.id] = 'present';
    });
    setAttendanceStatus(newStatus);
    setHasChanges(true);
  };

  const handleMarkAllAbsent = () => {
    const newStatus: AttendanceStatus = {};
    teachers.forEach((teacher) => {
      newStatus[teacher.id] = 'absent';
    });
    setAttendanceStatus(newStatus);
    setHasChanges(true);
  };

  const handleReset = () => {
    const resetStatus: AttendanceStatus = {};
    const resetTime: AttendanceTime = {};
    teachers.forEach((teacher) => {
      resetStatus[teacher.id] = null;
      resetTime[teacher.id] = {
        check_in_time: '09:00',
        check_out_time: '17:00',
      };
    });
    setAttendanceStatus(resetStatus);
    setAttendanceTime(resetTime);
    setHasChanges(false);
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Prepare attendance data
      const attendanceData = teachers
        .filter((teacher) => attendanceStatus[teacher.id] !== null)
        .map((teacher) => {
          const status = attendanceStatus[teacher.id]!;
          const time = attendanceTime[teacher.id] || {};
          
          return {
            teacher_id: teacher.id,
            status: status,
            check_in_time: status === 'present' ? (time.check_in_time || '09:00') : undefined,
            check_out_time: status === 'present' ? (time.check_out_time || '17:00') : undefined,
          };
        });

      if (attendanceData.length === 0) {
        toast({
          variant: 'destructive',
          title: 'No Data',
          description: 'Please mark attendance for at least one teacher',
        });
        return;
      }

      await markTeacherAttendance({
        attendance_date: format(selectedDate, 'yyyy-MM-dd'),
        teachers: attendanceData,
      });

      // Check if 100% attendance and all present
      const totalMarked = Object.values(attendanceStatus).filter(s => s !== null).length;
      const allPresent = Object.values(attendanceStatus).every(s => s === 'present' || s === null);
      
      if (totalMarked === teachers.length && allPresent) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
        toast({
          title: '🎉 Perfect Attendance!',
          description: 'All teachers are present today!',
        });
      } else {
        toast({
          title: 'Success',
          description: 'Teacher attendance saved successfully',
        });
      }

      setHasChanges(false);
      
      // Refresh attendance data
      await fetchTodayAttendance();
    } catch (error) {
      console.error('Save attendance error:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading && teachers.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          numberOfPieces={200}
          recycle={false}
        />
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Date Picker */}
            <div className="space-y-2">
              <Label htmlFor="attendance-date" className="text-sm font-medium text-foreground">
                Date
              </Label>
              <Input
                id="attendance-date"
                type="date"
                value={format(selectedDate, 'yyyy-MM-dd')}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Search */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="teacher-search" className="text-sm font-medium text-foreground">
                Search Teacher
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="teacher-search"
                  type="text"
                  placeholder="Search by name, email, or subject..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          {attendanceAlreadyTaken && (
            <div className="mt-4">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                ✓ Attendance already taken for this date
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Action Bar */}
      {teachers.length > 0 && (
        <TeacherBulkActionBar
          totalTeachers={teachers.length}
          markedCount={markedCount}
          onMarkAllPresent={handleMarkAllPresent}
          onMarkAllAbsent={handleMarkAllAbsent}
          onSave={handleSave}
          onReset={handleReset}
          isSaving={saving}
          hasChanges={hasChanges}
        />
      )}

      {/* Teacher Grid */}
      {filteredTeachers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTeachers.map((teacher) => (
            <TeacherAttendanceCard
              key={teacher.id}
              teacher={teacher}
              status={attendanceStatus[teacher.id]}
              checkInTime={attendanceTime[teacher.id]?.check_in_time}
              checkOutTime={attendanceTime[teacher.id]?.check_out_time}
              onChange={(status) => handleAttendanceChange(teacher.id, status)}
              onTimeChange={(field, value) => handleTimeChange(teacher.id, field, value)}
              disabled={saving}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 text-center">
            <p className="text-lg font-medium text-muted-foreground">
              {searchQuery ? 'No teachers found' : 'No teachers available'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {searchQuery ? 'Try a different search term' : 'Add teachers to start marking attendance'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TeacherQuickMark;


import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/useAuthStore';
import { AttendanceCard } from '@/components/attendance/AttendanceCard';
import { BulkActionBar } from '@/components/attendance/BulkActionBar';
import { AttendanceFilter } from '@/components/attendance/AttendanceFilter';
import { AlertTriangle } from 'lucide-react';
import {
  markStudentAttendance,
  getSchoolClasses,
  getClassStudents,
  getTodayAttendanceByClass,
} from '@/services/attendanceService';
import { Loader2, PartyPopper } from 'lucide-react';
import { format } from 'date-fns';
import Confetti from 'react-confetti';

interface Student {
  id: number;
  name: string;
  roll_no: string;
  class: string;
  section: string;
  avatar?: string;
}

interface AttendanceStatus {
  [studentId: number]: 'present' | 'absent' | 'late' | null;
}

const QuickMark: React.FC = () => {
  const { authUser } = useAuthStore();
  const { toast } = useToast();
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedClass, setSelectedClass] = useState<number>();
  const [searchQuery, setSearchQuery] = useState('');
  const [attendanceStatus, setAttendanceStatus] = useState<AttendanceStatus>({});
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Array<{ id: number; class: string; section: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [attendanceAlreadyTaken, setAttendanceAlreadyTaken] = useState(false);
  const [hasPeriodAttendance, setHasPeriodAttendance] = useState(false);
  const [periodCount, setPeriodCount] = useState(0);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Fetch classes and students
  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents();
    }
  }, [selectedClass]);

  useEffect(() => {
    if (selectedClass && students.length > 0) {
      fetchTodayAttendance();
    }
  }, [selectedDate, selectedClass, students.length]);

  const fetchClasses = async () => {
    if (!authUser?.school_id) return;
    
    try {
      setLoading(true);
      const response = await getSchoolClasses(Number(authUser.school_id));
      
      if (response.status && response.data) {
        const classList = Array.isArray(response.data) ? response.data : [];
        setClasses(classList);
        
        if (classList.length > 0) {
          setSelectedClass(classList[0].id);
        }
      }
    } catch (error) {
      console.error('Fetch classes error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch classes',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    if (!authUser?.school_id || !selectedClass) return;
    
    const selectedClassData = classes.find(c => c.id === selectedClass);
    if (!selectedClassData) return;
    
    try {
      setLoading(true);
      const response = await getClassStudents(Number(authUser.school_id), {
        class: selectedClassData.class,
        section: selectedClassData.section,
      });
      
      if (response.status && response.data) {
        const studentList = Array.isArray(response.data) ? response.data : [];
        setStudents(studentList);
        
        // Initialize attendance status
        const initialStatus: AttendanceStatus = {};
        studentList.forEach((student: Student) => {
          initialStatus[student.id] = null;
        });
        setAttendanceStatus(initialStatus);
        setHasChanges(false);
        setAttendanceAlreadyTaken(false);
      }
    } catch (error) {
      console.error('Fetch students error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch students',
      });
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayAttendance = async () => {
    if (!authUser?.school_id || !selectedClass) return;
    
    try {
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      const response = await getTodayAttendanceByClass(dateString);
      
      if (response.status && response.data) {
        const attendanceByClass = response.data.attendance_by_class || [];
        const classAttendance = attendanceByClass.find(
          (item: { class_id: number }) => item.class_id === selectedClass
        );
        
        if (classAttendance) {
          // Check for period attendance (blocks quick attendance)
          const hasPeriod = classAttendance.has_period_attendance || false;
          const periodCnt = classAttendance.period_count || 0;
          setHasPeriodAttendance(hasPeriod);
          setPeriodCount(periodCnt);
          
          // Check for quick attendance
          if (classAttendance.has_quick_attendance && classAttendance.attendance_taken) {
            // Pre-populate attendance status from existing records (only quick attendance records)
            const existingStatus: AttendanceStatus = { ...attendanceStatus };
            // Filter only quick attendance records (period_number is null)
            const quickRecords = classAttendance.records.filter((record: {
              period_number: number | null;
            }) => record.period_number === null);
            
            quickRecords.forEach((record: {
              student_id: number;
              status: 'present' | 'absent' | 'late';
            }) => {
              if (existingStatus[record.student_id] === null) {
                existingStatus[record.student_id] = record.status;
              }
            });
            setAttendanceStatus(existingStatus);
            setHasChanges(false);
            setAttendanceAlreadyTaken(true);
          } else {
            setAttendanceAlreadyTaken(false);
          }
        } else {
          setHasPeriodAttendance(false);
          setPeriodCount(0);
          setAttendanceAlreadyTaken(false);
        }
      }
    } catch (error) {
      console.error('Fetch today attendance error:', error);
      // Don't show toast for this, it's not critical
    }
  };

  // Filter students
  const filteredStudents = useMemo(() => {
    if (!searchQuery) return students;
    
    const query = searchQuery.toLowerCase();
    return students.filter(
      (student) =>
        student.name.toLowerCase().includes(query) ||
        student.roll_no.toLowerCase().includes(query)
    );
  }, [students, searchQuery]);

  // Count marked students
  const markedCount = useMemo(() => {
    return Object.values(attendanceStatus).filter((status) => status !== null).length;
  }, [attendanceStatus]);

  const handleAttendanceChange = (studentId: number, status: 'present' | 'absent' | 'late') => {
    setAttendanceStatus((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === status ? null : status,
    }));
    setHasChanges(true);
  };

  const handleMarkAllPresent = () => {
    const newStatus: AttendanceStatus = {};
    students.forEach((student) => {
      newStatus[student.id] = 'present';
    });
    setAttendanceStatus(newStatus);
    setHasChanges(true);
  };

  const handleMarkAllAbsent = () => {
    const newStatus: AttendanceStatus = {};
    students.forEach((student) => {
      newStatus[student.id] = 'absent';
    });
    setAttendanceStatus(newStatus);
    setHasChanges(true);
  };

  const handleReset = () => {
    const resetStatus: AttendanceStatus = {};
    students.forEach((student) => {
      resetStatus[student.id] = null;
    });
    setAttendanceStatus(resetStatus);
    setHasChanges(false);
  };

  const handleSave = async () => {
    // Check if period attendance exists - require confirmation
    if (hasPeriodAttendance) {
      setShowConfirmDialog(true);
      return;
    }

    await performSave();
  };

  const performSave = async () => {
    try {
      setSaving(true);

      // Prepare attendance data
      const attendanceData = students
        .filter((student) => attendanceStatus[student.id] !== null)
        .map((student) => ({
          student_id: student.id,
          status: attendanceStatus[student.id]!,
        }));

      if (attendanceData.length === 0) {
        toast({
          variant: 'destructive',
          title: 'No Data',
          description: 'Please mark attendance for at least one student',
        });
        return;
      }

      const response = await markStudentAttendance({
        attendance_date: format(selectedDate, 'yyyy-MM-dd'),
        class_id: selectedClass,
        attendance_type: 'quick',
        students: attendanceData,
      });

      // Check for deleted period records in response
      const deletedCount = response.data?.deleted_period_records || 0;
      
      // Check if 100% attendance
      const totalMarked = Object.values(attendanceStatus).filter(s => s !== null).length;
      const allPresent = Object.values(attendanceStatus).every(s => s === 'present' || s === null);
      
      if (totalMarked === students.length && allPresent) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
        toast({
          title: '🎉 Perfect Attendance!',
          description: deletedCount > 0 
            ? `All students are present today! (Deleted ${deletedCount} period record(s))`
            : 'All students are present today!',
        });
      } else {
        toast({
          title: 'Success',
          description: deletedCount > 0
            ? `Attendance saved. Deleted ${deletedCount} period attendance record(s).`
            : 'Attendance saved successfully',
        });
      }

      setHasChanges(false);
      setHasPeriodAttendance(false);
      setPeriodCount(0);
      
      // Refresh attendance data
      await fetchTodayAttendance();
    } catch (error) {
      console.error('Save attendance error:', error);
      const errorStatus = (error as { response?: { status?: number } }).response?.status;
      
      if (errorStatus === 409) {
        toast({
          variant: 'destructive',
          title: 'Cannot Save',
          description: (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Conflict with existing attendance',
        });
      }
    } finally {
      setSaving(false);
      setShowConfirmDialog(false);
    }
  };

  if (loading && students.length === 0) {
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
      <div className="space-y-4">
        <AttendanceFilter
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          selectedClass={selectedClass}
          onClassChange={setSelectedClass}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          classes={classes}
          showPeriodSelector={false}
          showSubjectSelector={false}
        />
        {hasPeriodAttendance && (
          <Alert className="bg-yellow-50 border-yellow-200">
            <AlertTriangle className="h-4 w-4 text-yellow-700" />
            <AlertTitle className="text-yellow-800">Period Attendance Exists</AlertTitle>
            <AlertDescription className="text-yellow-700">
              <p className="mt-1">
                Period attendance has already been marked ({periodCount} record(s)). 
                Marking quick attendance will delete all period records for this class and date.
              </p>
            </AlertDescription>
          </Alert>
        )}
        
        {attendanceAlreadyTaken && !hasPeriodAttendance && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
              ✓ Attendance already taken for this date
            </Badge>
          </div>
        )}

        {/* Confirmation Dialog */}
        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Delete Period Attendance</AlertDialogTitle>
              <AlertDialogDescription>
                Period attendance has been marked ({periodCount} record(s)) for this class and date.
                Marking quick attendance will <strong>delete all period attendance records</strong> for this class and date.
                <br /><br />
                Are you sure you want to continue?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={performSave} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete and Mark Quick Attendance
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Bulk Action Bar */}
      {students.length > 0 && (
        <BulkActionBar
          totalStudents={students.length}
          markedCount={markedCount}
          onMarkAllPresent={handleMarkAllPresent}
          onMarkAllAbsent={handleMarkAllAbsent}
          onSave={handleSave}
          onReset={handleReset}
          isSaving={saving}
          hasChanges={hasChanges}
        />
      )}

      {/* Student Grid */}
      {filteredStudents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student) => (
            <AttendanceCard
              key={student.id}
              student={student}
              status={attendanceStatus[student.id]}
              onChange={(status) => handleAttendanceChange(student.id, status)}
              disabled={saving || hasPeriodAttendance}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 text-center">
            <p className="text-lg font-medium text-muted-foreground">
              {searchQuery ? 'No students found' : 'No students in this class'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {searchQuery ? 'Try a different search term' : 'Add students to start marking attendance'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QuickMark;


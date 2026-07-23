import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/useAuthStore';
import { AttendanceCard } from '@/components/attendance/AttendanceCard';
import { BulkActionBar } from '@/components/attendance/BulkActionBar';
import { AttendanceFilter } from '@/components/attendance/AttendanceFilter';
import {
  markStudentAttendance,
  getSchoolClasses,
  getClassStudents,
  getSchoolSubjects,
  getTodayAttendanceByClass,
} from '@/services/attendanceService';
import { Loader2, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { format } from 'date-fns';

interface Student {
  id: number;
  name: string;
  roll_no: string;
  class: string;
  section: string;
}

interface AttendanceStatus {
  [studentId: number]: 'present' | 'absent' | 'late' | null;
}

interface Subject {
  id: number;
  subject_name: string;
}

const PeriodWise: React.FC = () => {
  const { authUser } = useAuthStore();
  const { toast } = useToast();
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedClass, setSelectedClass] = useState<number>();
  const [selectedPeriod, setSelectedPeriod] = useState<number>();
  const [selectedSubject, setSelectedSubject] = useState<number>();
  const [searchQuery, setSearchQuery] = useState('');
  const [attendanceStatus, setAttendanceStatus] = useState<AttendanceStatus>({});
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Array<{ id: number; class: string; section: string }>>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [attendanceAlreadyTaken, setAttendanceAlreadyTaken] = useState(false);
  const [fetchingAttendance, setFetchingAttendance] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [hasQuickAttendance, setHasQuickAttendance] = useState(false);
  const [attendanceStats, setAttendanceStats] = useState<{
    marked: number;
    present: number;
    absent: number;
    late: number;
  } | null>(null);

  useEffect(() => {
    fetchClassesAndSubjects();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents();
    }
  }, [selectedClass]);

  // Reset form when period or subject changes (before fetching new data)
  useEffect(() => {
    if (students.length > 0 && (selectedPeriod || selectedSubject)) {
      const resetStatus: AttendanceStatus = {};
      students.forEach((student) => {
        resetStatus[student.id] = null;
      });
      setAttendanceStatus(resetStatus);
      setHasChanges(false);
      setAttendanceAlreadyTaken(false);
      setAttendanceStats(null);
      setFetchError(null);
      setHasQuickAttendance(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPeriod, selectedSubject, selectedDate]);

  // Fetch attendance for the selected period/subject combination
  useEffect(() => {
    if (selectedClass && students.length > 0 && selectedPeriod && selectedSubject) {
      // Small delay to ensure reset happens first
      const timeoutId = setTimeout(() => {
        fetchTodayAttendance();
      }, 0);
      
      return () => clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, selectedClass, selectedPeriod, selectedSubject, students.length]);

  const fetchClassesAndSubjects = async () => {
    if (!authUser?.school_id) return;
    
    try {
      setLoading(true);
      
      // Fetch classes and subjects in parallel
      const [classesRes, subjectsRes] = await Promise.all([
        getSchoolClasses(Number(authUser.school_id)),
        getSchoolSubjects(Number(authUser.school_id)),
      ]);
      
      if (classesRes.status && classesRes.data) {
        const classList = Array.isArray(classesRes.data) ? classesRes.data : [];
        setClasses(classList);
        if (classList.length > 0) {
          setSelectedClass(classList[0].id);
        }
      }
      
      if (subjectsRes.status && subjectsRes.data) {
        const subjectList = Array.isArray(subjectsRes.data) ? subjectsRes.data : [];
        setSubjects(subjectList);
        if (subjectList.length > 0) {
          setSelectedSubject(subjectList[0].id);
        }
      }
      
      setSelectedPeriod(1);
    } catch (error) {
      console.error('Fetch data error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch data',
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
        
        const initialStatus: AttendanceStatus = {};
        studentList.forEach((student: Student) => {
          initialStatus[student.id] = null;
        });
        setAttendanceStatus(initialStatus);
        setHasChanges(false);
        setAttendanceAlreadyTaken(false);
        setAttendanceStats(null);
        setFetchError(null);
        setHasQuickAttendance(false);
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
    if (!authUser?.school_id || !selectedClass || !selectedPeriod || !selectedSubject) {
      setFetchError(null);
      setAttendanceAlreadyTaken(false);
      return;
    }
    
    try {
      setFetchingAttendance(true);
      setFetchError(null);
      
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      const response = await getTodayAttendanceByClass(dateString);
      
      if (response.status && response.data) {
        const attendanceByClass = response.data.attendance_by_class || [];
        const classAttendance = attendanceByClass.find(
          (item: { class_id: number }) => item.class_id === selectedClass
        );
        
        if (classAttendance) {
          // Check for quick attendance (blocks period attendance)
          const hasQuick = classAttendance.has_quick_attendance || false;
          setHasQuickAttendance(hasQuick);
          
          if (hasQuick) {
            // Quick attendance exists - block period attendance
            setAttendanceAlreadyTaken(false);
            setAttendanceStats(null);
            toast({
              variant: 'destructive',
              title: 'Quick Attendance Exists',
              description: 'Quick attendance already marked. Cannot mark period attendance.',
            });
          } else if (classAttendance && classAttendance.attendance_taken) {
            // Filter records by period_number and subject_id for period-wise attendance
            const periodRecords = classAttendance.records.filter((record: {
              period_number: number | null;
              subject_id: number | null;
            }) => 
              record.period_number === selectedPeriod && 
              record.subject_id === selectedSubject
            );
            
            if (periodRecords.length > 0) {
              // Calculate statistics for this period
              const stats = {
                marked: periodRecords.length,
                present: periodRecords.filter((r: { status: string }) => r.status === 'present').length,
                absent: periodRecords.filter((r: { status: string }) => r.status === 'absent').length,
                late: periodRecords.filter((r: { status: string }) => r.status === 'late').length,
              };
              setAttendanceStats(stats);
              
              // Pre-populate attendance status from existing records
              const existingStatus: AttendanceStatus = { ...attendanceStatus };
              periodRecords.forEach((record: {
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
              
              // Show info toast
              toast({
                title: 'Existing attendance loaded',
                description: `Found ${stats.marked} attendance records for this period. You can update them if needed.`,
                variant: 'default',
              });
            } else {
              setAttendanceAlreadyTaken(false);
              setAttendanceStats(null);
            }
          } else {
            setAttendanceAlreadyTaken(false);
            setAttendanceStats(null);
          }
        } else {
          setHasQuickAttendance(false);
          setAttendanceAlreadyTaken(false);
          setAttendanceStats(null);
        }
      } else {
        setFetchError('Failed to load attendance data');
      }
    } catch (error) {
      console.error('Fetch today attendance error:', error);
      const errorMessage = (error as { response?: { data?: { message?: string } } }).response?.data?.message 
        || 'Failed to fetch attendance records';
      setFetchError(errorMessage);
      
      // Only show toast for critical errors, not network issues
      if ((error as { response?: { status?: number } }).response?.status !== undefined) {
        toast({
          variant: 'destructive',
          title: 'Error loading attendance',
          description: errorMessage,
        });
      }
    } finally {
      setFetchingAttendance(false);
    }
  };

  const filteredStudents = useMemo(() => {
    if (!searchQuery) return students;
    const query = searchQuery.toLowerCase();
    return students.filter(
      (student) =>
        student.name.toLowerCase().includes(query) ||
        student.roll_no.toLowerCase().includes(query)
    );
  }, [students, searchQuery]);

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
    // Check if quick attendance exists - block period attendance
    if (hasQuickAttendance) {
      toast({
        variant: 'destructive',
        title: 'Cannot Save',
        description: 'Quick attendance already marked for this class and date. Cannot mark period attendance.',
      });
      return;
    }

    // Validation
    if (!selectedClass) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please select a class',
      });
      return;
    }

    if (!selectedPeriod || selectedPeriod < 1 || selectedPeriod > 10) {
      toast({
        variant: 'destructive',
        title: 'Invalid Period',
        description: 'Please select a valid period (1-10)',
      });
      return;
    }

    if (!selectedSubject) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please select a subject',
      });
      return;
    }

    if (students.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No Students',
        description: 'No students found for this class',
      });
      return;
    }

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

    // Warn if overwriting existing attendance
    if (attendanceAlreadyTaken && !hasChanges) {
      toast({
        title: 'No Changes',
        description: 'No changes detected. Attendance remains as previously saved.',
        variant: 'default',
      });
      return;
    }

    try {
      setSaving(true);

      const response = await markStudentAttendance({
        attendance_date: format(selectedDate, 'yyyy-MM-dd'),
        class_id: selectedClass,
        subject_id: selectedSubject,
        period_number: selectedPeriod,
        attendance_type: 'period',
        students: attendanceData,
      });

      if (response.status) {
        const message = attendanceAlreadyTaken 
          ? `Attendance updated successfully for Period ${selectedPeriod}`
          : `Attendance saved successfully for Period ${selectedPeriod}`;

        toast({
          title: 'Success',
          description: message,
        });

        setHasChanges(false);
        setAttendanceAlreadyTaken(true);
        
        // Refresh attendance data
        await fetchTodayAttendance();
      }
    } catch (error) {
      console.error('Save attendance error:', error);
      
      const errorMessage = (error as { response?: { data?: { message?: string } } }).response?.data?.message 
        || 'Failed to save attendance. Please try again.';
      
      const errorStatus = (error as { response?: { status?: number } }).response?.status;
      
      if (errorStatus === 401) {
        toast({
          variant: 'destructive',
          title: 'Authentication Error',
          description: 'Your session has expired. Please log in again.',
        });
      } else if (errorStatus === 403) {
        toast({
          variant: 'destructive',
          title: 'Permission Denied',
          description: 'You do not have permission to mark attendance for this class.',
        });
      } else if (errorStatus === 409) {
        toast({
          variant: 'destructive',
          title: 'Cannot Save',
          description: errorMessage || 'Quick attendance already marked. Cannot mark period attendance.',
        });
      } else if (errorStatus === 422) {
        toast({
          variant: 'destructive',
          title: 'Validation Error',
          description: errorMessage || 'Invalid data provided. Please check your inputs.',
        });
      } else if (errorStatus === 500) {
        toast({
          variant: 'destructive',
          title: 'Server Error',
          description: 'An error occurred on the server. Please try again later.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: errorMessage,
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const selectedSubjectName = subjects.find(s => s.id === selectedSubject)?.subject_name || 'N/A';

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
      {/* Period Info Card */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Clock className="w-5 h-5" />
            Current Period Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Period</p>
              <p className="text-2xl font-bold text-primary">
                {selectedPeriod || 'Not Selected'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Subject</p>
              <p className="text-lg font-semibold text-foreground">
                {selectedSubjectName}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Timing</p>
              <Badge variant="outline" className="mt-1">
                {/* TODO: Get actual timing from timetable */}
                09:00 AM - 10:00 AM
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="space-y-4">
        <AttendanceFilter
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          selectedClass={selectedClass}
          onClassChange={setSelectedClass}
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
          selectedSubject={selectedSubject}
          onSubjectChange={setSelectedSubject}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          classes={classes}
          subjects={subjects}
          showPeriodSelector={true}
          showSubjectSelector={true}
        />
        {fetchError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Attendance</AlertTitle>
            <AlertDescription>{fetchError}</AlertDescription>
          </Alert>
        )}
        
        {fetchingAttendance && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading attendance records...</span>
          </div>
        )}

        {hasQuickAttendance && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Quick Attendance Already Marked</AlertTitle>
            <AlertDescription>
              Quick attendance has already been marked for this class and date. 
              Period attendance cannot be marked when quick attendance exists.
            </AlertDescription>
          </Alert>
        )}

        {attendanceAlreadyTaken && !fetchingAttendance && attendanceStats && !hasQuickAttendance && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-700" />
            <AlertTitle className="text-green-800">Attendance Already Taken</AlertTitle>
            <AlertDescription className="text-green-700">
              <div className="mt-2 space-y-1">
                <p>This period's attendance has already been marked. You can update it if needed.</p>
                <div className="flex gap-4 text-sm mt-2">
                  <span>Present: <strong>{attendanceStats.present}</strong></span>
                  <span>Absent: <strong>{attendanceStats.absent}</strong></span>
                  <span>Late: <strong>{attendanceStats.late}</strong></span>
                  <span>Total Marked: <strong>{attendanceStats.marked}</strong></span>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}
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
              disabled={saving || hasQuickAttendance}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 text-center">
            <p className="text-lg font-medium text-muted-foreground">
              {searchQuery ? 'No students found' : 'No students in this class'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PeriodWise;


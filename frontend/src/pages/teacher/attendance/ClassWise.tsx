import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { AttendanceCard } from '@/components/attendance/AttendanceCard';
import { BulkActionBar } from '@/components/attendance/BulkActionBar';
import { AttendanceFilter } from '@/components/attendance/AttendanceFilter';
import {
  markStudentAttendance,
  getSchoolClasses,
  getClassStudents,
  getTodayAttendanceByClass,
} from '@/services/attendanceService';
import { Loader2 } from 'lucide-react';
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

const ClassWise: React.FC = () => {
  const { toast } = useToast();
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedClass, setSelectedClass] = useState<number>();
  const [searchQuery, setSearchQuery] = useState('');
  const [attendanceStatus, setAttendanceStatus] = useState<AttendanceStatus>({});
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Array<{ id: number; class: string; section: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [attendanceAlreadyTaken, setAttendanceAlreadyTaken] = useState(false);

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
    const schoolId = Number(localStorage.getItem('school_id'));
    if (!schoolId) return;
    
    try {
      setLoading(true);
      const response = await getSchoolClasses(schoolId);
      
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
    const schoolId = Number(localStorage.getItem('school_id'));
    if (!schoolId || !selectedClass) return;
    
    const selectedClassData = classes.find(c => c.id === selectedClass);
    if (!selectedClassData) return;
    
    try {
      setLoading(true);
      const response = await getClassStudents(schoolId, {
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
    const schoolId = Number(localStorage.getItem('school_id'));
    if (!schoolId || !selectedClass) return;
    
    try {
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      const response = await getTodayAttendanceByClass(dateString);
      
      if (response.status && response.data) {
        const attendanceByClass = response.data.attendance_by_class || [];
        const classAttendance = attendanceByClass.find(
          (item: { class_id: number }) => item.class_id === selectedClass
        );
        
        if (classAttendance && classAttendance.attendance_taken) {
          // Pre-populate attendance status from existing records
          const existingStatus: AttendanceStatus = { ...attendanceStatus };
          classAttendance.records.forEach((record: {
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
      }
    } catch (error) {
      console.error('Fetch today attendance error:', error);
      // Don't show toast for this, it's not critical
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
    try {
      setSaving(true);

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

      await markStudentAttendance({
        attendance_date: format(selectedDate, 'yyyy-MM-dd'),
        class_id: selectedClass,
        attendance_type: 'class',
        students: attendanceData,
      });

      toast({
        title: 'Success',
        description: 'Class attendance saved successfully',
      });

      setHasChanges(false);
    } catch (error) {
      console.error('Save attendance error:', error);
    } finally {
      setSaving(false);
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
        {attendanceAlreadyTaken && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
              ✓ Attendance already taken for this date
            </Badge>
          </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredStudents.map((student) => (
            <AttendanceCard
              key={student.id}
              student={student}
              status={attendanceStatus[student.id]}
              onChange={(status) => handleAttendanceChange(student.id, status)}
              disabled={saving}
              showDetails={false}
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

export default ClassWise;


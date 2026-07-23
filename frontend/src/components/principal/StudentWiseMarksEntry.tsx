import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, BookOpen, Calendar, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  getExamClassStudents,
  getStudentSchedules,
  bulkEnterStudentWiseMarks,
  getExamSchedules,
  type Exam,
} from '@/services/examApiService';
import { formatDate, formatTime12Hour } from '@/lib/utils';

interface StudentWiseMarksEntryProps {
  exams: Exam[];
  schoolId: number;
  onSuccess?: () => void;
}

interface MarkEntry {
  exam_schedule_id: number;
  marks_obtained: string;
  remarks: string;
  status: 'submitted' | 'absent';
}

export const StudentWiseMarksEntry: React.FC<StudentWiseMarksEntryProps> = ({
  exams,
  schoolId,
  onSuccess,
}) => {
  const { toast } = useToast();
  const [selectedExamId, setSelectedExamId] = useState<number | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [classes, setClasses] = useState<Array<{ id: number; class_name: string; class?: string; section?: string }>>([]);
  const [students, setStudents] = useState<Array<{ id: number; candidate_name: string; roll_no: string; student_id: number }>>([]);
  const [schedules, setSchedules] = useState<Array<{ id: number; subject_name: string; exam_date: string; start_time: string; end_time: string; total_marks: number; existing_mark?: { marks_obtained: number; remarks: string; status: string } }>>([]);
  const [studentDetails, setStudentDetails] = useState<{ id: number; candidate_name: string; roll_no: string; student_id: number; class?: string; section?: string } | null>(null);
  const [marks, setMarks] = useState<Record<number, MarkEntry>>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Helper function to format class name
  const formatClassName = (classNum: string, section: string) => {
    return section ? `Class ${classNum}-${section}` : `Class ${classNum}`;
  };

  const fetchClasses = async () => {
    if (!selectedExamId) return;
    
    setLoading(true);
    try {
      // Get exam schedules to extract unique classes
      const schedulesResult = await getExamSchedules(selectedExamId);
      if (schedulesResult.status && schedulesResult.data) {
        // Extract unique classes from schedules
        const uniqueClasses = new Map<number, { id: number; class_name: string; class?: string; section?: string }>();
        schedulesResult.data.forEach((schedule: { class_id: number; school_class?: { class?: string; section?: string } }) => {
          if (schedule.school_class && schedule.class_id) {
            const classNum = schedule.school_class.class || '';
            const section = schedule.school_class.section || '';
            uniqueClasses.set(schedule.class_id, {
              id: schedule.class_id,
              class_name: formatClassName(classNum, section),
              class: classNum,
              section: section,
            });
          }
        });
        
        setClasses(Array.from(uniqueClasses.values()));
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
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
    if (!selectedExamId || !selectedClassId) return;

    setLoading(true);
    try {
      const result = await getExamClassStudents(selectedExamId, selectedClassId);
      if (result.status && result.data) {
        setStudents(result.data);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch students',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedules = async () => {
    if (!selectedExamId || !selectedClassId || !selectedStudentId) return;

    setLoading(true);
    try {
      const result = await getStudentSchedules(selectedExamId, selectedClassId, selectedStudentId);
      if (result.status && result.data) {
        setStudentDetails(result.data.student);
        setSchedules(result.data.schedules);

        // Initialize marks with existing data
        const initialMarks: Record<number, MarkEntry> = {};
        result.data.schedules.forEach((schedule: { id: number; existing_mark?: { marks_obtained: number; remarks: string; status: 'submitted' | 'absent' } }) => {
          initialMarks[schedule.id] = {
            exam_schedule_id: schedule.id,
            marks_obtained: schedule.existing_mark?.marks_obtained?.toString() || '',
            remarks: schedule.existing_mark?.remarks || '',
            status: schedule.existing_mark?.status || 'submitted',
          };
        });
        setMarks(initialMarks);
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch exam schedules',
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch classes when exam is selected
  useEffect(() => {
    if (selectedExamId && schoolId) {
      fetchClasses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedExamId, schoolId]);

  // Fetch students when class is selected
  useEffect(() => {
    if (selectedExamId && selectedClassId) {
      fetchStudents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedExamId, selectedClassId]);

  // Fetch schedules when student is selected
  useEffect(() => {
    if (selectedExamId && selectedClassId && selectedStudentId) {
      fetchSchedules();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedExamId, selectedClassId, selectedStudentId]);


  const updateMark = (scheduleId: number, field: keyof MarkEntry, value: string) => {
    setMarks((prev) => ({
      ...prev,
      [scheduleId]: {
        ...prev[scheduleId],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async () => {
    if (!selectedStudentId || !studentDetails) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select a student',
      });
      return;
    }

    setSubmitting(true);
    try {
      const marksArray = Object.values(marks).map((mark) => ({
        exam_schedule_id: mark.exam_schedule_id,
        marks_obtained: mark.marks_obtained ? parseFloat(mark.marks_obtained) : null,
        remarks: mark.remarks || null,
        status: mark.status,
      }));

      const result = await bulkEnterStudentWiseMarks(
        studentDetails.student_id,
        studentDetails.id,
        marksArray
      );

      if (result.status) {
        toast({
          title: 'Success',
          description: 'Marks entered successfully for student!',
        });
        // Reset selection
        setSelectedStudentId(null);
        setSchedules([]);
        setMarks({});
        onSuccess?.();
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.message || 'Failed to enter marks',
        });
      }
    } catch (error) {
      console.error('Error submitting marks:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to submit marks',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Student-wise Marks Entry</CardTitle>
          <CardDescription>Select a student and enter marks for all their subjects at once</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Exam Selection */}
          <div>
            <Label htmlFor="exam-select">Select Exam *</Label>
            <select
              id="exam-select"
              aria-label="Select exam"
              className="w-full px-4 py-2 border rounded-md"
              value={selectedExamId || ''}
              onChange={(e) => {
                setSelectedExamId(e.target.value ? Number(e.target.value) : null);
                setSelectedClassId(null);
                setSelectedStudentId(null);
                setStudents([]);
                setSchedules([]);
              }}
            >
              <option value="">Choose an exam...</option>
              {exams.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.exam_name} - {new Date(exam.start_date).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>

          {/* Class Selection */}
          {selectedExamId && (
            <div>
              <Label htmlFor="class-select">Select Class *</Label>
              {loading && classes.length === 0 ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : classes.length === 0 ? (
                <p className="text-sm text-gray-500 py-2">No classes found for this exam. Please create exam schedules first.</p>
              ) : (
                <select
                  id="class-select"
                  aria-label="Select class"
                  className="w-full px-4 py-2 border rounded-md"
                  value={selectedClassId || ''}
                  onChange={(e) => {
                    setSelectedClassId(e.target.value ? Number(e.target.value) : null);
                    setSelectedStudentId(null);
                    setSchedules([]);
                  }}
                >
                  <option value="">Choose a class...</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.class_name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Student Selection */}
          {selectedClassId && (
            <div>
              <Label htmlFor="student-select">Select Student *</Label>
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <select
                  id="student-select"
                  aria-label="Select student"
                  className="w-full px-4 py-2 border rounded-md"
                  value={selectedStudentId || ''}
                  onChange={(e) => setSelectedStudentId(e.target.value ? Number(e.target.value) : null)}
                >
                  <option value="">Choose a student...</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.roll_no} - {student.candidate_name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Marks Entry Form */}
      {selectedStudentId && schedules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 flex-wrap">
              Enter Marks for {studentDetails?.candidate_name}
              {studentDetails?.section && (
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-300">
                  Section {studentDetails.section}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Roll No: {studentDetails?.roll_no} • {studentDetails?.class ? `Class ${studentDetails.class}` : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-4">
                {schedules.map((schedule) => {
                  const mark = marks[schedule.id] || {
                    exam_schedule_id: schedule.id,
                    marks_obtained: '',
                    remarks: '',
                    status: 'submitted',
                  };

                  const hasExistingMarks = schedule.existing_mark && schedule.existing_mark.marks_obtained !== null;
                  
                  return (
                    <div
                      key={schedule.id}
                      className="border rounded-lg p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-5 w-5 text-blue-600" />
                          <span className="font-semibold text-lg">{schedule.subject_name}</span>
                          {hasExistingMarks && (
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
                              ✓ Previously Entered
                            </Badge>
                          )}
                        </div>
                        <Badge variant="outline">Total: {schedule.total_marks} marks</Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(schedule.exam_date)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            {formatTime12Hour(schedule.start_time)} - {formatTime12Hour(schedule.end_time)}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <Label htmlFor={`marks-${schedule.id}`}>Marks Obtained</Label>
                          <Input
                            id={`marks-${schedule.id}`}
                            type="number"
                            value={mark.marks_obtained}
                            onChange={(e) => updateMark(schedule.id, 'marks_obtained', e.target.value)}
                            placeholder="0"
                            max={schedule.total_marks}
                            min={0}
                            step="0.01"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`status-${schedule.id}`}>Status</Label>
                          <Badge
                            variant={mark.status === 'submitted' ? 'default' : 'destructive'}
                            className="cursor-pointer w-full justify-center py-2"
                            onClick={() =>
                              updateMark(
                                schedule.id,
                                'status',
                                mark.status === 'submitted' ? 'absent' : 'submitted'
                              )
                            }
                          >
                            {mark.status}
                          </Badge>
                        </div>
                        <div>
                          <Label htmlFor={`remarks-${schedule.id}`}>Remarks</Label>
                          <Input
                            id={`remarks-${schedule.id}`}
                            type="text"
                            value={mark.remarks}
                            onChange={(e) => updateMark(schedule.id, 'remarks', e.target.value)}
                            placeholder="Optional remarks"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedStudentId(null);
                      setSchedules([]);
                    }}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save All Marks'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {selectedStudentId && schedules.length === 0 && !loading && (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <p>No exam schedules found for this student.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};


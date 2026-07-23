import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { getScheduleStudents, bulkEnterMarksForSchedule, getScheduleMarks } from '@/services/examApiService';

interface Student {
  id: number;
  candidate_name: string;
  roll_no: string;
  class: string;
  section: string;
  student_id: number;
}

interface MarkEntry {
  student_id: number;
  student_details_id: number;
  marks_obtained: string;
  remarks: string;
  status: 'submitted' | 'absent';
}

interface MarksEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scheduleId: number;
  scheduleName: string;
  totalMarks: number;
  className?: string;
  classNumber?: string;
  section?: string;
  totalStudents?: number;
}

export const MarksEntryDialog: React.FC<MarksEntryDialogProps> = ({
  open,
  onOpenChange,
  scheduleId,
  scheduleName,
  totalMarks,
  className,
  classNumber,
  section,
  totalStudents,
}) => {
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [marks, setMarks] = useState<Record<number, MarkEntry>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && scheduleId) {
      fetchStudents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, scheduleId]);

  const fetchStudents = async () => {
    try {
      const [studentsResult, marksResult] = await Promise.all([
        getScheduleStudents(scheduleId),
        getScheduleMarks(scheduleId),
      ]);
      
      if (studentsResult.status && studentsResult.data) {
        setStudents(studentsResult.data);
        
        // Create a map of existing marks by student_details_id
        const existingMarksMap: Record<number, { marks_obtained?: number; remarks?: string; status?: string }> = {};
        if (marksResult.status && marksResult.data) {
          marksResult.data.forEach((mark: { student_details_id: number; marks_obtained?: number; remarks?: string; status?: string }) => {
            existingMarksMap[mark.student_details_id] = mark;
          });
        }
        
        // Initialize marks object with existing data or empty
        const initialMarks: Record<number, MarkEntry> = {};
        studentsResult.data.forEach((student: { id: number; student_id: number }) => {
          const existingMark = existingMarksMap[student.id];
          initialMarks[student.id] = {
            student_id: student.student_id,
            student_details_id: student.id,
            marks_obtained: existingMark?.marks_obtained?.toString() || '',
            remarks: existingMark?.remarks || '',
            status: (existingMark?.status as 'submitted' | 'absent') || 'submitted',
          };
        });
        setMarks(initialMarks);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const updateMark = (studentId: number, field: keyof MarkEntry, value: string) => {
    setMarks((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Convert marks object to array
      const marksArray = Object.values(marks).map((mark) => ({
        student_id: mark.student_id,
        student_details_id: mark.student_details_id,
        marks_obtained: mark.marks_obtained ? parseFloat(mark.marks_obtained) : null,
        remarks: mark.remarks || null,
        status: mark.status,
      }));

      const result = await bulkEnterMarksForSchedule(scheduleId, marksArray);

      if (result.status) {
        toast({
          title: 'Success',
          description: 'Marks entered successfully!',
        });
        onOpenChange(false);
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.message || 'Failed to enter marks',
        });
      }
    } catch (error) {
      console.error('Error entering marks:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to enter marks',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 flex-wrap">
            Enter Marks - {scheduleName}
            {classNumber && (
              <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-300">
                Class {classNumber}
              </Badge>
            )}
            {section && (
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-300">
                Section {section}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2 flex-wrap">
            <span>Total Marks: {totalMarks}</span>
            {totalStudents !== undefined && totalStudents > 0 && (
              <>
                <span>•</span>
                <Badge variant="outline" className="text-xs">
                  {students.length} / {totalStudents} students
                </Badge>
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-6 gap-2 font-semibold text-sm border-b pb-2">
            <div>Roll No</div>
            <div>Name</div>
            <div>Marks Obtained</div>
            <div>Status</div>
            <div>Remarks</div>
            <div></div>
          </div>

          {students.map((student) => {
            const mark = marks[student.id] || {
              student_id: student.student_id,
              student_details_id: student.id,
              marks_obtained: '',
              remarks: '',
              status: 'submitted',
            };
            
            const hasExistingMarks = mark.marks_obtained !== '';

            return (
              <div key={student.id} className="grid grid-cols-6 gap-2 items-center">
                <div className="text-sm">{student.roll_no}</div>
                <div className="text-sm flex items-center gap-2">
                  {student.candidate_name}
                  {hasExistingMarks && (
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
                      ✓ Entered
                    </Badge>
                  )}
                </div>
                <Input
                  type="number"
                  value={mark.marks_obtained}
                  onChange={(e) => updateMark(student.id, 'marks_obtained', e.target.value)}
                  placeholder="0"
                  max={totalMarks}
                  min={0}
                  step="0.01"
                />
                <div className="flex gap-2">
                  <Badge
                    variant={mark.status === 'submitted' ? 'default' : 'destructive'}
                    className="cursor-pointer"
                    onClick={() =>
                      updateMark(
                        student.id,
                        'status',
                        mark.status === 'submitted' ? 'absent' : 'submitted'
                      )
                    }
                  >
                    {mark.status}
                  </Badge>
                </div>
                <Input
                  type="text"
                  value={mark.remarks}
                  onChange={(e) => updateMark(student.id, 'remarks', e.target.value)}
                  placeholder="Remarks"
                  className="text-sm"
                />
                <div></div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : 'Save Marks'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};


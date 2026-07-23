import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getSubjects, getClasses, bulkCreateSchedules, bulkUpdateSchedules, updateExamSchedule, deleteExamSchedule } from '@/services/examApiService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X, Edit } from 'lucide-react';
import { formatTime12Hour } from '@/lib/utils';

interface Subject {
  id: number;
  subject_name: string;
  subject_code: string;
}

interface Class {
  id: number;
  class: string;
  section: string;
  class_name?: string;
}

interface ScheduleRow {
  id?: number | string;
  class_id: number;
  subject_id: number;
  exam_date: string;
  start_time: string;
  end_time: string;
  total_marks: string;
  passing_marks: string;
  room_number: string;
  instructions: string;
}

interface ExamScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (schedules: ScheduleRow[]) => void;
  examId: number;
  schoolId: number;
  existingSchedules?: ScheduleRow[];
  mode?: 'create' | 'edit';
}

export const ExamScheduleDialog: React.FC<ExamScheduleDialogProps> = ({
  open,
  onOpenChange,
  onSave,
  examId,
  schoolId,
  existingSchedules = [],
  mode = 'create',
}) => {
  const { toast } = useToast();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [schedules, setSchedules] = useState<ScheduleRow[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSubjects = useCallback(async () => {
    const result = await getSubjects(schoolId);
    if (result.status && result.data) {
      setSubjects(result.data);
    }
  }, [schoolId]);

  const fetchClasses = useCallback(async () => {
    const result = await getClasses(schoolId);
    if (result.status && result.data) {
      setClasses(result.data);
    }
  }, [schoolId]);

  useEffect(() => {
    if (open && schoolId) {
      fetchSubjects();
      fetchClasses();
      
      // Initialize schedules based on mode
      if (mode === 'edit' && existingSchedules.length > 0) {
        setSchedules(existingSchedules.map(schedule => ({
          id: schedule.id,
          class_id: schedule.class_id || 0,
          subject_id: schedule.subject_id || 0,
          exam_date: schedule.exam_date || '',
          start_time: schedule.start_time || '',
          end_time: schedule.end_time || '',
          total_marks: schedule.total_marks?.toString() || '100',
          passing_marks: schedule.passing_marks?.toString() || '40',
          room_number: schedule.room_number || '',
          instructions: schedule.instructions || '',
        })));
      } else if (mode === 'create') {
        setSchedules([
          {
            id: '1',
            class_id: 0,
            subject_id: 0,
            exam_date: '',
            start_time: '',
            end_time: '',
            total_marks: '100',
            passing_marks: '40',
            room_number: '',
            instructions: '',
          },
        ]);
      }
    }
  }, [open, schoolId, mode, existingSchedules, fetchSubjects, fetchClasses]);

  const addScheduleRow = () => {
    setSchedules([
      ...schedules,
      {
        id: Date.now().toString(),
        class_id: 0,
        subject_id: 0,
        exam_date: '',
        start_time: '',
        end_time: '',
        total_marks: '100',
        passing_marks: '40',
        room_number: '',
        instructions: '',
      },
    ]);
  };

  const removeScheduleRow = (id: string | number) => {
    setSchedules(schedules.filter((s) => s.id !== id));
  };

  const updateSchedule = (id: string | number, field: keyof ScheduleRow, value: string | number) => {
    setSchedules(
      schedules.map((schedule) => (schedule.id === id ? { ...schedule, [field]: value } : schedule))
    );
  };

  const handleSubmit = async () => {
    // Validate all schedules
    const invalidSchedules = schedules.filter(
      (s) => !s.class_id || !s.subject_id || !s.exam_date || !s.start_time || !s.end_time
    );

    if (invalidSchedules.length > 0) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please fill in all required fields for all schedules.',
      });
      return;
    }

    setLoading(true);
    try {
      // Transform schedules for API (both create and update use same format)
      const schedulesToSubmit = schedules.map((schedule) => ({
        id: typeof schedule.id === 'number' ? schedule.id : null, // Include ID for updates, null for new
        school_id: schoolId,
        class_id: schedule.class_id,
        subject_id: schedule.subject_id,
        exam_date: schedule.exam_date,
        start_time: schedule.start_time,
        end_time: schedule.end_time,
        total_marks: parseInt(schedule.total_marks),
        passing_marks: parseInt(schedule.passing_marks),
        room_number: schedule.room_number || null,
        instructions: schedule.instructions || null,
      }));

      if (mode === 'edit') {
        // Use bulk update for edit mode (handles create, update, delete)
        const result = await bulkUpdateSchedules(examId, schedulesToSubmit);

        if (result.status) {
          const summary = result.summary;
          let message = 'Exam schedules updated successfully!';
          if (summary) {
            const parts = [];
            if (summary.created > 0) parts.push(`${summary.created} created`);
            if (summary.updated > 0) parts.push(`${summary.updated} updated`);
            if (summary.deleted > 0) parts.push(`${summary.deleted} deleted`);
            if (parts.length > 0) {
              message += ` (${parts.join(', ')})`;
            }
          }
          
          toast({
            title: 'Success',
            description: message,
          });
        } else {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: result.message || 'Failed to update schedules',
          });
          setLoading(false);
          return;
        }
      } else {
        // Create new schedules (remove null IDs for create mode)
        const schedulesToCreate = schedulesToSubmit.map(s => {
          const { id, ...rest } = s;
          return rest;
        });
        
        const result = await bulkCreateSchedules(examId, schedulesToCreate);

        if (result.status) {
          toast({
            title: 'Success',
            description: 'Exam schedules created successfully!',
          });
        } else {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: result.message || 'Failed to create schedules',
          });
          setLoading(false);
          return;
        }
      }
      
      onOpenChange(false);
      onSave(schedules);
    } catch (error) {
      console.error(`Error ${mode === 'edit' ? 'updating' : 'creating'} schedules:`, error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to ${mode === 'edit' ? 'update' : 'create'} exam schedules`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? 'Edit Exam Schedules' : 'Add Exam Schedules'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'edit' 
              ? 'Edit the exam schedules below. Changes will be saved when you click Update.'
              : 'Add subjects and classes for this exam. Each row represents one exam schedule.'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {schedules.map((schedule, index) => (
            <div key={schedule.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Schedule {index + 1}</h4>
                {schedules.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeScheduleRow(schedule.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Class *</Label>
                  <Select
                    value={schedule.class_id.toString()}
                    onValueChange={(value) => updateSchedule(schedule.id, 'class_id', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id.toString()}>
                          {cls.class_name || `${cls.class} - ${cls.section}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Subject *</Label>
                  <Select
                    value={schedule.subject_id.toString()}
                    onValueChange={(value) => updateSchedule(schedule.id, 'subject_id', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id.toString()}>
                          {subject.subject_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Exam Date *</Label>
                  <Input
                    type="date"
                    value={schedule.exam_date}
                    onChange={(e) => updateSchedule(schedule.id, 'exam_date', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Start Time *</Label>
                  <Input
                    type="time"
                    value={schedule.start_time}
                    onChange={(e) => updateSchedule(schedule.id, 'start_time', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>End Time *</Label>
                  <Input
                    type="time"
                    value={schedule.end_time}
                    onChange={(e) => updateSchedule(schedule.id, 'end_time', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Total Marks *</Label>
                  <Input
                    type="number"
                    value={schedule.total_marks}
                    onChange={(e) => updateSchedule(schedule.id, 'total_marks', e.target.value)}
                    placeholder="100"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Passing Marks *</Label>
                  <Input
                    type="number"
                    value={schedule.passing_marks}
                    onChange={(e) => updateSchedule(schedule.id, 'passing_marks', e.target.value)}
                    placeholder="40"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Room Number</Label>
                  <Input
                    value={schedule.room_number}
                    onChange={(e) => updateSchedule(schedule.id, 'room_number', e.target.value)}
                    placeholder="Room 101"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Instructions</Label>
                  <Input
                    value={schedule.instructions}
                    onChange={(e) => updateSchedule(schedule.id, 'instructions', e.target.value)}
                    placeholder="Special instructions"
                  />
                </div>
              </div>
            </div>
          ))}

          <Button type="button" variant="outline" onClick={addScheduleRow} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Another Schedule
          </Button>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={loading}>
            {loading 
              ? (mode === 'edit' ? 'Updating...' : 'Creating...') 
              : (mode === 'edit' ? 'Update Schedules' : 'Create Schedules')
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


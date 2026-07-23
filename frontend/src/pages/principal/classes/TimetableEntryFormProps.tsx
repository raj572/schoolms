import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '../../../components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../components/ui/form';
import { Input } from '../../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { useAuthStore } from '../../../store/useAuthStore';
import { useSubjectStore } from '../../../store/useSubjectStore';
import { TimetableEntry, TimetableEntryPayload } from '../../../store/useTimetableStore';
import { useUsersStore } from '../../../store/useUsersStore';

// Schema validation
const formSchema = z.object({
  day_of_week: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
  start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  end_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  teacher_id: z.string().min(1, "Teacher is required"),
  subject_id: z.string().min(1, "Subject is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface TimetableEntryFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: TimetableEntryPayload) => Promise<boolean>;
  initialData?: TimetableEntry;
  classId: number;
  schoolId: number;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const TimetableEntryForm: React.FC<TimetableEntryFormProps> = ({
  isOpen,
  onOpenChange,
  onSubmit,
  initialData,
  classId,
  schoolId,
}) => {
  const { subjects, getSubjects } = useSubjectStore();
  const { teachers, fetchTeachers } = useUsersStore();
  const { user } = useAuthStore();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      day_of_week: initialData?.day_of_week || 'Monday',
      start_time: initialData?.start_time.substring(0, 5) || '', // Assuming HH:MM:SS format
      end_time: initialData?.end_time.substring(0, 5) || '', // Assuming HH:MM:SS format
      teacher_id: initialData?.teacher_id.toString() || '',
      subject_id: initialData?.subject_id.toString() || '',
    },
  });

  // Fetch subjects and teachers when dialog opens or classId/schoolId changes
  useEffect(() => {
    if (isOpen && schoolId && classId) {
      getSubjects(schoolId, classId);
    }
    if (isOpen && schoolId) {
      fetchTeachers(schoolId);
    }
  }, [isOpen, schoolId, classId, getSubjects, fetchTeachers]);

  // Reset form when initialData changes (e.g., switching from create to edit)
  useEffect(() => {
    if (initialData) {
      form.reset({
        day_of_week: initialData.day_of_week,
        start_time: initialData.start_time.substring(0, 5),
        end_time: initialData.end_time.substring(0, 5),
        teacher_id: initialData.teacher_id.toString(),
        subject_id: initialData.subject_id.toString(),
      });
    } else {
      form.reset({
        day_of_week: 'Monday',
        start_time: '',
        end_time: '',
        teacher_id: '',
        subject_id: '',
      });
    }
  }, [initialData, form]);

  const handleSubmit = async (values: FormValues) => {
    if (!user?.school_id) return;

    const payload: TimetableEntryPayload = {
      ...values,
      teacher_id: parseInt(values.teacher_id, 10),
      subject_id: parseInt(values.subject_id, 10),
      school_id: user.school_id,
      class_id: classId,
    };

    const success = await onSubmit(payload);
    if (success) {
      onOpenChange(false);
      form.reset();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Period' : 'Add New Period'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="day_of_week"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Day of Week</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a day" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {DAYS_OF_WEEK.map((day) => (
                        <SelectItem key={day} value={day}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="end_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="subject_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id.toString()}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="teacher_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teacher</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a teacher" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id.toString()}>
                          {teacher.user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving...' : 'Save Period'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};


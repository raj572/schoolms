import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/useAuthStore';
import {ClassForm, useClassStore } from '@/store/useClassStore';
import { TeacherForm, useUsersStore } from '@/store/useUsersStore';
import Heading from '@/components/common/Heading';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';

// Type that allows empty string for controlled input
export type ClassFormState = Omit<ClassForm, 'capacity'> & { capacity?: number | '' };

const ClassList = () => {
  const { authUser } = useAuthStore();
  const { toast } = useToast();
  const { createClass, getClasses, deleteClass, updateClass } = useClassStore();
  const { getAllTeachers } = useUsersStore();

  const [classes, setClasses] = useState<ClassForm[]>([]);
  const [teachers, setTeachers] = useState<TeacherForm[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [loadingTeachers, setLoadingTeachers] = useState(false);

  //  Form state that supports both empty string and number
  const [formData, setFormData] = useState<ClassFormState>({
    school_id: authUser.school_id,
    class: '',
    section: '',
    capacity: '',
    teacher_in_charge: '',
    room_no: '',
    status: 'active',
    notes: '',
  });

  // Fetch classes from backend
  const fetchClasses = async () => {
    const schoolId = authUser.school_id;
    if (!schoolId) return;
    const data = await getClasses(schoolId);
    if (data) setClasses(data);
  };

  // Fetch teachers from backend
  const fetchTeachers = async () => {
    const schoolId = authUser.school_id;
    if (!schoolId) return;
    
    setLoadingTeachers(true);
    try {
      const data = await getAllTeachers(schoolId);
      if (data) {
        setTeachers(data);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
      toast({
        title: 'Error',
        description: 'Failed to load teachers',
        variant: 'destructive',
      });
    } finally {
      setLoadingTeachers(false);
    }
  };

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
  }, []);

  // Create or update class
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.class || !formData.teacher_in_charge) return;

    const payload: ClassForm = {
      ...formData,
      capacity: formData.capacity === '' ? 0 : Number(formData.capacity),
    };

        if (editingIndex !== null) {
      const classId = (classes[editingIndex] as ClassForm & { id: string }).id;

      const success = await updateClass(classId, payload);
      if (!success) return;

      // Update local state while preserving id
      const updated = [...classes];
      updated[editingIndex] = { ...payload, id: classId }; 
      setClasses(updated);

    } else {
      const success = await createClass(payload);
      if (success) {
        fetchClasses();
      }
    }


    // Reset form
    setFormData({
      school_id: authUser.school_id,
      class: '',
      section: '',
      capacity: '',
      teacher_in_charge: '',
      room_no: '',
      status: 'active',
      notes: '',
    });
    setEditingIndex(null);
    setOpen(false);
  };

  const handleEdit = (iclassId: string , index: number) => {
    const cls = classes[index];
    setFormData({
      ...cls,
      school_id: authUser.school_id,
      capacity: cls.capacity ?? '',
    });
    setEditingIndex(index);
    setOpen(true);
  };

  const handleDelete = async (classId: string , index: number) => {
    const success = await deleteClass(classId); 
    
  if (success) {
    setClasses((prev) => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
  }
  };

  return (
    <div className="space-y-4 md:space-y-6 mx-auto max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 md:gap-0 md:justify-between md:items-center mb-8 ">
        <Heading title="Classes Management" description="Manage classes, sections, and capacity" />
        

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className='w-fit'>
              <Plus className="h-4 w-4" /> New Class
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-lg text-center">
                {editingIndex !== null ? 'Edit Class' : 'New Class'}
              </DialogTitle>
            </DialogHeader>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 ">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="class">Class</Label>
                  <Input
                    id="class"
                    value={formData.class || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, class: e.target.value }))}
                    placeholder="e.g., 10"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="section">Section</Label>
                  <Input
                    id="section"
                    value={formData.section || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, section: e.target.value }))}
                    placeholder="e.g., A"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        capacity: value === '' ? '' : parseInt(value, 10),
                      }));
                    }}
                    placeholder="Maximum students"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="room_no">Room Number</Label>
                  <Input
                    id="room_no"
                    value={formData.room_no || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, room_no: e.target.value }))}
                    placeholder="e.g., R-101"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="teacher_in_charge">Teacher In Charge</Label>
                <Select
                  value={formData.teacher_in_charge || ''}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, teacher_in_charge: value }))
                  }
                  disabled={loadingTeachers}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={loadingTeachers ? "Loading teachers..." : "Select a teacher"} />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.length === 0 ? (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        No teachers available
                      </div>
                    ) : (
                      teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.name || ''}>
                          {teacher.name}
                          {teacher.employee_code && (
                            <span className="text-muted-foreground ml-2">
                              ({teacher.employee_code})
                            </span>
                          )}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {teachers.length === 0 && !loadingTeachers && 
                    'Please register teachers first to assign them to classes'
                  }
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                value={formData.status || "active"}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: value as "active" | "inactive",
                  }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                    id="notes"
                    value={formData.notes || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, notes: e.target.value }))
                    }
                    placeholder="Optional remarks about the class"
                    className="w-full"
                  />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">{editingIndex !== null ? 'Update' : 'Create'} Class</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Class Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((cls, index) => {
          const classWithId = cls as ClassForm & { id: string };
          return (
          
          <Card key={classWithId.id} className=" border">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">
                    Class {cls.class} {cls.section && `- ${cls.section}`}
                  </CardTitle>
                  <CardDescription>Room: {cls.room_no || 'N/A'}</CardDescription>
                </div>
                <Badge variant={cls.status === 'active' ? 'default' : 'secondary'}>
                  {cls.status?.charAt(0).toUpperCase() + cls.status?.slice(1)}
                </Badge>
              </div>
            </CardHeader>

           <CardContent>
                <div className="space-y-3">
                  <div className='flex items-center justify-between mb-6'>
                    <div className="flex items-center space-x-2">
                    <span className="text-sm"> <span className='font-semibold'>Teachers:</span> {cls.teacher_in_charge || 'N/A'}</span>
                  </div>

                  {/* Display capacity */}
                  <div className="text-sm">{cls.capacity || 0} seats</div>
                  </div>

                  {/* Display notes */}
                  <div className="text-sm text-slate-600 dark:text-slate-400 pt-2 border-t border-dashed border-border italic">
                    "
                    {cls.notes && cls.notes.trim() !== ""
                      ? cls.notes
                      : "No notes yet"}
                    "
                  </div>


                  <div className="flex items-center justify-end space-x-1 pt-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(classWithId.id, index)}>
                      <Edit className="h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(classWithId.id, index)}>
                      <Trash2 className="h-4 text-destructive/60" />
                    </Button>
                  </div>
                </div>
              </CardContent>
          </Card>
)})}
      </div>
    </div>
  );
};

export default ClassList;

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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/useAuthStore';
import { SubjectForm, useSubjectStore } from '@/store/useSubjectStore';
import Heading from '@/components/common/Heading';
import { Textarea } from '@/components/ui/textarea';
import SubjectDescription from '@/components/common/SubjectDescription';

const SubjectList = () => {
  const { authUser } = useAuthStore();
  const { toast } = useToast();
  const { createSubject, getSubjects, deleteSubject, updateSubject } = useSubjectStore();

  const [subjects, setSubjects] = useState<SubjectForm[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState<SubjectForm>({
    school_id: Number(authUser.school_id),
    subject_name: '',
    description: '',
  });

  // Fetch subjects from backend
  const fetchSubjects = async () => {
    const schoolId = Number(authUser.school_id);
    if (!schoolId) return;
    const data = await getSubjects(schoolId);
    if (data) setSubjects(data);
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  // Create or update subject
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject_name.trim()) return;

    if (editingIndex !== null) {
      const subjectId = (subjects[editingIndex] as SubjectForm & { id: string }).id;
      const success = await updateSubject(subjectId, formData);
      if (!success) return;

      const updated = [...subjects];
      updated[editingIndex] = { ...formData, id: subjectId };
      setSubjects(updated);
    } else {
      const success = await createSubject(formData);
      if (success) fetchSubjects();
    }

    // Reset form
    setFormData({
      school_id: Number(authUser.school_id),
      subject_name: '',
      description: '',
    });
    setEditingIndex(null);
    setOpen(false);
  };

  const handleEdit = (subjectId: string, index: number) => {
    const subj = subjects[index];
    setFormData({
      ...subj,
      school_id: Number(authUser.school_id),
    });
    setEditingIndex(index);
    setOpen(true);
  };

  const handleDelete = async (subjectId: string, index: number) => {
    const success = await deleteSubject(subjectId);
    if (success) {
      setSubjects((prev) => {
        const updated = [...prev];
        updated.splice(index, 1);
        return updated;
      });
    }
  };

  // 🔹 Helper function to limit text length
  const limitText = (text: string, maxLength: number) => {
    if (!text) return '';
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  };

  return (
    <div className="space-y-4 md:space-y-6 mx-auto max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 md:gap-0 md:justify-between md:items-center mb-8">
        <Heading title="Subject Management" description="Manage subjects and their descriptions" />

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className='w-fit'>
              <Plus className="h-4 w-4" /> New Subject
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-lg text-center">
                {editingIndex !== null ? 'Edit Subject' : 'New Subject'}
              </DialogTitle>
            </DialogHeader>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject_name">Subject Name</Label>
                <Input
                  id="subject_name"
                  value={formData.subject_name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, subject_name: e.target.value }))
                  }
                  placeholder="e.g., Mathematics"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Optional short description"
                  className="w-full"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingIndex !== null ? 'Update' : 'Create'} Subject
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Subject Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map((subj, index) => {
          const subjectWithId = subj as SubjectForm & { id: string };
          return (
            <Card key={subjectWithId.id} className="h-fit">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-semibold">
                      {subj.subject_name}
                    </CardTitle>
                      <SubjectDescription description={subj.description || ""} />

                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="flex justify-end space-x-1 pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(subjectWithId.id, index)}
                  >
                    <Edit className="h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(subjectWithId.id, index)}
                  >
                    <Trash2 className="h-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SubjectList;

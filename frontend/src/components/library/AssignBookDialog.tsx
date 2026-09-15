import { useState, useEffect, useCallback } from "react";
import { API_BASE_URL } from '@/lib/axios';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, BookOpen } from "lucide-react";
import { format, isBefore, startOfDay, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";

interface AssignBookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  schoolId: number;
}

interface AssignBookFormData {
  book_id: string;
  borrower_id: string;
  borrower_type: "student" | "teacher";
  issue_date: Date;
  due_date: Date;
  late_fine_per_day: string;
  issued_by: number;
}

const AssignBookDialog = ({ open, onOpenChange, onSuccess, schoolId }: AssignBookDialogProps) => {
  const authUser = useAuthStore((state) => state.authUser);
  
  // Initialize with default dates
  const getDefaultDates = () => {
    const today = new Date();
    const defaultDueDate = new Date();
    defaultDueDate.setDate(today.getDate() + 7); // Default to 7 days from today
    return { today, defaultDueDate };
  };

  const { today, defaultDueDate } = getDefaultDates();
  
  const [formData, setFormData] = useState<AssignBookFormData>({
    book_id: "",
    borrower_id: "",
    borrower_type: "student",
    issue_date: today,
    due_date: defaultDueDate,
    late_fine_per_day: "5",
    issued_by: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [books, setBooks] = useState<Array<{ id: number; title: string; author: string | null }>>([]);
  const [students, setStudents] = useState<Array<{ id: number; student_id?: number; candidate_name?: string; name?: string; first_name?: string; last_name?: string; class?: string }>>([]);
  const [teachers, setTeachers] = useState<Array<{ id: number; name?: string; employee_code?: string }>>([]);
  const [fetchingData, setFetchingData] = useState(false);

  const fetchAvailableData = useCallback(async () => {
    try {
      setFetchingData(true);
      const token = localStorage.getItem("token");

      // Fetch available books
      const booksResponse = await fetch(
        `${API_BASE_URL}/principal/library/books/available/${schoolId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const booksData = await booksResponse.json();
      if (booksData.status) {
        setBooks(booksData.data || []);
      }

      // Fetch students
      const studentsResponse = await fetch(
        `${API_BASE_URL}/principal/student/getstudents/${schoolId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const studentsData = await studentsResponse.json();
      if (studentsData.status) {
        setStudents(studentsData.data || []);
      }

      // Fetch teachers
      const teachersResponse = await fetch(
        `${API_BASE_URL}/principal/teacher/getall/${schoolId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const teachersData = await teachersResponse.json();
      if (teachersData.status) {
        setTeachers(teachersData.data || []);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setFetchingData(false);
    }
  }, [schoolId]);

  // Fetch available books when dialog opens and reset form
  useEffect(() => {
    if (open) {
      fetchAvailableData();
      // Reset form with fresh dates
      const { today: freshToday, defaultDueDate: freshDueDate } = getDefaultDates();
      setFormData({
        book_id: "",
        borrower_id: "",
        borrower_type: "student",
        issue_date: freshToday,
        due_date: freshDueDate,
        late_fine_per_day: "5",
        issued_by: 1,
      });
      setError("");
    }
  }, [open, schoolId, fetchAvailableData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/principal/library/issue`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          book_id: parseInt(formData.book_id),
          school_id: schoolId,
          borrower_id: parseInt(formData.borrower_id),
          borrower_type: formData.borrower_type,
          issue_date: formData.issue_date.toISOString().split("T")[0],
          due_date: formData.due_date.toISOString().split("T")[0],
          issued_by: authUser?.id ? parseInt(authUser.id) : formData.issued_by, // Use logged in user ID
        }),
      });

      const result = await response.json();

      if (result.status) {
        onSuccess();
        onOpenChange(false);
        // Reset form
        setFormData({
          book_id: "",
          borrower_id: "",
          borrower_type: "student",
          issue_date: new Date(),
          due_date: new Date(),
          late_fine_per_day: "5",
          issued_by: 1,
        });
      } else {
        setError(result.message || "Failed to assign book");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof AssignBookFormData, value: string | Date | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Assign Book
          </DialogTitle>
          <DialogDescription>
            Issue a book to a student or teacher for borrowing.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          {/* Book Selection */}
          <div className="space-y-2">
            <Label htmlFor="book">Select Book *</Label>
            <Select
              value={formData.book_id}
              onValueChange={(value) => handleInputChange("book_id", value)}
              required
              disabled={fetchingData}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a book" />
              </SelectTrigger>
              <SelectContent>
                {books.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">No available books</div>
                ) : (
                  books.map((book) => (
                    <SelectItem key={book.id} value={book.id.toString()}>
                      {book.title} {book.author ? `- ${book.author}` : ""}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Borrower Type */}
          <div className="space-y-2">
            <Label htmlFor="borrower_type">Borrower Type *</Label>
            <Select
              value={formData.borrower_type}
              onValueChange={(value) => {
                handleInputChange("borrower_type", value as "student" | "teacher");
                // Clear borrower_id when type changes
                handleInputChange("borrower_id", "");
              }}
              required
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="teacher">Teacher</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Borrower Selection */}
          <div className="space-y-2">
            <Label htmlFor="borrower">
              {formData.borrower_type === "student" ? "Select Student *" : "Select Teacher *"}
            </Label>
            <Select
              value={formData.borrower_id}
              onValueChange={(value) => handleInputChange("borrower_id", value)}
              required
              disabled={fetchingData}
            >
              <SelectTrigger>
                <SelectValue placeholder={`Select ${formData.borrower_type}`} />
              </SelectTrigger>
              <SelectContent>
                {formData.borrower_type === "student" ? (
                  students.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      No students available
                    </div>
                  ) : (
                    students.map((person) => (
                      <SelectItem key={person.student_id || person.id} value={(person.student_id || person.id).toString()}>
                        {person.candidate_name || person.name || `${person.first_name || ''} ${person.last_name || ''}`.trim() || 'Unknown'}
                        {person.class ? ` - Class ${person.class}` : ""}
                      </SelectItem>
                    ))
                  )
                ) : (
                  teachers.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      No teachers available
                    </div>
                  ) : (
                    teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id.toString()}>
                        {teacher.name || 'Unknown'}
                        {teacher.employee_code ? ` - ${teacher.employee_code}` : ""}
                      </SelectItem>
                    ))
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Issue Date */}
          <div className="space-y-2">
            <Label>Issue Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  type="button"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.issue_date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.issue_date ? format(formData.issue_date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.issue_date}
                  onSelect={(date) => {
                    if (date) {
                      handleInputChange("issue_date", date);
                      // Update due date if it's before the new issue date
                      if (formData.due_date && (isBefore(startOfDay(formData.due_date), startOfDay(date)) || isSameDay(startOfDay(formData.due_date), startOfDay(date)))) {
                        const newDueDate = new Date(date);
                        newDueDate.setDate(date.getDate() + 7);
                        handleInputChange("due_date", newDueDate);
                      }
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label>Due Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  type="button"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.due_date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.due_date ? format(formData.due_date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.due_date}
                  onSelect={(date) => {
                    if (date) {
                      handleInputChange("due_date", date);
                    }
                  }}
                  initialFocus
                  disabled={(date) => isBefore(startOfDay(date), startOfDay(formData.issue_date)) || isSameDay(startOfDay(date), startOfDay(formData.issue_date))}
                />
              </PopoverContent>
            </Popover>
            <p className="text-xs text-muted-foreground">
              Due date must be after issue date
            </p>
          </div>

          {/* Late Fine Per Day */}
          <div className="space-y-2">
            <Label htmlFor="late_fine">Late Fine Per Day (₹) *</Label>
            <Input
              id="late_fine"
              type="number"
              min="0"
              step="0.01"
              placeholder="5"
              value={formData.late_fine_per_day}
              onChange={(e) => handleInputChange("late_fine_per_day", e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Amount charged per day after due date
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || fetchingData}>
              {loading ? "Assigning..." : "Assign Book"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AssignBookDialog;


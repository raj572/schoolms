import { useState, useEffect } from "react";
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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, BookOpen } from "lucide-react";
import { format, isBefore, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import { extendDueDate, returnBook } from "@/services/libraryApiService";
import { useAuthStore } from "@/store/useAuthStore";

interface UpdateBookIssueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  issue: any | null;
}

interface UpdateFormData {
  new_due_date: Date;
  action: "extend" | "return";
  fine_amount: string;
  remarks: string;
}

const UpdateBookIssueDialog = ({ open, onOpenChange, onSuccess, issue }: UpdateBookIssueDialogProps) => {
  const authUser = useAuthStore((state) => state.authUser);
  const [formData, setFormData] = useState<UpdateFormData>({
    new_due_date: new Date(),
    action: "extend",
    fine_amount: "0",
    remarks: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open && issue) {
      // Initialize form with current due date
      const currentDueDate = issue.due_date ? new Date(issue.due_date) : new Date();
      setFormData({
        new_due_date: currentDueDate,
        action: "extend",
        fine_amount: "0",
        remarks: "",
      });
      setError("");
    }
  }, [open, issue]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!issue) {
      setError("No issue selected");
      return;
    }

    try {
      setLoading(true);

      if (formData.action === "extend") {
        // Calculate days to extend
        const currentDueDate = new Date(issue.due_date);
        const newDueDate = new Date(formData.new_due_date);
        const daysDifference = Math.ceil((newDueDate.getTime() - currentDueDate.getTime()) / (1000 * 60 * 60 * 24));

        if (daysDifference <= 0) {
          setError("New due date must be after current due date");
          setLoading(false);
          return;
        }

        await extendDueDate(issue.id, daysDifference);
      } else if (formData.action === "return") {
        // Return the book - backend will auto-calculate fine if not provided
        await returnBook(issue.id, {
          returned_to: authUser?.id ? parseInt(authUser.id) : 1,
          fine_amount: formData.fine_amount && parseFloat(formData.fine_amount) > 0 ? parseFloat(formData.fine_amount) : null,
          remarks: formData.remarks || null,
        });
      }

      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      console.error("Error in update book issue:", err);
      // Handle different error types
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        const errorMessages = Object.values(errors).flat().join(', ');
        setError(errorMessages);
      } else {
        setError("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof UpdateFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (!issue) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Update Book Issue
          </DialogTitle>
          <DialogDescription>
            Extend due date or return the book.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          {/* Book Info */}
          <div className="p-4 bg-gray-50 rounded-md">
            <h3 className="font-medium mb-2">Book Information</h3>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Book:</span> {issue.book?.title || "Unknown"}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Borrower:</span> {issue.borrower_name || "Unknown"}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Current Due Date:</span>{" "}
              {new Date(issue.due_date).toLocaleDateString()}
            </p>
          </div>

          {/* Action Selection */}
          <div className="space-y-2">
            <Label htmlFor="action">Action *</Label>
            <select
              id="action"
              title="Select action to perform"
              value={formData.action}
              onChange={(e) => handleInputChange("action", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="extend">Extend Due Date</option>
              <option value="return">Return Book</option>
            </select>
          </div>

          {/* New Due Date (only for extend action) */}
          {formData.action === "extend" && (
            <div className="space-y-2">
              <Label>New Due Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.new_due_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.new_due_date ? format(formData.new_due_date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.new_due_date}
                    onSelect={(date) => date && handleInputChange("new_due_date", date)}
                    initialFocus
                    disabled={(date) => {
                      if (!issue?.due_date) return false;
                      const currentDueDate = new Date(issue.due_date);
                      return isBefore(startOfDay(date), startOfDay(currentDueDate));
                    }}
                  />
                </PopoverContent>
              </Popover>
              <p className="text-xs text-muted-foreground">
                New due date must be after current due date
              </p>
            </div>
          )}

          {/* Fine Amount (only for return action) */}
          {formData.action === "return" && (
            <div className="space-y-2">
              <Label htmlFor="fine_amount">Fine Amount (₹)</Label>
              <Input
                id="fine_amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="Leave empty for auto-calculation"
                value={formData.fine_amount}
                onChange={(e) => handleInputChange("fine_amount", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to auto-calculate based on overdue days (₹5/day) or enter custom amount
              </p>
            </div>
          )}

          {/* Remarks */}
          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks</Label>
            <textarea
              id="remarks"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Optional remarks..."
              value={formData.remarks}
              onChange={(e) => handleInputChange("remarks", e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Processing..." : formData.action === "extend" ? "Extend Due Date" : "Return Book"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateBookIssueDialog;


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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus } from "lucide-react";

interface AssignStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  schoolId: number;
}

const AssignStudentDialog = ({ open, onOpenChange, onSuccess, schoolId }: AssignStudentDialogProps) => {
  const [formData, setFormData] = useState({
    student_details_id: "",
    bus_id: "",
    pickup_point: "",
    pickup_time: "",
    drop_time: "",
    monthly_fee: 0,
    start_date: "",
    remarks: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [buses, setBuses] = useState<any[]>([]);
  const [fetchingData, setFetchingData] = useState(false);

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open, schoolId]);

  const fetchData = async () => {
    try {
      setFetchingData(true);
      const token = localStorage.getItem("token");

      // Fetch students
      const studentsResponse = await fetch(
        `http://localhost:8000/api/principal/student/getstudents/${schoolId}`,
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

      // Fetch buses
      const busesResponse = await fetch(
        `http://localhost:8000/api/principal/transport/buses/all/${schoolId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const busesData = await busesResponse.json();
      if (busesData.status) {
        setBuses(busesData.data || []);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setFetchingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8000/api/principal/transport/assignments/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          school_id: schoolId,
          ...formData,
          student_details_id: parseInt(formData.student_details_id),
          bus_id: parseInt(formData.bus_id),
          monthly_fee: parseFloat(formData.monthly_fee.toString()) || 0,
        }),
      });

      const result = await response.json();

      if (result.status) {
        onSuccess();
        onOpenChange(false);
        setFormData({
          student_details_id: "",
          bus_id: "",
          pickup_point: "",
          pickup_time: "",
          drop_time: "",
          monthly_fee: 0,
          start_date: "",
          remarks: "",
        });
      } else {
        setError(result.message || "Failed to assign student");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Assign Student to Transport
          </DialogTitle>
          <DialogDescription>
            Assign a student to a school bus route.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="student_details_id">Select Student *</Label>
              <Select
                value={formData.student_details_id}
                onValueChange={(value) => handleInputChange("student_details_id", value)}
                required
                disabled={fetchingData}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {students.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">No students available</div>
                  ) : (
                    students.map((student) => (
                      <SelectItem key={student.id} value={student.id.toString()}>
                        {student.candidate_name} - Class {student.class} {student.section}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bus_id">Select Bus *</Label>
              <Select
                value={formData.bus_id}
                onValueChange={(value) => handleInputChange("bus_id", value)}
                required
                disabled={fetchingData}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select bus" />
                </SelectTrigger>
                <SelectContent>
                  {buses.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">No buses available</div>
                  ) : (
                    buses.map((bus) => (
                      <SelectItem key={bus.id} value={bus.id.toString()}>
                        {bus.bus_number} - {bus.route_name} ({bus.student_count}/{bus.capacity})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pickup_point">Pickup Point *</Label>
            <Input
              id="pickup_point"
              placeholder="e.g., City Center, Main Square"
              value={formData.pickup_point}
              onChange={(e) => handleInputChange("pickup_point", e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pickup_time">Pickup Time *</Label>
              <Input
                id="pickup_time"
                type="time"
                value={formData.pickup_time}
                onChange={(e) => handleInputChange("pickup_time", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="drop_time">Drop Time *</Label>
              <Input
                id="drop_time"
                type="time"
                value={formData.drop_time}
                onChange={(e) => handleInputChange("drop_time", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="monthly_fee">Monthly Fee (₹) *</Label>
              <Input
                id="monthly_fee"
                type="number"
                min="0"
                step="0.01"
                placeholder="2500"
                value={formData.monthly_fee}
                onChange={(e) => handleInputChange("monthly_fee", parseFloat(e.target.value) || 0)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date *</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => handleInputChange("start_date", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks</Label>
            <Input
              id="remarks"
              placeholder="Additional notes..."
              value={formData.remarks}
              onChange={(e) => handleInputChange("remarks", e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || fetchingData}>
              {loading ? "Assigning..." : "Assign Student"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AssignStudentDialog;


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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus } from "lucide-react";
import { getAvailableRooms, allocateRoom } from "@/services/hostelApiService";

interface AllocateRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  schoolId: number;
  students: any[]; // Array of students without active allocations
}

const AllocateRoomDialog = ({ open, onOpenChange, onSuccess, schoolId, students }: AllocateRoomDialogProps) => {
  const [formData, setFormData] = useState({
    student_details_id: "",
    hostel_room_id: "",
    student_id: "",
    allocation_date: new Date().toISOString().split('T')[0],
    monthly_fee: "0",
    remarks: "",
  });
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingRooms, setFetchingRooms] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      fetchAvailableRooms();
    }
  }, [open]);

  const fetchAvailableRooms = async () => {
    setFetchingRooms(true);
    try {
      const result = await getAvailableRooms(schoolId);
      if (result.status && result.data) {
        setRooms(result.data);
      }
    } catch (err) {
      console.error("Error fetching available rooms:", err);
    } finally {
      setFetchingRooms(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Find the selected student's details
    const selectedStudent = students.find(s => s.id.toString() === formData.student_details_id);
    if (!selectedStudent || !selectedStudent.student_id) {
      setError("Please select a valid student");
      setLoading(false);
      return;
    }

    try {
      const requestData = {
        school_id: schoolId,
        hostel_room_id: parseInt(formData.hostel_room_id),
        student_id: selectedStudent.student_id,
        student_details_id: parseInt(formData.student_details_id),
        allocation_date: formData.allocation_date,
        monthly_fee: parseFloat(formData.monthly_fee),
        status: "active",
        remarks: formData.remarks,
      };

      const result = await allocateRoom(requestData);

      if (result.status) {
        onSuccess();
        onOpenChange(false);
        setFormData({
          student_details_id: "",
          hostel_room_id: "",
          student_id: "",
          allocation_date: new Date().toISOString().split('T')[0],
          monthly_fee: "0",
          remarks: "",
        });
      } else {
        setError(result.message || "Failed to allocate room");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // If student is selected, pre-fill monthly fee from room
    if (field === "hostel_room_id" && value) {
      const selectedRoom = rooms.find(r => r.id.toString() === value);
      if (selectedRoom && selectedRoom.monthly_fee) {
        setFormData((prev) => ({ ...prev, monthly_fee: selectedRoom.monthly_fee.toString() }));
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Allocate Hostel Room
          </DialogTitle>
          <DialogDescription>
            Assign a student to an available hostel room
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="student">Student *</Label>
            <Select
              value={formData.student_details_id}
              onValueChange={(value) => handleInputChange("student_details_id", value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select student" />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id.toString()}>
                    {student.candidate_name} - Class {student.class} {student.section || ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="room">Available Room *</Label>
            <Select
              value={formData.hostel_room_id}
              onValueChange={(value) => handleInputChange("hostel_room_id", value)}
              required
              disabled={fetchingRooms}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select room" />
              </SelectTrigger>
              <SelectContent>
                {rooms.map((room) => {
                  const availableBeds = room.capacity - (room.occupied_beds || 0);
                  const buildingName = room.hostel_building?.building_name || "Unknown";
                  const roomLabel = `${room.room_number} (${buildingName}) - ${availableBeds} beds available`;
                  return (
                    <SelectItem key={room.id} value={room.id.toString()}>
                      {roomLabel}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="allocation_date">Allocation Date *</Label>
              <Input
                id="allocation_date"
                type="date"
                value={formData.allocation_date}
                onChange={(e) => handleInputChange("allocation_date", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthly_fee">Monthly Fee (₹) *</Label>
              <Input
                id="monthly_fee"
                type="number"
                min="0"
                step="0.01"
                placeholder="8000"
                value={formData.monthly_fee}
                onChange={(e) => handleInputChange("monthly_fee", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea
              id="remarks"
              placeholder="Optional remarks..."
              value={formData.remarks}
              onChange={(e) => handleInputChange("remarks", e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || fetchingRooms}>
              {loading ? "Allocating..." : "Allocate Room"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AllocateRoomDialog;

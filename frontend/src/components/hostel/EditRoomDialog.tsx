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
import { Bed } from "lucide-react";
import { getAllBuildings, updateRoom } from "@/services/hostelApiService";

interface EditRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  room: any;
}

const EditRoomDialog = ({ open, onOpenChange, onSuccess, room }: EditRoomDialogProps) => {
  const [formData, setFormData] = useState({
    room_number: "",
    floor: "",
    block_wing: "",
    room_type: "",
    capacity: "1",
    monthly_fee: "0",
    facilities: "",
    status: "available",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (room) {
      setFormData({
        room_number: room.room_number || "",
        floor: room.floor?.toString() || "",
        block_wing: room.block_wing || "",
        room_type: room.room_type || "",
        capacity: room.capacity?.toString() || "1",
        monthly_fee: room.monthly_fee?.toString() || "0",
        facilities: room.facilities || "",
        status: room.status || "available",
      });
    }
  }, [room]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await updateRoom(room?.id, formData);

      if (result.status) {
        onSuccess();
        onOpenChange(false);
      } else {
        setError(result.message || "Failed to update room");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bed className="h-5 w-5" />
            Edit Hostel Room
          </DialogTitle>
          <DialogDescription>
            Update the details of this hostel room
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
              <Label htmlFor="room_number">Room Number *</Label>
              <Input
                id="room_number"
                placeholder="101"
                value={formData.room_number}
                onChange={(e) => handleInputChange("room_number", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="floor">Floor</Label>
              <Input
                id="floor"
                type="number"
                placeholder="1"
                value={formData.floor}
                onChange={(e) => handleInputChange("floor", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="block_wing">Block/Wing</Label>
              <Input
                id="block_wing"
                placeholder="A Block"
                value={formData.block_wing}
                onChange={(e) => handleInputChange("block_wing", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="room_type">Room Type *</Label>
              <Select
                value={formData.room_type}
                onValueChange={(value) => handleInputChange("room_type", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Single">Single</SelectItem>
                  <SelectItem value="Double">Double</SelectItem>
                  <SelectItem value="Triple">Triple</SelectItem>
                  <SelectItem value="Dormitory">Dormitory</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity *</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                placeholder="2"
                value={formData.capacity}
                onChange={(e) => handleInputChange("capacity", e.target.value)}
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
            <Label htmlFor="status">Status *</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleInputChange("status", value)}
              required
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="full">Full</SelectItem>
                <SelectItem value="under_maintenance">Under Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="facilities">Facilities</Label>
            <Textarea
              id="facilities"
              placeholder="AC, Attached Bathroom, etc."
              value={formData.facilities}
              onChange={(e) => handleInputChange("facilities", e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Room"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditRoomDialog;

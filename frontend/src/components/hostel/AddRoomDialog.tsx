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
import { getAllBuildings } from "@/services/hostelApiService";

interface AddRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  schoolId: number;
}

const AddRoomDialog = ({ open, onOpenChange, onSuccess, schoolId }: AddRoomDialogProps) => {
  const [formData, setFormData] = useState({
    hostel_building_id: "",
    room_number: "",
    floor: "",
    block_wing: "",
    room_type: "",
    capacity: "1",
    monthly_fee: "0",
    facilities: "",
  });
  const [buildings, setBuildings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      fetchBuildings();
    }
  }, [open]);

  const fetchBuildings = async () => {
    setFetchingData(true);
    try {
      const result = await getAllBuildings(schoolId);
      if (result.status && result.data) {
        setBuildings(result.data);
      }
    } catch (err) {
      console.error("Error fetching buildings:", err);
    } finally {
      setFetchingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`http://localhost:8000/api/principal/hostel/rooms/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          school_id: schoolId,
          ...formData,
          hostel_building_id: parseInt(formData.hostel_building_id),
          capacity: parseInt(formData.capacity),
          monthly_fee: parseFloat(formData.monthly_fee),
          occupied_beds: 0,
        }),
      });

      const result = await response.json();

      if (result.status) {
        onSuccess();
        onOpenChange(false);
        setFormData({
          hostel_building_id: "",
          room_number: "",
          floor: "",
          block_wing: "",
          room_type: "",
          capacity: "1",
          monthly_fee: "0",
          facilities: "",
        });
      } else {
        setError(result.message || "Failed to create room");
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
            Add Hostel Room
          </DialogTitle>
          <DialogDescription>
            Add a new room to a hostel building
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="hostel_building_id">Building *</Label>
            <Select
              value={formData.hostel_building_id}
              onValueChange={(value) => handleInputChange("hostel_building_id", value)}
              required
              disabled={fetchingData}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select building" />
              </SelectTrigger>
              <SelectContent>
                {buildings.map((building) => (
                  <SelectItem key={building.id} value={building.id.toString()}>
                    {building.building_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
            <Button type="submit" disabled={loading || fetchingData}>
              {loading ? "Creating..." : "Create Room"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddRoomDialog;

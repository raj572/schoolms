import { useState } from "react";
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
import { Bus } from "lucide-react";

interface AddBusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  schoolId: number;
}

const AddBusDialog = ({ open, onOpenChange, onSuccess, schoolId }: AddBusDialogProps) => {
  const [formData, setFormData] = useState({
    bus_number: "",
    registration_number: "",
    driver_name: "",
    driver_contact: "",
    route_name: "",
    capacity: 40,
    status: "active",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`http://localhost:8000/api/principal/transport/buses/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          school_id: schoolId,
          ...formData,
        }),
      });

      const result = await response.json();

      if (result.status) {
        onSuccess();
        onOpenChange(false);
        setFormData({
          bus_number: "",
          registration_number: "",
          driver_name: "",
          driver_contact: "",
          route_name: "",
          capacity: 40,
          status: "active",
        });
      } else {
        setError(result.message || "Failed to add bus");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bus className="h-5 w-5" />
            Add Bus
          </DialogTitle>
          <DialogDescription>
            Add a new bus to your school's transport fleet.
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
              <Label htmlFor="bus_number">Bus Number *</Label>
              <Input
                id="bus_number"
                placeholder="SCH-001"
                value={formData.bus_number}
                onChange={(e) => handleInputChange("bus_number", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="registration_number">Registration Number</Label>
              <Input
                id="registration_number"
                placeholder="KA-01-AB-1234"
                value={formData.registration_number}
                onChange={(e) => handleInputChange("registration_number", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="driver_name">Driver Name *</Label>
              <Input
                id="driver_name"
                placeholder="Ramesh Kumar"
                value={formData.driver_name}
                onChange={(e) => handleInputChange("driver_name", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="driver_contact">Driver Contact *</Label>
              <Input
                id="driver_contact"
                placeholder="+91 98765 43210"
                value={formData.driver_contact}
                onChange={(e) => handleInputChange("driver_contact", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="route_name">Route Name *</Label>
              <Input
                id="route_name"
                placeholder="Route A"
                value={formData.route_name}
                onChange={(e) => handleInputChange("route_name", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity *</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                max="100"
                placeholder="40"
                value={formData.capacity}
                onChange={(e) => handleInputChange("capacity", parseInt(e.target.value) || 1)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleInputChange("status", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Bus"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddBusDialog;


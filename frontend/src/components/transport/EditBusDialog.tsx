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
import { Bus } from "lucide-react";

interface BusData {
  id: number;
  bus_number: string;
  registration_number: string;
  driver_name: string;
  driver_contact: string;
  route_name: string;
  capacity: number;
  status: string;
}

interface EditBusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  bus: BusData | null;
}

const EditBusDialog = ({ open, onOpenChange, onSuccess, bus }: EditBusDialogProps) => {
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

  useEffect(() => {
    if (bus) {
      setFormData({
        bus_number: bus.bus_number || "",
        registration_number: bus.registration_number || "",
        driver_name: bus.driver_name || "",
        driver_contact: bus.driver_contact || "",
        route_name: bus.route_name || "",
        capacity: bus.capacity || 40,
        status: bus.status || "active",
      });
    }
  }, [bus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bus) return;

    setError("");
    setLoading(true);

    try {
      const response = await fetch(`http://localhost:8000/api/principal/transport/buses/update/${bus.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.status) {
        onSuccess();
        onOpenChange(false);
      } else {
        setError(result.message || "Failed to update bus");
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

  if (!bus) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bus className="h-5 w-5" />
            Edit Bus
          </DialogTitle>
          <DialogDescription>
            Update bus information in your school's transport fleet.
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
              {loading ? "Updating..." : "Update Bus"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditBusDialog;


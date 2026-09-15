import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/lib/axios";
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
import { Building, Plus } from "lucide-react";
import { getUnassignedWardens, createWarden } from "@/services/wardenApiService";

interface AddBuildingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  schoolId: number;
}

const AddBuildingDialog = ({ open, onOpenChange, onSuccess, schoolId }: AddBuildingDialogProps) => {
  const [formData, setFormData] = useState({
    building_name: "",
    building_type: "",
    address: "",
    warden_id: "",
    total_rooms: "0",
    description: "",
  });
  const [wardens, setWardens] = useState<Array<{ id: number; full_name: string; email: string }>>([]);
  const [showCreateWardenDialog, setShowCreateWardenDialog] = useState(false);
  const [wardenFormData, setWardenFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    username: "",
  });
  const [loading, setLoading] = useState(false);
  const [wardenLoading, setWardenLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/principal/hostel/buildings/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          school_id: schoolId,
          building_name: formData.building_name,
          building_type: formData.building_type,
          address: formData.address,
          warden_id: formData.warden_id && formData.warden_id !== "" && formData.warden_id !== "create-new" ? parseInt(formData.warden_id) : null,
          total_rooms: parseInt(formData.total_rooms),
          description: formData.description,
        }),
      });

      const result = await response.json();

      if (result.status) {
        onSuccess();
        onOpenChange(false);
      } else {
        setError(result.message || "Failed to create building");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchWardens();
      // Reset form when dialog opens
      setFormData({
        building_name: "",
        building_type: "",
        address: "",
        warden_id: "",
        total_rooms: "0",
        description: "",
      });
    }
  }, [open]);

  const fetchWardens = async () => {
    try {
      const result = await getUnassignedWardens();
      if (result.status) {
        setWardens(result.data || []);
      }
    } catch (err) {
      console.error("Error fetching wardens:", err);
    }
  };

  const handleCreateWarden = async () => {
    setWardenLoading(true);
    setError("");
    try {
      const result = await createWarden(wardenFormData);
      if (result.status) {
        await fetchWardens(); // Refresh list
        setFormData((prev) => ({ ...prev, warden_id: result.data.id.toString() }));
        setShowCreateWardenDialog(false);
        setWardenFormData({ full_name: "", email: "", phone: "", username: "" });
      } else {
        setError(result.message || "Failed to create warden");
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create warden";
      setError(errorMessage);
    } finally {
      setWardenLoading(false);
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
            <Building className="h-5 w-5" />
            Add Hostel Building
          </DialogTitle>
          <DialogDescription>
            Add a new hostel building to your school
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="building_name">Building Name *</Label>
            <Input
              id="building_name"
              placeholder="Boys Hostel Block A"
              value={formData.building_name}
              onChange={(e) => handleInputChange("building_name", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="building_type">Building Type *</Label>
            <Select
              value={formData.building_type}
              onValueChange={(value) => handleInputChange("building_type", value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select building type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Boys">Boys</SelectItem>
                <SelectItem value="Girls">Girls</SelectItem>
                <SelectItem value="Staff">Staff</SelectItem>
                <SelectItem value="Mixed">Mixed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              placeholder="Building address..."
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="warden_id">Assign Warden</Label>
            <div className="flex gap-2">
              <Select
                value={formData.warden_id === "create-new" ? "" : formData.warden_id}
                onValueChange={(value) => {
                  if (value === "create-new") {
                    setShowCreateWardenDialog(true);
                    handleInputChange("warden_id", "create-new");
                  } else {
                    handleInputChange("warden_id", value);
                  }
                }}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select warden or create new" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="create-new">Create New Warden</SelectItem>
                  <SelectItem value="">None (Unassigned)</SelectItem>
                  {wardens.map((warden) => (
                    <SelectItem key={warden.id} value={warden.id.toString()}>
                      {warden.full_name} ({warden.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {showCreateWardenDialog && (
              <div className="mt-4 p-4 border rounded-md space-y-3">
                <div className="text-sm font-medium">Create New Warden</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="warden_full_name">Full Name *</Label>
                    <Input
                      id="warden_full_name"
                      placeholder="John Doe"
                      value={wardenFormData.full_name}
                      onChange={(e) => setWardenFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="warden_email">Email *</Label>
                    <Input
                      id="warden_email"
                      type="email"
                      placeholder="john@example.com"
                      value={wardenFormData.email}
                      onChange={(e) => setWardenFormData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="warden_phone">Phone *</Label>
                    <Input
                      id="warden_phone"
                      placeholder="+91 98765 43210"
                      value={wardenFormData.phone}
                      onChange={(e) => setWardenFormData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="warden_username">Username *</Label>
                    <Input
                      id="warden_username"
                      placeholder="johndoe"
                      value={wardenFormData.username}
                      onChange={(e) => setWardenFormData(prev => ({ ...prev, username: e.target.value }))}
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={handleCreateWarden}
                  disabled={wardenLoading || !wardenFormData.full_name || !wardenFormData.email || !wardenFormData.phone || !wardenFormData.username}
                  size="sm"
                >
                  {wardenLoading ? "Creating..." : "Create Warden"}
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="total_rooms">Total Rooms *</Label>
            <Input
              id="total_rooms"
              type="number"
              min="0"
              placeholder="100"
              value={formData.total_rooms}
              onChange={(e) => handleInputChange("total_rooms", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Building description..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Building"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddBuildingDialog;

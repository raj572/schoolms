import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Loader2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  getAllServiceCharges,
  createServiceCharge,
  updateServiceCharge,
  deleteServiceCharge,
  getAccessibleSchools,
  type ServiceCharge,
  type School,
} from "@/services/accountantApiService";

const ServiceCharges = () => {
  const [charges, setCharges] = useState<ServiceCharge[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCharge, setEditingCharge] = useState<ServiceCharge | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    school_id: 0,
    service_type: "",
    service_name: "",
    charge: "",
    description: "",
    stopage: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchSchools();
  }, []);

  useEffect(() => {
    if (selectedSchoolId || schools.length === 1) {
      fetchCharges();
    }
  }, [selectedSchoolId, schools]);

  const fetchSchools = async () => {
    try {
      const response = await getAccessibleSchools();
      if (response.status && response.data) {
        setSchools(response.data);
        if (response.data.length === 1) {
          setSelectedSchoolId(response.data[0].id);
          setFormData((prev) => ({ ...prev, school_id: response.data[0].id }));
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load schools",
        variant: "destructive",
      });
    }
  };

  const fetchCharges = async () => {
    try {
      setLoading(true);
      const schoolId = selectedSchoolId || (schools.length === 1 ? schools[0].id : undefined);
      if (!schoolId) {
        setLoading(false);
        return;
      }

      const response = await getAllServiceCharges(schoolId);
      if (response.status && response.data) {
        setCharges(response.data);
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to load service charges",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load service charges",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (charge?: ServiceCharge) => {
    if (charge) {
      setEditingCharge(charge);
      setFormData({
        school_id: charge.school_id,
        service_type: charge.service_type,
        service_name: charge.service_name,
        charge: charge.charge.toString(),
        description: charge.description || "",
        stopage: charge.stopage || "",
      });
    } else {
      const schoolId = selectedSchoolId || (schools.length === 1 ? schools[0].id : undefined);
      if (!schoolId) {
        toast({
          title: "Error",
          description: "Please select a school first",
          variant: "destructive",
        });
        return;
      }
      setEditingCharge(null);
      setFormData({
        school_id: schoolId,
        service_type: "",
        service_name: "",
        charge: "",
        description: "",
        stopage: "",
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCharge(null);
    const schoolId = selectedSchoolId || schools[0]?.id || 0;
    setFormData({
      school_id: schoolId,
      service_type: "",
      service_name: "",
      charge: "",
      description: "",
      stopage: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.service_type || !formData.service_name || !formData.charge) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingCharge) {
        const response = await updateServiceCharge(editingCharge.id, {
          service_type: formData.service_type,
          service_name: formData.service_name,
          charge: parseFloat(formData.charge),
          description: formData.description || undefined,
          stopage: formData.stopage || undefined,
        });

        if (response.status) {
          toast({
            title: "Success",
            description: "Service charge updated successfully",
          });
          handleCloseDialog();
          fetchCharges();
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to update service charge",
            variant: "destructive",
          });
        }
      } else {
        const response = await createServiceCharge({
          school_id: formData.school_id,
          service_type: formData.service_type,
          service_name: formData.service_name,
          charge: parseFloat(formData.charge),
          description: formData.description || undefined,
          stopage: formData.stopage || undefined,
        });

        if (response.status) {
          toast({
            title: "Success",
            description: "Service charge created successfully",
          });
          handleCloseDialog();
          fetchCharges();
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to create service charge",
            variant: "destructive",
          });
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Operation failed",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this service charge?")) {
      return;
    }

    try {
      const response = await deleteServiceCharge(id);
      if (response.status) {
        toast({
          title: "Success",
          description: "Service charge deleted successfully",
        });
        fetchCharges();
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to delete service charge",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete service charge",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const filteredCharges = charges.filter((charge) =>
    charge.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    charge.service_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 px-12 py-9">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold">Service Charges</h1>
          <p className="text-gray-500 text-xs">
            Define and manage service charges for students
          </p>
        </div>
        <div className="flex gap-4">
          {schools.length > 1 && (
            <div className="w-64">
              <Select
                value={selectedSchoolId?.toString() || "all"}
                onValueChange={(value) => {
                  const schoolId = value === "all" ? undefined : parseInt(value);
                  setSelectedSchoolId(schoolId);
                  if (schoolId) {
                    setFormData((prev) => ({ ...prev, school_id: schoolId }));
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select School" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Schools</SelectItem>
                  {schools.map((school) => (
                    <SelectItem key={school.id} value={school.id.toString()}>
                      {school.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <Button onClick={() => handleOpenDialog()} className="gap-2">
            <Plus className="h-4 w-4" /> Add Service Charge
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
            <Input
              placeholder="Search service charges..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-md">Service Charges</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">School</TableHead>
                  <TableHead className="text-xs">Service Type</TableHead>
                  <TableHead className="text-xs">Service Name</TableHead>
                  <TableHead className="text-xs">Charge</TableHead>
                  <TableHead className="text-xs">Description</TableHead>
                  <TableHead className="text-xs">Stopage</TableHead>
                  <TableHead className="text-right text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCharges.length > 0 ? (
                  filteredCharges.map((charge) => (
                    <TableRow key={charge.id}>
                      <TableCell className="font-medium text-xs">
                        {charge.school?.name || "N/A"}
                      </TableCell>
                      <TableCell className="text-xs">{charge.service_type}</TableCell>
                      <TableCell className="font-medium text-xs">
                        {charge.service_name}
                      </TableCell>
                      <TableCell className="text-xs">
                        {formatCurrency(charge.charge)}
                      </TableCell>
                      <TableCell className="text-xs">
                        {charge.description || "-"}
                      </TableCell>
                      <TableCell className="text-xs">
                        {charge.stopage || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(charge)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(charge.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                      {selectedSchoolId || schools.length === 1
                        ? searchTerm
                          ? "No service charges found matching your search"
                          : "No service charges defined yet. Click 'Add Service Charge' to create one."
                        : "Please select a school to view service charges."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCharge ? "Edit Service Charge" : "Add New Service Charge"}
            </DialogTitle>
            <DialogDescription>
              {editingCharge
                ? "Update the service charge details below."
                : "Fill in the details to create a new service charge."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {schools.length > 1 && !editingCharge && (
              <div className="space-y-2">
                <Label>School</Label>
                <Select
                  value={formData.school_id.toString()}
                  onValueChange={(value) => {
                    setFormData((prev) => ({ ...prev, school_id: parseInt(value) }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select School" />
                  </SelectTrigger>
                  <SelectContent>
                    {schools.map((school) => (
                      <SelectItem key={school.id} value={school.id.toString()}>
                        {school.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Service Type</Label>
                <Input
                  placeholder="e.g., Transport, Library, Hostel"
                  value={formData.service_type}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, service_type: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Service Name</Label>
                <Input
                  placeholder="e.g., Bus Service, Library Membership"
                  value={formData.service_name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, service_name: e.target.value }))
                  }
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Charge (₹)</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0"
                value={formData.charge}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, charge: e.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                placeholder="Optional description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Stopage</Label>
              <Input
                placeholder="Optional stopage information"
                value={formData.stopage}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, stopage: e.target.value }))
                }
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit">{editingCharge ? "Update" : "Create"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServiceCharges;


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
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  getAllFeeStructures,
  createFeeStructure,
  updateFeeStructure,
  deleteFeeStructure,
  getAccessibleSchools,
  type FeeStructure,
  type School,
} from "@/services/accountantApiService";

const AccountantFeeStructure = () => {
  const [fees, setFees] = useState<FeeStructure[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<FeeStructure | null>(null);
  const [formData, setFormData] = useState({
    school_id: 0,
    class: "",
    monthly_fee: "",
    other_fee: "",
    registration_fee: "",
    admission_fee: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchSchools();
  }, []);

  useEffect(() => {
    if (selectedSchoolId || schools.length === 1) {
      fetchFees();
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

  const fetchFees = async () => {
    try {
      setLoading(true);
      const schoolId = selectedSchoolId || (schools.length === 1 ? schools[0].id : undefined);
      if (!schoolId) {
        setLoading(false);
        return;
      }

      const response = await getAllFeeStructures(schoolId);
      if (response.status && response.data) {
        setFees(response.data);
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to load fee structures",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load fee structures",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (fee?: FeeStructure) => {
    if (fee) {
      setEditingFee(fee);
      setFormData({
        school_id: fee.school_id,
        class: fee.class,
        monthly_fee: fee.monthly_fee.toString(),
        other_fee: fee.other_fee.toString(),
        registration_fee: fee.registration_fee.toString(),
        admission_fee: fee.admission_fee.toString(),
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
      setEditingFee(null);
      setFormData({
        school_id: schoolId,
        class: "",
        monthly_fee: "",
        other_fee: "",
        registration_fee: "",
        admission_fee: "",
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingFee(null);
    setFormData({
      school_id: selectedSchoolId || schools[0]?.id || 0,
      class: "",
      monthly_fee: "",
      other_fee: "",
      registration_fee: "",
      admission_fee: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.class || !formData.monthly_fee || !formData.other_fee || 
        !formData.registration_fee || !formData.admission_fee) {
      toast({
        title: "Validation Error",
        description: "Please fill all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingFee) {
        // Update existing fee structure
        const response = await updateFeeStructure(editingFee.id, {
          class: formData.class,
          monthly_fee: parseFloat(formData.monthly_fee),
          other_fee: parseFloat(formData.other_fee),
          registration_fee: parseFloat(formData.registration_fee),
          admission_fee: parseFloat(formData.admission_fee),
        });

        if (response.status) {
          toast({
            title: "Success",
            description: "Fee structure updated successfully",
          });
          handleCloseDialog();
          fetchFees();
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to update fee structure",
            variant: "destructive",
          });
        }
      } else {
        // Create new fee structure
        const response = await createFeeStructure({
          school_id: formData.school_id,
          class: formData.class,
          monthly_fee: parseFloat(formData.monthly_fee),
          other_fee: parseFloat(formData.other_fee),
          registration_fee: parseFloat(formData.registration_fee),
          admission_fee: parseFloat(formData.admission_fee),
        });

        if (response.status) {
          toast({
            title: "Success",
            description: "Fee structure created successfully",
          });
          handleCloseDialog();
          fetchFees();
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to create fee structure",
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
    if (!window.confirm("Are you sure you want to delete this fee structure?")) {
      return;
    }

    try {
      const response = await deleteFeeStructure(id);
      if (response.status) {
        toast({
          title: "Success",
          description: "Fee structure deleted successfully",
        });
        fetchFees();
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to delete fee structure",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete fee structure",
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

  return (
    <div className="space-y-8 px-12 py-9">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold">Fee Structure</h1>
          <p className="text-gray-500 text-xs">
            Define and manage fee structures for different classes
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
            <Plus className="h-4 w-4" /> Add Fee Structure
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-md">Fee Structures</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">School</TableHead>
                  <TableHead className="text-xs">Class</TableHead>
                  <TableHead className="text-xs">Monthly Fee</TableHead>
                  <TableHead className="text-xs">Other Fee</TableHead>
                  <TableHead className="text-xs">Registration Fee</TableHead>
                  <TableHead className="text-xs">Admission Fee</TableHead>
                  <TableHead className="text-right text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fees.length > 0 ? (
                  fees.map((fee) => (
                    <TableRow key={fee.id}>
                      <TableCell className="font-medium text-xs">
                        {fee.school?.name || "N/A"}
                      </TableCell>
                      <TableCell className="font-medium text-xs">{fee.class}</TableCell>
                      <TableCell className="text-xs">{formatCurrency(fee.monthly_fee)}</TableCell>
                      <TableCell className="text-xs">{formatCurrency(fee.other_fee)}</TableCell>
                      <TableCell className="text-xs">{formatCurrency(fee.registration_fee)}</TableCell>
                      <TableCell className="text-xs">{formatCurrency(fee.admission_fee)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleOpenDialog(fee)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(fee.id)}
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
                        ? "No fee structures defined yet. Click 'Add Fee Structure' to create one."
                        : "Please select a school to view fee structures."}
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
              {editingFee ? "Edit Fee Structure" : "Add New Fee Structure"}
            </DialogTitle>
            <DialogDescription>
              {editingFee 
                ? "Update the fee structure details below."
                : "Fill in the details to create a new fee structure for a class."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {schools.length > 1 && !editingFee && (
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
                <Label>Class</Label>
                <Input
                  placeholder="e.g., 1st, 2nd, 3rd"
                  value={formData.class}
                  onChange={(e) => setFormData((prev) => ({ ...prev, class: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Monthly Fee (₹)</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0"
                  value={formData.monthly_fee}
                  onChange={(e) => setFormData((prev) => ({ ...prev, monthly_fee: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Other Fee (₹)</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0"
                  value={formData.other_fee}
                  onChange={(e) => setFormData((prev) => ({ ...prev, other_fee: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Registration Fee (₹)</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0"
                  value={formData.registration_fee}
                  onChange={(e) => setFormData((prev) => ({ ...prev, registration_fee: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Admission Fee (₹)</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0"
                  value={formData.admission_fee}
                  onChange={(e) => setFormData((prev) => ({ ...prev, admission_fee: e.target.value }))}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit">
                {editingFee ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AccountantFeeStructure;

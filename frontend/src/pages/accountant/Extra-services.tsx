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
import { Search, Plus, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  getStudentExtraServices,
  assignExtraService,
  removeExtraService,
  getAllServiceCharges,
  getAccessibleSchools,
  type StudentExtraService,
  type ServiceCharge,
  type School,
} from "@/services/accountantApiService";

const AccountantExtraServices = () => {
  const [studentServices, setStudentServices] = useState<any[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [availableServices, setAvailableServices] = useState<ServiceCharge[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    student_details_id: 0,
    service_id: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchSchools();
  }, []);

  useEffect(() => {
    if (selectedSchoolId || schools.length === 1) {
      const schoolId = selectedSchoolId || (schools.length === 1 ? schools[0].id : undefined);
      if (schoolId) {
        fetchStudentServices(schoolId);
        fetchAvailableServices(schoolId);
      }
    }
  }, [selectedSchoolId, schools]);

  const fetchSchools = async () => {
    try {
      const response = await getAccessibleSchools();
      if (response.status && response.data) {
        setSchools(response.data);
        if (response.data.length === 1) {
          setSelectedSchoolId(response.data[0].id);
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

  const fetchAvailableServices = async (schoolId: number) => {
    try {
      const response = await getAllServiceCharges(schoolId);
      if (response.status && response.data) {
        setAvailableServices(response.data);
      }
    } catch (error: any) {
      console.error("Failed to load available services:", error);
    }
  };

  const fetchStudentServices = async (schoolId: number) => {
    try {
      setLoading(true);
      const response = await getStudentExtraServices(schoolId);
      if (response.status && response.data) {
        // Transform the data to a flat list of student-service assignments
        const assignments: any[] = [];
        response.data.forEach((student: any) => {
          if (student.services && Array.isArray(student.services)) {
            student.services.forEach((service: any) => {
              assignments.push({
                id: service.pivot?.id || `${student.id}-${service.id}`,
                student_details_id: student.id,
                service_id: service.id,
                student_name: student.candidate_name,
                student_class: student.class,
                student_roll_no: student.roll_no,
                service_name: service.service_name,
                service_type: service.service_type,
                charge: service.charge,
              });
            });
          }
        });
        setStudentServices(assignments);
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to load student extra services",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load student extra services",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    const schoolId = selectedSchoolId || (schools.length === 1 ? schools[0].id : undefined);
    if (!schoolId) {
      toast({
        title: "Error",
        description: "Please select a school first",
        variant: "destructive",
      });
      return;
    }
    setFormData({
      student_details_id: 0,
      service_id: 0,
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setFormData({
      student_details_id: 0,
      service_id: 0,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.student_details_id || !formData.service_id) {
      toast({
        title: "Validation Error",
        description: "Please select both student and service",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await assignExtraService({
        student_details_id: formData.student_details_id,
        service_id: formData.service_id,
      });

      if (response.status) {
        toast({
          title: "Success",
          description: "Service assigned to student successfully",
        });
        handleCloseDialog();
        const schoolId = selectedSchoolId || (schools.length === 1 ? schools[0].id : undefined);
        if (schoolId) {
          fetchStudentServices(schoolId);
        }
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to assign service",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Operation failed",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number | string) => {
    if (!window.confirm("Are you sure you want to remove this service from the student?")) {
      return;
    }

    try {
      const assignmentId = typeof id === 'string' ? parseInt(id.split('-')[0]) : id;
      const response = await removeExtraService(assignmentId);
      if (response.status) {
        toast({
          title: "Success",
          description: "Service removed from student successfully",
        });
        const schoolId = selectedSchoolId || (schools.length === 1 ? schools[0].id : undefined);
        if (schoolId) {
          fetchStudentServices(schoolId);
        }
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to remove service",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove service",
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

  const filteredServices = studentServices.filter((assignment) =>
    assignment.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.service_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.student_class?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 px-14 py-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold">Student Extra Services</h1>
          <p className="text-gray-500 text-xs">
            Manage extra services assigned to students
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
          <Button onClick={handleOpenDialog} className="gap-2">
            <Plus className="h-4 w-4" />
            Assign Service
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[250px]">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  id="search"
                  placeholder="Search by student name, class, or service..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
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
            <CardTitle className="text-lg">Student Service Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Student Name</TableHead>
                  <TableHead className="text-xs">Class</TableHead>
                  <TableHead className="text-xs">Roll No.</TableHead>
                  <TableHead className="text-xs">Service Name</TableHead>
                  <TableHead className="text-xs">Service Type</TableHead>
                  <TableHead className="text-xs">Charge</TableHead>
                  <TableHead className="text-right text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.length > 0 ? (
                  filteredServices.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-medium text-xs">
                        {assignment.student_name || "N/A"}
                      </TableCell>
                      <TableCell className="text-xs">
                        {assignment.student_class || "N/A"}
                      </TableCell>
                      <TableCell className="text-xs">
                        {assignment.student_roll_no || "N/A"}
                      </TableCell>
                      <TableCell className="font-medium text-xs">
                        {assignment.service_name || "N/A"}
                      </TableCell>
                      <TableCell className="text-xs">
                        {assignment.service_type || "N/A"}
                      </TableCell>
                      <TableCell className="text-xs">
                        {formatCurrency(assignment.charge || 0)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(assignment.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                      {selectedSchoolId || schools.length === 1
                        ? searchTerm
                          ? "No assignments found matching your search"
                          : "No student service assignments found. Click 'Assign Service' to create one."
                        : "Please select a school to view student service assignments."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Assign Service Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Assign Service to Student</DialogTitle>
            <DialogDescription>
              Select a student and a service to assign.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Student Details ID</Label>
              <Input
                type="number"
                value={formData.student_details_id || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    student_details_id: parseInt(e.target.value) || 0,
                  }))
                }
                placeholder="Enter student details ID"
                required
              />
              <p className="text-xs text-gray-500">
                Note: Enter the student details ID to assign the service
              </p>
            </div>
            <div className="space-y-2">
              <Label>Service</Label>
              <Select
                value={formData.service_id.toString()}
                onValueChange={(value) => {
                  setFormData((prev) => ({ ...prev, service_id: parseInt(value) }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Service" />
                </SelectTrigger>
                <SelectContent>
                  {availableServices.map((service) => (
                    <SelectItem key={service.id} value={service.id.toString()}>
                      {service.service_name} - {formatCurrency(service.charge)} ({service.service_type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit">Assign Service</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AccountantExtraServices;

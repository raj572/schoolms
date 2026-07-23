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
import { Badge } from "@/components/ui/badge";
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
import { 
  Plus, 
  Search, 
  Loader2, 
  Edit, 
  Trash2,
  Eye
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  getAllAnnualPayments,
  createAnnualPayment,
  updateAnnualPayment,
  deleteAnnualPayment,
  getAccessibleSchools,
  type AnnualPayment,
  type School,
} from "@/services/accountantApiService";

const AnnualPayments = () => {
  const [payments, setPayments] = useState<AnnualPayment[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<AnnualPayment | null>(null);
  const [editingPayment, setEditingPayment] = useState<AnnualPayment | null>(null);
  const [filters, setFilters] = useState({
    school_id: undefined as number | undefined,
    student_details_id: undefined as number | undefined,
    status: "" as "" | "due" | "paid",
    search: "",
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 15,
    total: 0,
    last_page: 1,
  });
  const [formData, setFormData] = useState({
    school_id: 0,
    student_details_id: 0,
    admission_fee: "",
    registration_fee: "",
    other_fee: "",
    status: "due" as "due" | "paid",
    payment_date: "",
    mode: "" as "online" | "cash" | "card" | "upi" | "",
    remarks: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchSchools();
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [filters, pagination.current_page]);

  const fetchSchools = async () => {
    try {
      const response = await getAccessibleSchools();
      if (response.status && response.data) {
        setSchools(response.data);
        if (response.data.length === 1) {
          setFilters((prev) => ({ ...prev, school_id: response.data[0].id }));
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

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await getAllAnnualPayments({
        ...filters,
        per_page: pagination.per_page,
        page: pagination.current_page,
      });

      if (response.status && response.data) {
        setPayments(response.data.data || []);
        setPagination((prev) => ({
          ...prev,
          current_page: response.data.current_page || 1,
          total: response.data.total || 0,
          last_page: response.data.last_page || 1,
        }));
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to load payments",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load payments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateDialog = () => {
    const schoolId = filters.school_id || (schools.length === 1 ? schools[0].id : undefined);
    if (!schoolId) {
      toast({
        title: "Error",
        description: "Please select a school first",
        variant: "destructive",
      });
      return;
    }
    setEditingPayment(null);
    setFormData({
      school_id: schoolId,
      student_details_id: 0,
      admission_fee: "",
      registration_fee: "",
      other_fee: "",
      status: "due",
      payment_date: "",
      mode: "",
      remarks: "",
    });
    setDialogOpen(true);
  };

  const handleOpenEditDialog = (payment: AnnualPayment) => {
    setEditingPayment(payment);
    setFormData({
      school_id: payment.school_id,
      student_details_id: payment.student_details_id,
      admission_fee: payment.admission_fee.toString(),
      registration_fee: payment.registration_fee.toString(),
      other_fee: (payment.other_fee || 0).toString(),
      status: payment.status,
      payment_date: payment.payment_date || "",
      mode: (payment.mode as any) || "",
      remarks: payment.remarks || "",
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingPayment(null);
    const schoolId = filters.school_id || schools[0]?.id || 0;
    setFormData({
      school_id: schoolId,
      student_details_id: 0,
      admission_fee: "",
      registration_fee: "",
      other_fee: "",
      status: "due",
      payment_date: "",
      mode: "",
      remarks: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.admission_fee || !formData.registration_fee) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingPayment) {
        const response = await updateAnnualPayment(editingPayment.id, {
          admission_fee: parseFloat(formData.admission_fee),
          registration_fee: parseFloat(formData.registration_fee),
          other_fee: formData.other_fee ? parseFloat(formData.other_fee) : 0,
          status: formData.status,
          payment_date: formData.payment_date || undefined,
          mode: formData.mode || undefined,
          remarks: formData.remarks || undefined,
        });

        if (response.status) {
          toast({
            title: "Success",
            description: "Annual payment updated successfully",
          });
          handleCloseDialog();
          fetchPayments();
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to update payment",
            variant: "destructive",
          });
        }
      } else {
        const response = await createAnnualPayment({
          school_id: formData.school_id,
          student_details_id: formData.student_details_id,
          admission_fee: parseFloat(formData.admission_fee),
          registration_fee: parseFloat(formData.registration_fee),
          other_fee: formData.other_fee ? parseFloat(formData.other_fee) : 0,
          status: formData.status,
          payment_date: formData.payment_date || undefined,
          mode: formData.mode || undefined,
          remarks: formData.remarks || undefined,
        });

        if (response.status) {
          toast({
            title: "Success",
            description: "Annual payment created successfully",
          });
          handleCloseDialog();
          fetchPayments();
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to create payment",
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
    if (!window.confirm("Are you sure you want to delete this annual payment?")) {
      return;
    }

    try {
      const response = await deleteAnnualPayment(id);
      if (response.status) {
        toast({
          title: "Success",
          description: "Annual payment deleted successfully",
        });
        fetchPayments();
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to delete payment",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete payment",
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

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      paid: "default",
      due: "destructive",
    };
    return (
      <Badge variant={variants[status] || "secondary"}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="space-y-8 px-12 py-9">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold">Annual Payments</h1>
          <p className="text-gray-500 text-xs">
            Manage annual fee payments (admission, registration)
          </p>
        </div>
        <Button onClick={handleOpenCreateDialog} className="gap-2">
          <Plus className="h-4 w-4" /> Create Payment
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-md">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {schools.length > 1 && (
              <div className="space-y-2">
                <Label className="text-xs">School</Label>
                <Select
                  value={filters.school_id?.toString() || "all"}
                  onValueChange={(value) => {
                    setFilters((prev) => ({
                      ...prev,
                      school_id: value === "all" ? undefined : parseInt(value),
                    }));
                    setPagination((prev) => ({ ...prev, current_page: 1 }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Schools" />
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
            <div className="space-y-2">
              <Label className="text-xs">Status</Label>
              <Select
                value={filters.status || "all"}
                onValueChange={(value: any) => {
                  setFilters((prev) => ({ ...prev, status: value === "all" ? "" : value }));
                  setPagination((prev) => ({ ...prev, current_page: 1 }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="due">Due</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Search</Label>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Search..."
                  className="pl-10"
                  value={filters.search}
                  onChange={(e) => {
                    setFilters((prev) => ({ ...prev, search: e.target.value }));
                    setPagination((prev) => ({ ...prev, current_page: 1 }));
                  }}
                />
              </div>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setFilters({
                    school_id: schools.length === 1 ? schools[0].id : undefined,
                    student_details_id: undefined,
                    status: "",
                    search: "",
                  });
                  setPagination((prev) => ({ ...prev, current_page: 1 }));
                }}
                className="w-full"
              >
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-md">Annual Payments</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Student</TableHead>
                    <TableHead className="text-xs">Class</TableHead>
                    <TableHead className="text-xs">Admission Fee</TableHead>
                    <TableHead className="text-xs">Registration Fee</TableHead>
                    <TableHead className="text-xs">Other Fee</TableHead>
                    <TableHead className="text-xs">Total</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Payment Date</TableHead>
                    <TableHead className="text-right text-xs">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.length > 0 ? (
                    payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium text-xs">
                          {payment.studentDetail?.candidate_name || "N/A"}
                        </TableCell>
                        <TableCell className="text-xs">
                          {payment.studentDetail?.class || "N/A"}
                        </TableCell>
                        <TableCell className="text-xs">
                          {formatCurrency(payment.admission_fee)}
                        </TableCell>
                        <TableCell className="text-xs">
                          {formatCurrency(payment.registration_fee)}
                        </TableCell>
                        <TableCell className="text-xs">
                          {formatCurrency(payment.other_fee || 0)}
                        </TableCell>
                        <TableCell className="text-xs font-bold">
                          {formatCurrency(payment.total_amount)}
                        </TableCell>
                        <TableCell>{getStatusBadge(payment.status)}</TableCell>
                        <TableCell className="text-xs">
                          {payment.payment_date
                            ? new Date(payment.payment_date).toLocaleDateString()
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedPayment(payment);
                                setViewDialogOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEditDialog(payment)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(payment.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-gray-500 py-8">
                        No annual payments found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              {pagination.last_page > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-500">
                    Showing {(pagination.current_page - 1) * pagination.per_page + 1} to{" "}
                    {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of{" "}
                    {pagination.total} results
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.current_page === 1}
                      onClick={() =>
                        setPagination((prev) => ({ ...prev, current_page: prev.current_page - 1 }))
                      }
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.current_page === pagination.last_page}
                      onClick={() =>
                        setPagination((prev) => ({ ...prev, current_page: prev.current_page + 1 }))
                      }
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingPayment ? "Edit Annual Payment" : "Create Annual Payment"}
            </DialogTitle>
            <DialogDescription>
              {editingPayment
                ? "Update annual payment details below."
                : "Fill in the details to create a new annual payment record."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!editingPayment && (
              <>
                <div className="grid grid-cols-2 gap-4">
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
                      required
                    />
                  </div>
                </div>
              </>
            )}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Admission Fee (₹)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.admission_fee}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, admission_fee: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Registration Fee (₹)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.registration_fee}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, registration_fee: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Other Fee (₹)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.other_fee}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, other_fee: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) =>
                    setFormData((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="due">Due</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Payment Date</Label>
                <Input
                  type="date"
                  value={formData.payment_date}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, payment_date: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Payment Mode</Label>
                <Select
                  value={formData.mode}
                  onValueChange={(value: any) =>
                    setFormData((prev) => ({ ...prev, mode: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Remarks</Label>
              <Input
                value={formData.remarks}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, remarks: e.target.value }))
                }
                placeholder="Optional remarks"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit">{editingPayment ? "Update" : "Create"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Student</Label>
                  <p className="font-medium">
                    {selectedPayment.studentDetail?.candidate_name || "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Class</Label>
                  <p className="font-medium">{selectedPayment.studentDetail?.class || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Admission Fee</Label>
                  <p className="font-medium">
                    {formatCurrency(selectedPayment.admission_fee)}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Registration Fee</Label>
                  <p className="font-medium">
                    {formatCurrency(selectedPayment.registration_fee)}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Other Fee</Label>
                  <p className="font-medium">
                    {formatCurrency(selectedPayment.other_fee || 0)}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Total Amount</Label>
                  <p className="font-medium">
                    {formatCurrency(selectedPayment.total_amount)}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedPayment.status)}</div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Payment Date</Label>
                  <p className="font-medium">
                    {selectedPayment.payment_date
                      ? new Date(selectedPayment.payment_date).toLocaleDateString()
                      : "-"}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Payment Mode</Label>
                  <p className="font-medium">{selectedPayment.mode || "-"}</p>
                </div>
                {selectedPayment.remarks && (
                  <div>
                    <Label className="text-xs text-gray-500">Remarks</Label>
                    <p className="font-medium">{selectedPayment.remarks}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AnnualPayments;


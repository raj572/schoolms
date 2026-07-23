import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Plus, Search, Edit, Trash2, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  getAccessibleSchools,
  getAllMonthlyPayments,
  getAllAnnualPayments,
  getAllServiceCharges,
  type School,
  type MonthlyPayment,
  type AnnualPayment,
  type ServiceCharge,
} from "@/services/accountantApiService";
import { useNavigate } from "react-router-dom";

type FeeItem = {
  id: string;
  type: 'monthly' | 'annual' | 'service';
  studentName?: string;
  schoolName: string;
  feeType: string;
  amount: number;
  dueDate?: string;
  status: 'paid' | 'pending' | 'due' | 'overdue';
  lastPaid?: string;
  originalData: MonthlyPayment | AnnualPayment | ServiceCharge;
};

const AccountantFees = () => {
  const [loading, setLoading] = useState(true);
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<number | undefined>(undefined);
  const [feeData, setFeeData] = useState<FeeItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const { toast } = useToast();
  const navigate = useNavigate();

  // Summary calculations
  const totalCollected = feeData
    .filter(fee => fee.status === 'paid')
    .reduce((sum, fee) => sum + fee.amount, 0);
  
  const totalPending = feeData
    .filter(fee => fee.status === 'pending' || fee.status === 'due')
    .reduce((sum, fee) => sum + fee.amount, 0);
  
  const totalOverdue = feeData
    .filter(fee => fee.status === 'overdue')
    .reduce((sum, fee) => sum + fee.amount, 0);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch accessible schools
      const schoolsResponse = await getAccessibleSchools();
      if (schoolsResponse.status && schoolsResponse.data) {
        setSchools(schoolsResponse.data);
        if (schoolsResponse.data.length === 1) {
          setSelectedSchoolId(schoolsResponse.data[0].id);
        }
      }

      // Fetch all fee types
      const [monthlyResponse, annualResponse, serviceResponse] = await Promise.all([
        getAllMonthlyPayments({ school_id: selectedSchoolId, per_page: 1000 }),
        getAllAnnualPayments({ school_id: selectedSchoolId, per_page: 1000 }),
        getAllServiceCharges(selectedSchoolId),
      ]);

      const combinedFees: FeeItem[] = [];

      // Process monthly payments
      if (monthlyResponse.status && monthlyResponse.data?.data) {
        monthlyResponse.data.data.forEach((payment: MonthlyPayment) => {
          combinedFees.push({
            id: `monthly-${payment.id}`,
            type: 'monthly',
            studentName: payment.student?.candidate_name || 'N/A',
            schoolName: payment.school?.name || 'N/A',
            feeType: 'Monthly Dues',
            amount: payment.total_amount || 0,
            dueDate: payment.due_date,
            status: payment.status === 'paid' ? 'paid' : payment.status === 'pending' ? 'pending' : 'due',
            lastPaid: payment.payment_date || undefined,
            originalData: payment,
          });
        });
      }

      // Process annual payments
      if (annualResponse.status && annualResponse.data?.data) {
        annualResponse.data.data.forEach((payment: AnnualPayment) => {
          combinedFees.push({
            id: `annual-${payment.id}`,
            type: 'annual',
            studentName: payment.studentDetail?.candidate_name || 'N/A',
            schoolName: payment.school?.name || 'N/A',
            feeType: 'Annual Payment',
            amount: payment.total_amount || 0,
            status: payment.status === 'paid' ? 'paid' : 'due',
            lastPaid: payment.payment_date || undefined,
            originalData: payment,
          });
        });
      }

      // Process service charges
      if (serviceResponse.status && serviceResponse.data) {
        serviceResponse.data.forEach((charge: ServiceCharge) => {
          combinedFees.push({
            id: `service-${charge.id}`,
            type: 'service',
            schoolName: charge.school?.name || 'N/A',
            feeType: charge.service_name || 'Service Charge',
            amount: charge.charge || 0,
            status: 'pending', // Service charges are typically pending until applied
            originalData: charge,
          });
        });
      }

      setFeeData(combinedFees);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load fee data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedSchoolId]);

  const filteredFees = feeData.filter(fee => {
    const matchesSearch = 
      fee.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fee.schoolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fee.feeType.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || fee.status === statusFilter;
    
    const matchesType = typeFilter === "all" || 
      (typeFilter === "monthly" && fee.type === "monthly") ||
      (typeFilter === "annual" && fee.type === "annual") ||
      (typeFilter === "service" && fee.type === "service");
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleEdit = (fee: FeeItem) => {
    if (fee.type === 'monthly') {
      navigate('/accountant/monthly-dues');
    } else if (fee.type === 'annual') {
      navigate('/accountant/annual-payments');
    } else if (fee.type === 'service') {
      navigate('/accountant/service-charges');
    }
  };

  return (
    <div className="space-y-8 px-12 py-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold">Fee Management</h1>
          <p className="text-gray-500 text-xs">Manage all fees: monthly dues, annual payments, and service charges</p>
        </div>
        <div className="flex gap-2">
          {schools.length > 1 && (
            <Select
              value={selectedSchoolId?.toString() || "all"}
              onValueChange={(value) => setSelectedSchoolId(value === "all" ? undefined : parseInt(value))}
            >
              <SelectTrigger className="w-[200px]">
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
          )}
          <Button onClick={() => navigate('/accountant/fees-structure')} className="gap-2">
            <Plus className="h-4 w-4" />
            Manage Fee Structure
          </Button>
        </div>
      </div>

      {/* Fee Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-card to-green-50 dark:to-green-950">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600 dark:text-green-400">Total Collected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-green-600 dark:text-green-400">
              ₹{totalCollected.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-gray-500">Paid fees</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-yellow-50 dark:to-yellow-950">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
              ₹{totalPending.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-gray-500">Awaiting payment</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-red-50 dark:to-red-950">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600 dark:text-red-400">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-red-600 dark:text-red-400">
              ₹{totalOverdue.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-gray-500">Past due date</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  id="search"
                  placeholder="Search by student, school, fee type..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="due">Due</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Fee Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="monthly">Monthly Dues</SelectItem>
                  <SelectItem value="annual">Annual Payment</SelectItem>
                  <SelectItem value="service">Service Charge</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fee Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Fees</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : filteredFees.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No fees found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student/School</TableHead>
                  <TableHead>Fee Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Paid</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFees.map((fee) => (
                  <TableRow key={fee.id}>
                    <TableCell className="font-medium text-xs">
                      {fee.studentName || fee.schoolName}
                    </TableCell>
                    <TableCell className="font-medium text-xs">{fee.feeType}</TableCell>
                    <TableCell className="font-medium text-xs">
                      ₹{fee.amount.toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell className="font-medium text-xs">
                      {fee.dueDate ? new Date(fee.dueDate).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          fee.status === "paid" ? "default" : 
                          fee.status === "pending" ? "secondary" : 
                          "destructive"
                        }
                      >
                        {fee.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      {fee.lastPaid ? new Date(fee.lastPaid).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEdit(fee)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountantFees;

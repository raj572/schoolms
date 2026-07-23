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
import { Plus, Search, Download, CheckCircle, Clock, XCircle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  getAccessibleSchools,
  getPaymentHistory,
  type School,
  type PaymentHistoryItem,
} from "@/services/accountantApiService";
import { useNavigate } from "react-router-dom";

const AccountantPayments = () => {
  const [loading, setLoading] = useState(true);
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<number | undefined>(undefined);
  const [paymentData, setPaymentData] = useState<PaymentHistoryItem[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<PaymentHistoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const { toast } = useToast();
  const navigate = useNavigate();

  // Summary calculations
  const totalReceived = filteredPayments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);
  
  const totalProcessing = filteredPayments
    .filter(p => p.status === 'processing' || p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);
  
  const totalFailed = filteredPayments
    .filter(p => p.status === 'failed')
    .reduce((sum, p) => sum + p.amount, 0);
  
  const averagePayment = filteredPayments.length > 0
    ? Math.round(filteredPayments.reduce((sum, p) => sum + p.amount, 0) / filteredPayments.length)
    : 0;

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

      // Fetch payment history
      const params: any = {};
      if (selectedSchoolId) params.school_id = selectedSchoolId;
      if (typeFilter !== 'all') params.type = typeFilter;
      if (statusFilter !== 'all') params.status = statusFilter;

      const paymentResponse = await getPaymentHistory(params);
      if (paymentResponse.status && paymentResponse.data) {
        setPaymentData(paymentResponse.data);
        setFilteredPayments(paymentResponse.data);
      } else {
        toast({
          title: "Error",
          description: paymentResponse.message || "Failed to load payment data",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load payment data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedSchoolId, typeFilter, statusFilter]);

  useEffect(() => {
    let filtered = paymentData.filter(payment => {
      const matchesSearch = 
        payment.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.school_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.id.toString().includes(searchQuery);
      
      const matchesMethod = methodFilter === "all" || 
        payment.mode?.toLowerCase().includes(methodFilter.toLowerCase());
      
      return matchesSearch && matchesMethod;
    });

    setFilteredPayments(filtered);
  }, [searchQuery, methodFilter, paymentData]);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "processing":
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" => {
    switch (status.toLowerCase()) {
      case "paid":
      case "completed":
        return "default";
      case "processing":
      case "pending":
        return "secondary";
      case "failed":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    toast({
      title: "Export",
      description: "Export functionality will be implemented soon",
    });
  };

  return (
    <div className="space-y-8 px-14 py-9">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold">Payment Management</h1>
          <p className="text-gray-500 text-xs">Track and manage all payment transactions</p>
        </div>
        <div className="flex gap-3">
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
          <Button variant="outline" className="gap-2" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button className="gap-2" onClick={() => navigate('/accountant/monthly-dues')}>
            <Plus className="h-4 w-4" />
            Record Payment
          </Button>
        </div>
      </div>

      {/* Payment Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-card to-green-50 dark:to-green-950">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600 dark:text-green-400">Total Received</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-green-600 dark:text-green-400">
              ₹{totalReceived.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-gray-500">Completed payments</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-yellow-50 dark:to-yellow-950">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
              ₹{totalProcessing.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-gray-500">
              {filteredPayments.filter(p => p.status === 'processing' || p.status === 'pending').length} transactions
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-red-50 dark:to-red-950">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600 dark:text-red-400">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-red-600 dark:text-red-400">
              ₹{totalFailed.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-gray-500">Requires attention</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-blue-50 dark:to-blue-950">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400">Average Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
              ₹{averagePayment.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-gray-500">Per transaction</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="search">Search Payments</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  id="search"
                  placeholder="Search by student, school, ID..."
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
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Payment Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="annual">Annual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Payment Method</Label>
              <Select value={methodFilter} onValueChange={setMethodFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="All Methods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No payments found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment ID</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>School</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="px-9">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium text-xs">#{payment.id}</TableCell>
                    <TableCell className="font-medium text-xs">{payment.student_name || 'N/A'}</TableCell>
                    <TableCell className="font-medium text-xs">{payment.school_name || 'N/A'}</TableCell>
                    <TableCell className="font-medium text-xs">
                      <Badge variant="outline">{payment.type}</Badge>
                    </TableCell>
                    <TableCell className="font-semibold text-xs">
                      ₹{payment.amount.toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell className="font-semibold text-xs">{payment.mode || 'N/A'}</TableCell>
                    <TableCell className="font-semibold text-xs">
                      {payment.payment_date 
                        ? new Date(payment.payment_date).toLocaleDateString()
                        : new Date(payment.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(payment.status)}
                        <Badge variant={getStatusVariant(payment.status)}>
                          {payment.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => navigate('/accountant/report/transactions')}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Payment Methods Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Accepted Payment Methods</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {[
              { name: "Cash", fee: "Free", processingTime: "Instant" },
              { name: "Bank Transfer", fee: "Free", processingTime: "1-2 business days" },
              { name: "Cheque", fee: "Free", processingTime: "3-5 business days" },
              { name: "Card", fee: "Processing fee may apply", processingTime: "Instant" },
              { name: "Online", fee: "Processing fee may apply", processingTime: "Instant" },
            ].map((method, index) => (
              <div key={index} className="flex flex-col gap-2 p-3 rounded-lg border bg-muted/30">
                <p className="font-medium text-sm">{method.name}</p>
                <p className="text-xs text-gray-500">Fee: {method.fee}</p>
                <p className="text-xs text-gray-500">{method.processingTime}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountantPayments;

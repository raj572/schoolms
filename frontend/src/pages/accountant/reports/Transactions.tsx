import { useState, useEffect } from "react";
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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Search, Download, Eye, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  getPaymentHistory,
  getAccessibleSchools,
  type PaymentHistoryItem,
  type School,
} from "@/services/accountantApiService";

const Transactions = () => {
  const [transactions, setTransactions] = useState<PaymentHistoryItem[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    school_id: undefined as number | undefined,
    start_date: "",
    end_date: "",
    status: "" as "" | "paid" | "due",
    search: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchSchools();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [filters]);

  const fetchSchools = async () => {
    try {
      const response = await getAccessibleSchools();
      if (response.status && response.data) {
        setSchools(response.data);
        if (response.data.length === 1) {
          setFilters((prev) => ({ ...prev, school_id: response.data[0].id }));
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

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await getPaymentHistory(filters);
      if (response.status && response.data) {
        setTransactions(response.data);
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to load payment history",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load payment history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Prepare chart data (last 6 months)
  const prepareChartData = () => {
    const monthlyData: { [key: string]: number } = {};
    transactions.slice(0, 50).forEach((transaction) => {
      if (transaction.payment_date && transaction.status === "paid") {
        const date = new Date(transaction.payment_date);
        const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + transaction.amount;
      }
    });

    return Object.entries(monthlyData)
      .map(([month, amount]) => ({ month, amount: Number(amount) }))
      .slice(-6)
      .reverse();
  };

  const chartData = prepareChartData();

  const chartConfig = {
    amount: {
      label: "Amount",
      color: "hsl(var(--primary))",
    },
  };

  const totalIncome = transactions
    .filter((t) => t.status === "paid")
    .reduce((sum, t) => sum + t.amount, 0);

  const filteredTransactions = transactions.filter((transaction) =>
    transaction.student_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
    transaction.school_name?.toLowerCase().includes(filters.search.toLowerCase())
  );

  return (
    <div className="space-y-6 px-11 py-9 overflow-hidden">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold">Payment History</h1>
          <p className="text-gray-500 text-xs">View and manage all payment transactions</p>
        </div>
        <div className="flex gap-3">
          {schools.length > 1 && (
            <div className="w-64">
              <Select
                value={filters.school_id?.toString() || "all"}
                onValueChange={(value) => {
                  setFilters((prev) => ({
                    ...prev,
                    school_id: value === "all" ? undefined : parseInt(value),
                  }));
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
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-card to-success-light">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-success">Total Collection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-success">
              {formatCurrency(totalIncome)}
            </div>
            <p className="text-xs text-gray-500">All paid transactions</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-primary/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-primary">Transaction Count</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-primary">
              {transactions.filter((t) => t.status === "paid").length}
            </div>
            <p className="text-xs text-gray-500">Paid transactions</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-accent">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{transactions.length}</div>
            <p className="text-xs text-gray-500">All transactions</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-warning/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-warning">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-warning">
              {transactions.filter((t) => t.status === "due").length}
            </div>
            <p className="text-xs text-gray-500">Due transactions</p>
          </CardContent>
        </Card>
      </div>

      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex text-lg items-center gap-2">
              Collection Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--primary))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  id="search"
                  placeholder="Search by student name or school..."
                  className="pl-10"
                  value={filters.search}
                  onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={filters.status || "all"}
                onValueChange={(value: any) => {
                  setFilters((prev) => ({ ...prev, status: value === "all" ? "" : value }));
                }}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="due">Due</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={filters.start_date}
                onChange={(e) => setFilters((prev) => ({ ...prev, start_date: e.target.value }))}
                className="w-[150px]"
              />
            </div>
            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                value={filters.end_date}
                onChange={(e) => setFilters((prev) => ({ ...prev, end_date: e.target.value }))}
                className="w-[150px]"
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setFilters({
                    school_id: schools.length === 1 ? schools[0].id : undefined,
                    start_date: "",
                    end_date: "",
                    status: "",
                    search: "",
                  });
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-xs">Student</TableHead>
                  <TableHead className="text-xs">School</TableHead>
                  <TableHead className="text-xs">Amount</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Payment Date</TableHead>
                  <TableHead className="text-xs">Mode</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((transaction, index) => (
                    <TableRow key={`${transaction.type}-${transaction.id}-${index}`}>
                      <TableCell className="font-medium text-xs">
                        {transaction.type === "monthly" ? "Monthly" : "Annual"}
                      </TableCell>
                      <TableCell className="font-medium text-xs">
                        {transaction.student_name}
                      </TableCell>
                      <TableCell className="text-xs">{transaction.school_name}</TableCell>
                      <TableCell
                        className={`font-semibold text-xs ${
                          transaction.status === "paid" ? "text-success" : "text-warning"
                        }`}
                      >
                        {formatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={transaction.status === "paid" ? "default" : "secondary"}>
                          {transaction.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">
                        {transaction.payment_date
                          ? new Date(transaction.payment_date).toLocaleDateString()
                          : "-"}
                      </TableCell>
                      <TableCell className="text-xs">{transaction.mode || "-"}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                      {filters.search
                        ? "No transactions found matching your search"
                        : "No transactions found"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Transactions;

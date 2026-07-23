import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  FileText, 
  Users, 
  AlertCircle,
  Eye,
  Download,
  Loader2
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { 
  getDashboardStats, 
  getAccessibleSchools,
  type DashboardStats as DashboardStatsType,
  type School 
} from "@/services/accountantApiService";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DashboardProps {
  className?: string;
}

const AccountantDashboard = ({ className }: DashboardProps) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStatsType | null>(null);
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<number | undefined>(undefined);
  const { toast } = useToast();

  const fetchData = async (schoolId?: number) => {
    try {
      setLoading(true);
      
      // Fetch accessible schools if not already loaded
      if (schools.length === 0) {
        const schoolsResponse = await getAccessibleSchools();
        if (schoolsResponse.status && schoolsResponse.data) {
          setSchools(schoolsResponse.data);
        }
      }

      // Fetch dashboard stats
      const statsResponse = await getDashboardStats(schoolId);
      if (statsResponse.status && statsResponse.data) {
        setStats(statsResponse.data);
      } else {
        toast({
          title: "Error",
          description: statsResponse.message || "Failed to load dashboard statistics",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(selectedSchoolId);
  }, [selectedSchoolId]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Prepare chart data from recent transactions (last 6 months)
  const prepareChartData = () => {
    if (!stats?.recent_transactions) return [];
    
    const monthlyData: { [key: string]: number } = {};
    const recent = stats.recent_transactions.slice(0, 20); // Last 20 transactions
    
    recent.forEach((transaction) => {
      if (transaction.payment_date) {
        const date = new Date(transaction.payment_date);
        const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + transaction.total_amount;
      }
    });

    return Object.entries(monthlyData)
      .map(([month, amount]) => ({ month, amount: Number(amount) }))
      .slice(-6)
      .reverse();
  };

  const monthlyRevenue = prepareChartData();

  const chartConfig = {
    amount: {
      label: "Amount",
      color: "hsl(var(--primary))",
    },
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-9 overflow-hidden">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold">Accountant Dashboard</h2>
          <p className="text-gray-500 text-xs">Welcome to your fee management dashboard</p>
        </div>
        {schools.length > 1 && (
          <div className="w-64">
            <Select
              value={selectedSchoolId?.toString() || "all"}
              onValueChange={(value) => {
                setSelectedSchoolId(value === "all" ? undefined : parseInt(value));
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="bg-gradient-to-br from-card to-accent border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {stats ? formatCurrency(stats.total_revenue) : "₹0"}
            </div>
            <p className="text-xs text-gray-500">
              All time collection
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-success-light border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students with Fees</CardTitle>
            <Users className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-success">
              {stats?.total_students_with_fees || 0}
            </div>
            <p className="text-xs text-gray-500">
              Active fee records
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-warning-light border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Dues</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-warning">
              {stats ? formatCurrency(stats.pending_dues) : "₹0"}
            </div>
            <p className="text-xs text-gray-500">
              Outstanding payments
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-accent border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {stats ? formatCurrency(stats.this_month_revenue) : "₹0"}
            </div>
            <p className="text-xs text-gray-500">
              Current month collection
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex text-lg items-center gap-2">
              <BarChart className="h-5 w-5 text-primary" />
              Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyRevenue.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyRevenue} className="px-14">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip 
                      content={<ChartTooltipContent />}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No revenue data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex text-lg items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                <span className="text-sm">Total Revenue</span>
                <span className="font-bold">{stats ? formatCurrency(stats.total_revenue) : "₹0"}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                <span className="text-sm">Pending Dues</span>
                <span className="font-bold text-warning">{stats ? formatCurrency(stats.pending_dues) : "₹0"}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                <span className="text-sm">This Month</span>
                <span className="font-bold text-success">{stats ? formatCurrency(stats.this_month_revenue) : "₹0"}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                <span className="text-sm">Students</span>
                <span className="font-bold">{stats?.total_students_with_fees || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex text-lg items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.recent_transactions && stats.recent_transactions.length > 0 ? (
            <div className="space-y-4 text-sm">
              {stats.recent_transactions.slice(0, 10).map((transaction, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium">
                      {transaction.student?.candidate_name || "N/A"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {transaction.student?.class || ""} • {transaction.month || "N/A"}
                      {transaction.school?.name && ` • ${transaction.school.name}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(transaction.total_amount)}</p>
                    <Badge 
                      variant={transaction.status === "paid" ? "default" : "secondary"}
                      className="mt-1"
                    >
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              No recent transactions found
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="mt-8 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              className="h-20 flex flex-col gap-2" 
              variant="outline"
              onClick={() => window.location.href = "/accountant/report/fee"}
            >
              <FileText className="h-6 w-6" />
              Fee Reports
            </Button>
            <Button 
              className="h-20 flex flex-col gap-2" 
              variant="outline"
              onClick={() => window.location.href = "/accountant/monthly-dues"}
            >
              <DollarSign className="h-6 w-6" />
              Monthly Dues
            </Button>
            <Button 
              className="h-20 flex flex-col gap-2" 
              variant="outline"
              onClick={() => window.location.href = "/accountant/report/dues-pending"}
            >
              <AlertCircle className="h-6 w-6" />
              Pending Dues
            </Button>
            <Button 
              className="h-20 flex flex-col gap-2" 
              variant="outline"
              onClick={() => window.location.href = "/accountant/report/transactions"}
            >
              <Download className="h-6 w-6" />
              Transactions
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountantDashboard;

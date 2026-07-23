import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Download, Calendar, FileText, DollarSign, Users, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  getFeeCollectionReport,
  getAccessibleSchools,
  type FeeCollectionReport,
  type School,
} from "@/services/accountantApiService";

const AccountantFeeReports = () => {
  const [reportData, setReportData] = useState<FeeCollectionReport | null>(null);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    school_id: undefined as number | undefined,
    start_date: "",
    end_date: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchSchools();
  }, []);

  useEffect(() => {
    fetchReport();
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

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await getFeeCollectionReport(filters);
      if (response.status && response.data) {
        setReportData(response.data);
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to load fee collection report",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load fee collection report",
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

  // Prepare chart data from collection by school
  const chartData = reportData?.collection_by_school?.map((item) => ({
    school: item.school?.name || `School ${item.school_id}`,
    amount: Number(item.total || 0),
  })) || [];

  const chartConfig = {
    amount: {
      label: "Amount",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <div className="space-y-8 overflow-hidden px-12 py-9">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold">Fee Collection Report</h1>
          <p className="text-gray-500 text-xs">Generate comprehensive fee collection reports</p>
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

      {/* Date Range Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap">
            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={filters.start_date}
                onChange={(e) => setFilters((prev) => ({ ...prev, start_date: e.target.value }))}
                className="w-[200px]"
              />
            </div>
            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                value={filters.end_date}
                onChange={(e) => setFilters((prev) => ({ ...prev, end_date: e.target.value }))}
                className="w-[200px]"
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
                  });
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="bg-gradient-to-br from-card to-primary/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Collection</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-primary">
                  {formatCurrency(reportData?.total_collection || 0)}
                </div>
                <p className="text-xs text-gray-500">
                  {reportData?.period.start_date && reportData?.period.end_date
                    ? `${new Date(reportData.period.start_date).toLocaleDateString()} - ${new Date(reportData.period.end_date).toLocaleDateString()}`
                    : "All time"}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-card to-success-light">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-success">Transaction Count</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-success">
                  {reportData?.transaction_count || 0}
                </div>
                <p className="text-xs text-gray-500">Total transactions</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-card to-accent">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Average Transaction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">
                  {reportData?.transaction_count && reportData?.transaction_count > 0
                    ? formatCurrency((reportData.total_collection || 0) / reportData.transaction_count)
                    : formatCurrency(0)}
                </div>
                <p className="text-xs text-gray-500">Per transaction</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-card to-warning/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-warning">Schools</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-warning">
                  {reportData?.collection_by_school?.length || 0}
                </div>
                <p className="text-xs text-gray-500">Active schools</p>
              </CardContent>
            </Card>
          </div>

          {chartData.length > 0 && (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex text-lg items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    Collection by School
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%" className="px-20">
                      <BarChart data={chartData} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="school" type="category" width={120} />
                        <ChartTooltip 
                          content={<ChartTooltipContent />}
                          formatter={(value: number) => formatCurrency(value)}
                        />
                        <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex text-lg items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    School-wise Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reportData?.collection_by_school?.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div>
                          <p className="font-medium text-sm">
                            {item.school?.name || `School ${item.school_id}`}
                          </p>
                          <p className="text-xs text-gray-500">Collection</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm">
                            {formatCurrency(Number(item.total || 0))}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {chartData.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                No collection data available for the selected period
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default AccountantFeeReports;

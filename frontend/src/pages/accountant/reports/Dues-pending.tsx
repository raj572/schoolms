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
import { AlertTriangle, Mail, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  getPendingDuesReport,
  getAccessibleSchools,
  type PendingDuesReport,
  type School,
} from "@/services/accountantApiService";

const AccountantDues = () => {
  const [reportData, setReportData] = useState<PendingDuesReport | null>(null);
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchSchools();
  }, []);

  useEffect(() => {
    fetchReport();
  }, [selectedSchoolId]);

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

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await getPendingDuesReport(
        selectedSchoolId ? { school_id: selectedSchoolId } : undefined
      );
      if (response.status && response.data) {
        setReportData(response.data);
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to load pending dues report",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load pending dues report",
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

  const getDuePriority = (status: string) => {
    if (status === "due") return { level: "due", color: "warning" as const };
    return { level: "overdue", color: "destructive" as const };
  };

  const allPendingDues = [
    ...(reportData?.monthly_pending?.map((p) => ({
      ...p,
      type: "monthly",
      studentName: p.student?.candidate_name || "N/A",
      studentClass: p.student?.class || "N/A",
    })) || []),
    ...(reportData?.annual_pending?.map((p) => ({
      ...p,
      type: "annual",
      studentName: p.studentDetail?.candidate_name || "N/A",
      studentClass: p.studentDetail?.class || "N/A",
    })) || []),
  ];

  const filteredDues = allPendingDues.filter((due) =>
    due.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    due.studentClass?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate summary stats
  const dueToday = allPendingDues.filter((due) => {
    // Simple check - can be enhanced with actual due date comparison
    return due.status === "due";
  });

  const overdue1to7 = allPendingDues.filter((due) => {
    return due.status === "due" && due.type === "monthly";
  });

  const overdue7Plus = allPendingDues.filter((due) => {
    return due.status === "due" && due.type === "annual";
  });

  const dueTodayAmount = dueToday.reduce((sum, due) => sum + (due.total_amount || 0), 0);
  const overdue1to7Amount = overdue1to7.reduce((sum, due) => sum + (due.total_amount || 0), 0);
  const overdue7PlusAmount = overdue7Plus.reduce((sum, due) => sum + (due.total_amount || 0), 0);

  return (
    <div className="space-y-8 px-16 py-9">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold">Pending Dues</h1>
          <p className="text-gray-500 text-xs">Track overdue payments and follow up with students</p>
        </div>
        <div className="flex gap-3">
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
          <Button onClick={fetchReport} variant="outline" className="gap-2">
            <Mail className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="bg-gradient-to-br from-card to-warning-light">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-warning">Due Today</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-warning">
                  {formatCurrency(dueTodayAmount)}
                </div>
                <p className="text-xs text-gray-500">{dueToday.length} records</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-card to-destructive/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-destructive">1-7 Days Overdue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-destructive">
                  {formatCurrency(overdue1to7Amount)}
                </div>
                <p className="text-xs text-gray-500">{overdue1to7.length} records</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-card to-destructive/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-destructive">7+ Days Overdue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-destructive">
                  {formatCurrency(overdue7PlusAmount)}
                </div>
                <p className="text-xs text-gray-500">{overdue7Plus.length} records</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-card to-primary/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-primary">Total Outstanding</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-primary">
                  {formatCurrency(reportData?.total_pending_amount || 0)}
                </div>
                <p className="text-xs text-gray-500">
                  {reportData?.total_students_with_pending || 0} students
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <Label htmlFor="search">Search</Label>
                  <Input
                    id="search"
                    placeholder="Search by student name or class..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex text-lg items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Outstanding Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Student</TableHead>
                    <TableHead className="text-xs">Class</TableHead>
                    <TableHead className="text-xs">Type</TableHead>
                    <TableHead className="text-xs">Amount</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">School</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDues.length > 0 ? (
                    filteredDues.map((due, index) => {
                      const priority = getDuePriority(due.status);
                      return (
                        <TableRow key={`${due.type}-${due.id}-${index}`}>
                          <TableCell className="text-xs">
                            <div>
                              <p className="font-medium text-xs">{due.studentName}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs">{due.studentClass}</TableCell>
                          <TableCell className="text-xs">
                            {due.type === "monthly" ? "Monthly Fee" : "Annual Fee"}
                            {due.type === "monthly" && due.month && ` - ${due.month}`}
                          </TableCell>
                          <TableCell className="font-semibold text-xs">
                            {formatCurrency(due.total_amount || 0)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={priority.color === "warning" ? "default" : priority.color}>
                              {due.status.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs">
                            {(due as any).school?.name || (due as any).school?.name || "N/A"}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                        {searchTerm
                          ? "No pending dues found matching your search"
                          : "No pending dues found"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default AccountantDues;

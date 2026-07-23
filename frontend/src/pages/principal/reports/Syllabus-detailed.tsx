import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Download, Search } from "lucide-react";
import { getPrincipalDetailedView, DetailedView } from "@/services/syllabusApiService";
import { useToast } from "@/hooks/use-toast";

export default function SyllabusDetailed() {
  const { toast } = useToast();
  const [data, setData] = useState<DetailedView[]>([]);
  const [filteredData, setFilteredData] = useState<DetailedView[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    teacher_id: "",
    class_id: "",
    subject_id: "",
  });

  // Extract unique values for filters
  const teachers = Array.from(new Set(data.map((d) => ({ id: d.teacher_id, name: d.teacher_name }))));
  const classes = Array.from(
    new Set(data.map((d) => ({ id: d.class_id, name: `${d.class_name}-${d.section}` })))
  );
  const subjects = Array.from(
    new Set(data.map((d) => ({ id: d.subject_id, name: d.subject_name })))
  );

  useEffect(() => {
    fetchDetailedView();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [data, searchTerm, filters]);

  const fetchDetailedView = async () => {
    try {
      setIsLoading(true);
      const response = await getPrincipalDetailedView();
      if (response.status) {
        setData(response.data || []);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.message || "Failed to load data",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load detailed view",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...data];

    // Apply filters
    if (filters.teacher_id) {
      filtered = filtered.filter((d) => d.teacher_id.toString() === filters.teacher_id);
    }
    if (filters.class_id) {
      filtered = filtered.filter((d) => d.class_id.toString() === filters.class_id);
    }
    if (filters.subject_id) {
      filtered = filtered.filter((d) => d.subject_id.toString() === filters.subject_id);
    }

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.teacher_name.toLowerCase().includes(term) ||
          d.class_name.toLowerCase().includes(term) ||
          d.subject_name.toLowerCase().includes(term) ||
          d.section.toLowerCase().includes(term)
      );
    }

    setFilteredData(filtered);
  };

  const handleExport = () => {
    // Create CSV content
    const headers = [
      "Teacher Name",
      "Class",
      "Section",
      "Subject",
      "Total Chapters",
      "Completed",
      "Percentage",
      "Last Updated",
    ];
    const rows = filteredData.map((d) => [
      d.teacher_name,
      d.class_name,
      d.section,
      d.subject_name,
      d.total_chapters,
      d.completed_chapters,
      `${d.completion_percentage.toFixed(1)}%`,
      d.last_updated || "N/A",
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `syllabus-completion-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();

    toast({
      title: "Success",
      description: "Data exported successfully",
    });
  };

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 75) return "text-success";
    if (percentage >= 50) return "text-warning";
    return "text-destructive";
  };

  const getCompletionBg = (percentage: number) => {
    if (percentage >= 75) return "bg-success/10";
    if (percentage >= 50) return "bg-warning/10";
    return "bg-destructive/10";
  };

  const clearFilters = () => {
    setFilters({ teacher_id: "", class_id: "", subject_id: "" });
    setSearchTerm("");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in px-16 py-9">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold">Syllabus Completion - Detailed View</h1>
          <p className="text-gray-500 text-xs mt-1">
            Detailed breakdown of syllabus completion with filters
          </p>
        </div>
        <Button onClick={handleExport} disabled={filteredData.length === 0}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-gradient-card shadow-md border-0">
        <CardHeader>
          <CardTitle className="text-md">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label>Teacher</Label>
              <Select
                value={filters.teacher_id}
                onValueChange={(value) => setFilters({ ...filters, teacher_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Teachers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Teachers</SelectItem>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id.toString()}>
                      {teacher.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Class</Label>
              <Select
                value={filters.class_id}
                onValueChange={(value) => setFilters({ ...filters, class_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Classes</SelectItem>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id.toString()}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Subject</Label>
              <Select
                value={filters.subject_id}
                onValueChange={(value) => setFilters({ ...filters, subject_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Subjects</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id.toString()}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear Filters
            </Button>
            <div className="text-sm text-muted-foreground flex items-center">
              Showing {filteredData.length} of {data.length} records
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card className="bg-gradient-card shadow-md border-0">
        <CardContent className="p-0">
          {filteredData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary/30">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-medium">Teacher</th>
                    <th className="text-left py-3 px-4 text-xs font-medium">Class</th>
                    <th className="text-left py-3 px-4 text-xs font-medium">Subject</th>
                    <th className="text-center py-3 px-4 text-xs font-medium">Total</th>
                    <th className="text-center py-3 px-4 text-xs font-medium">Completed</th>
                    <th className="text-center py-3 px-4 text-xs font-medium">Percentage</th>
                    <th className="text-left py-3 px-4 text-xs font-medium">Last Updated</th>
                    <th className="text-right py-3 px-4 text-xs font-medium">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-secondary/20">
                      <td className="py-3 px-4 text-sm">{item.teacher_name}</td>
                      <td className="py-3 px-4 text-sm">
                        {item.class_name}-{item.section}
                      </td>
                      <td className="py-3 px-4 text-sm">{item.subject_name}</td>
                      <td className="text-center py-3 px-4 text-sm">{item.total_chapters}</td>
                      <td className="text-center py-3 px-4 text-sm">{item.completed_chapters}</td>
                      <td className="text-center py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCompletionBg(
                            item.completion_percentage
                          )} ${getCompletionColor(item.completion_percentage)}`}
                        >
                          {item.completion_percentage.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {item.last_updated
                          ? new Date(item.last_updated).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="py-3 px-4">
                        <div className="w-24 bg-secondary/30 rounded-full h-2 ml-auto">
                          <div
                            className="h-2 rounded-full bg-primary"
                            style={{ width: `${item.completion_percentage}%` }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <p className="text-muted-foreground">No records found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


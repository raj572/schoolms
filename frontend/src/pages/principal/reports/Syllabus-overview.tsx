import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Loader2, TrendingUp, CheckCircle, AlertCircle } from "lucide-react";
import { getPrincipalOverview, PrincipalOverview } from "@/services/syllabusApiService";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export default function SyllabusOverview() {
  const { toast } = useToast();
  const [overview, setOverview] = useState<PrincipalOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    try {
      setIsLoading(true);
      const response = await getPrincipalOverview();
      if (response.status) {
        setOverview(response.data);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.message || "Failed to load overview",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load overview data",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="p-16">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">No data available</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { statistics, classwise, subjectwise, teacherwise } = overview;

  // Prepare pie chart data
  const pieData = [
    { name: "Completed", value: statistics.completed_subjects, color: "#10b981" },
    {
      name: "In Progress",
      value: statistics.total_subjects - statistics.completed_subjects - statistics.behind_schedule,
      color: "#f59e0b",
    },
    { name: "Behind", value: statistics.behind_schedule, color: "#ef4444" },
  ];

  return (
    <div className="space-y-6 animate-fade-in px-16 py-9">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold">Syllabus Completion Overview</h1>
        <p className="text-gray-500 text-xs mt-1">
          Monitor syllabus completion across all classes and subjects
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-card shadow-md border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Total Subjects</p>
                <p className="text-lg font-bold text-foreground">{statistics.total_subjects}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-md border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Average Completion</p>
                <p className="text-lg font-bold text-foreground">
                  {statistics.average_completion.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-md border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-info/10 rounded-lg">
                <CheckCircle className="w-5 h-5 text-info" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Completed</p>
                <p className="text-lg font-bold text-foreground">{statistics.completed_subjects}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-md border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <AlertCircle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Behind Schedule</p>
                <p className="text-lg font-bold text-foreground">{statistics.behind_schedule}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Class-wise Completion */}
        <Card className="bg-gradient-card shadow-md border-0">
          <CardHeader>
            <CardTitle className="text-md">Class-wise Completion</CardTitle>
          </CardHeader>
          <CardContent>
            {classwise.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={classwise}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="class_name"
                      tickFormatter={(value, index) => {
                        const item = classwise[index];
                        return `${value}-${item.section}`;
                      }}
                    />
                    <YAxis domain={[0, 100]} />
                    <Tooltip
                      formatter={(value: number) => [`${value.toFixed(1)}%`, "Completion"]}
                      labelFormatter={(label, payload) => {
                        if (payload && payload.length > 0) {
                          const data = payload[0].payload;
                          return `Class ${data.class_name}-${data.section}`;
                        }
                        return label;
                      }}
                    />
                    <Bar dataKey="average_completion" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No data available</p>
            )}
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="bg-gradient-card shadow-md border-0">
          <CardHeader>
            <CardTitle className="text-md">Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.some((d) => d.value > 0) ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Subject-wise Breakdown */}
      <Card className="bg-gradient-card shadow-md border-0">
        <CardHeader>
          <CardTitle className="text-md">Subject-wise Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {subjectwise.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4 text-sm font-medium">Subject</th>
                    <th className="text-center py-2 px-4 text-sm font-medium">Total Classes</th>
                    <th className="text-center py-2 px-4 text-sm font-medium">Avg Completion</th>
                    <th className="text-right py-2 px-4 text-sm font-medium">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {subjectwise.map((subject) => (
                    <tr key={subject.subject_id} className="border-b hover:bg-secondary/30">
                      <td className="py-2 px-4 text-sm">{subject.subject_name}</td>
                      <td className="text-center py-2 px-4 text-sm">{subject.total_classes}</td>
                      <td className="text-center py-2 px-4 text-sm font-medium">
                        {subject.average_completion.toFixed(1)}%
                      </td>
                      <td className="py-2 px-4">
                        <div className="w-full bg-secondary/30 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-primary"
                            style={{ width: `${subject.average_completion}%` }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No subjects data available</p>
          )}
        </CardContent>
      </Card>

      {/* Teacher-wise Performance */}
      <Card className="bg-gradient-card shadow-md border-0">
        <CardHeader>
          <CardTitle className="text-md">Teacher-wise Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {teacherwise.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4 text-sm font-medium">Teacher Name</th>
                    <th className="text-center py-2 px-4 text-sm font-medium">Total Subjects</th>
                    <th className="text-center py-2 px-4 text-sm font-medium">Avg Completion</th>
                    <th className="text-right py-2 px-4 text-sm font-medium">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {teacherwise.map((teacher) => (
                    <tr key={teacher.teacher_id} className="border-b hover:bg-secondary/30">
                      <td className="py-2 px-4 text-sm">{teacher.teacher_name}</td>
                      <td className="text-center py-2 px-4 text-sm">{teacher.total_subjects}</td>
                      <td className="text-center py-2 px-4 text-sm font-medium">
                        {teacher.average_completion.toFixed(1)}%
                      </td>
                      <td className="py-2 px-4">
                        <div className="w-full bg-secondary/30 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-primary"
                            style={{ width: `${teacher.average_completion}%` }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No teachers data available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


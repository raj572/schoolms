import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  BookOpen,
  Loader2,
  Edit,
  TrendingUp,
  CheckCircle,
  Clock,
} from "lucide-react";
import {
  getTeacherCompletion,
  updateCompletion,
  getCompletionHistory,
  SyllabusCompletion,
  CompletionHistory,
} from "@/services/syllabusApiService";
import { useToast } from "@/hooks/use-toast";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function SyllabusCompletionPage() {
  const { toast } = useToast();
  const [completions, setCompletions] = useState<SyllabusCompletion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [selectedCompletion, setSelectedCompletion] = useState<SyllabusCompletion | null>(null);
  const [history, setHistory] = useState<CompletionHistory[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    total_chapters: 0,
    completed_chapters: 0,
    remarks: "",
  });

  useEffect(() => {
    fetchCompletions();
  }, []);

  const fetchCompletions = async () => {
    try {
      setIsLoading(true);
      const response = await getTeacherCompletion();
      if (response.status) {
        setCompletions(response.data || []);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.message || "Failed to load completions",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load completion data",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (completion: SyllabusCompletion) => {
    setSelectedCompletion(completion);
    setFormData({
      total_chapters: completion.total_chapters,
      completed_chapters: completion.completed_chapters,
      remarks: completion.remarks || "",
    });
    setIsDialogOpen(true);
  };

  const handleViewHistory = async (completion: SyllabusCompletion) => {
    try {
      setSelectedCompletion(completion);
      const response = await getCompletionHistory(completion.class_id, completion.subject_id);
      if (response.status) {
        setHistory(response.data || []);
        setIsHistoryDialogOpen(true);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.message || "Failed to load history",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load history",
      });
    }
  };

  const handleSubmit = async () => {
    if (!selectedCompletion) return;

    if (formData.completed_chapters > formData.total_chapters) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Completed chapters cannot exceed total chapters",
      });
      return;
    }

    if (formData.total_chapters < 0 || formData.completed_chapters < 0) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Chapters cannot be negative",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await updateCompletion({
        class_id: selectedCompletion.class_id,
        subject_id: selectedCompletion.subject_id,
        total_chapters: formData.total_chapters,
        completed_chapters: formData.completed_chapters,
        remarks: formData.remarks,
      });

      if (response.status) {
        toast({
          title: "Success",
          description: "Completion updated successfully",
        });
        setIsDialogOpen(false);
        fetchCompletions();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.message || "Failed to update completion",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update completion",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCompletionColor = (percentage: number) => {
    if (percentage === 100) return "text-success";
    if (percentage >= 75) return "text-success";
    if (percentage >= 50) return "text-warning";
    return "text-destructive";
  };

  const getCompletionBadge = (percentage: number) => {
    if (percentage === 100) return { label: "Completed", variant: "default" as const };
    if (percentage >= 75) return { label: "On Track", variant: "secondary" as const };
    if (percentage >= 50) return { label: "In Progress", variant: "secondary" as const };
    return { label: "Behind", variant: "destructive" as const };
  };

  const totalSubjects = completions.length;
  const averageCompletion = completions.length > 0
    ? completions.reduce((sum, c) => sum + c.completion_percentage, 0) / completions.length
    : 0;
  const completedSubjects = completions.filter((c) => c.completion_percentage === 100).length;

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
      <div>
        <h1 className="text-lg font-bold">Syllabus Completion</h1>
        <p className="text-gray-500 text-xs mt-1">
          Track and update your syllabus completion progress
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-card shadow-md border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Total Subjects</p>
                <p className="text-lg font-bold text-foreground">{totalSubjects}</p>
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
                <p className="text-lg font-bold text-foreground">{averageCompletion.toFixed(1)}%</p>
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
                <p className="text-xs font-medium text-muted-foreground">Completed Subjects</p>
                <p className="text-lg font-bold text-foreground">{completedSubjects}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Completions Grid */}
      {completions.length === 0 ? (
        <Card className="bg-gradient-card shadow-md">
          <CardContent className="p-12 text-center">
            <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Subjects Assigned</h3>
            <p className="text-sm text-muted-foreground">
              You don't have any subjects assigned yet
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {completions.map((completion) => {
            const badge = getCompletionBadge(completion.completion_percentage);
            return (
              <Card
                key={completion.id}
                className="bg-gradient-card shadow-md hover:shadow-hover transition-all duration-300 border-l-4 border-primary"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-md font-semibold text-foreground">
                        {completion.subject_name}
                      </CardTitle>
                      <p className="text-xs text-gray-500 mt-1">
                        Class {completion.class_name}-{completion.section}
                      </p>
                    </div>
                    <Badge variant={badge.variant} className="text-xs">
                      {badge.label}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-muted-foreground">Progress</span>
                      <span
                        className={`font-medium ${getCompletionColor(
                          completion.completion_percentage
                        )}`}
                      >
                        {completion.completion_percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-secondary/30 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-500 bg-primary"
                        style={{ width: `${completion.completion_percentage}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Total Chapters</p>
                      <p className="font-medium">{completion.total_chapters}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Completed</p>
                      <p className="font-medium">{completion.completed_chapters}</p>
                    </div>
                  </div>

                  {completion.last_updated && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>Updated: {new Date(completion.last_updated).toLocaleDateString()}</span>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEdit(completion)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Update
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewHistory(completion)}
                    >
                      History
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Syllabus Completion</DialogTitle>
            <DialogDescription>
              Update the completion status for {selectedCompletion?.subject_name} - Class{" "}
              {selectedCompletion?.class_name}-{selectedCompletion?.section}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="total_chapters">Total Chapters</Label>
              <Input
                id="total_chapters"
                type="number"
                min="0"
                value={formData.total_chapters}
                onChange={(e) =>
                  setFormData({ ...formData, total_chapters: parseInt(e.target.value) || 0 })
                }
              />
            </div>

            <div>
              <Label htmlFor="completed_chapters">Completed Chapters</Label>
              <Input
                id="completed_chapters"
                type="number"
                min="0"
                max={formData.total_chapters}
                value={formData.completed_chapters}
                onChange={(e) =>
                  setFormData({ ...formData, completed_chapters: parseInt(e.target.value) || 0 })
                }
              />
            </div>

            <div>
              <Label htmlFor="remarks">Remarks (Optional)</Label>
              <Textarea
                id="remarks"
                placeholder="Add any notes or comments..."
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              />
            </div>

            {formData.total_chapters > 0 && (
              <div className="p-3 bg-secondary/30 rounded-lg">
                <p className="text-sm font-medium mb-1">Completion Percentage</p>
                <p className="text-2xl font-bold text-primary">
                  {formData.total_chapters > 0
                    ? ((formData.completed_chapters / formData.total_chapters) * 100).toFixed(1)
                    : 0}
                  %
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Completion History</DialogTitle>
            <DialogDescription>
              Progress tracking for {selectedCompletion?.subject_name} - Class{" "}
              {selectedCompletion?.class_name}-{selectedCompletion?.section}
            </DialogDescription>
          </DialogHeader>

          {history.length > 0 ? (
            <div className="space-y-4">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="recorded_date"
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <YAxis domain={[0, 100]} />
                    <Tooltip
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      formatter={(value: number) => [`${value.toFixed(1)}%`, "Completion"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="completion_percentage"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-2">
                {history.map((record, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-secondary/30 rounded-lg"
                  >
                    <span className="text-sm">{new Date(record.recorded_date).toLocaleDateString()}</span>
                    <div className="text-sm">
                      <span className="font-medium">{record.completed_chapters} chapters</span>
                      <span className="text-muted-foreground ml-2">
                        ({record.completion_percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No history available</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}


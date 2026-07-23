import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { 
  Calculator, 
  Save, 
  Download, 
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Users
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const MarkEntry = () => {
  const { toast } = useToast();
  const [selectedExam, setSelectedExam] = useState("");
  const [marks, setMarks] = useState<Record<string, string>>({});

  const exams = [
    { id: "math-final", name: "Mathematics Final - Class 12A", maxMarks: 100 },
    { id: "physics-mid", name: "Physics Midterm - Class 11B", maxMarks: 80 },
    { id: "chem-quiz", name: "Chemistry Quiz - Class 10C", maxMarks: 50 },
  ];

  const students = [
    { id: 1, name: "Alice Johnson", rollNo: "12A001", previousAvg: 85 },
    { id: 2, name: "Bob Smith", rollNo: "12A002", previousAvg: 78 },
    { id: 3, name: "Carol Davis", rollNo: "12A003", previousAvg: 92 },
    { id: 4, name: "David Wilson", rollNo: "12A004", previousAvg: 88 },
    { id: 5, name: "Eva Brown", rollNo: "12A005", previousAvg: 73 },
    { id: 6, name: "Frank Miller", rollNo: "12A006", previousAvg: 95 },
  ];

  const handleMarkChange = (studentId: number, value: string) => {
    setMarks(prev => ({
      ...prev,
      [studentId]: value
    }));
  };

  const calculateGrade = (marks: number, maxMarks: number) => {
    const percentage = (marks / maxMarks) * 100;
    if (percentage >= 90) return { grade: "A+", color: "text-success" };
    if (percentage >= 80) return { grade: "A", color: "text-success" };
    if (percentage >= 70) return { grade: "B", color: "text-primary" };
    if (percentage >= 60) return { grade: "C", color: "text-warning" };
    if (percentage >= 50) return { grade: "D", color: "text-warning" };
    return { grade: "F", color: "text-destructive" };
  };

  const getSelectedExamData = () => {
    return exams.find(exam => exam.id === selectedExam);
  };

  const calculateStats = () => {
    const validMarks = Object.values(marks)
      .map(mark => parseFloat(mark))
      .filter(mark => !isNaN(mark) && mark >= 0);

    if (validMarks.length === 0) return null;

    const total = validMarks.reduce((sum, mark) => sum + mark, 0);
    const average = total / validMarks.length;
    const highest = Math.max(...validMarks);
    const lowest = Math.min(...validMarks);

    return { average, highest, lowest, submitted: validMarks.length };
  };

  const stats = calculateStats();
  const examData = getSelectedExamData();

  const handleSave = () => {
    toast({
      title: "Marks Saved",
      description: "Student marks have been saved successfully.",
    });
  };

  const handleSubmit = () => {
    toast({
      title: "Marks Submitted",
      description: "All marks have been submitted and finalized.",
    });
  };

  return (
    <div className="p-6 space-y-6 m-4 ml-9 w-[1043px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Mark Entry</h2>
          <p className="text-gray-500 text-xs">Enter and manage student exam marks</p>
        </div>
        <div className="flex gap-2">
          <Button >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button onClick={handleSave} >
            <Save className=" h-4 w-4" />
            Save Progress
          </Button>
        </div>
      </div>

      {/* Exam Selection */}
      <Card className="shadow-card ">
        <CardHeader>
          <CardTitle className=" text-md flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Select Exam
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="exam-select">Exam</Label>
              <Select value={selectedExam} onValueChange={setSelectedExam}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an exam to enter marks" />
                </SelectTrigger>
                <SelectContent>
                  {exams.map((exam) => (
                    <SelectItem key={exam.id} value={exam.id}>
                      {exam.name} (Max: {exam.maxMarks})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {examData && (
              <div className="flex items-end">
                <Badge variant="outline" className="h-fit">
                  Maximum Marks: {examData.maxMarks}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedExam && (
        <>
          {/* Statistics */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="shadow-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Users className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Submitted</p>
                      <p className="text-lg font-bold">{stats.submitted}/{students.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-8 w-8 text-success" />
                    <div>
                      <p className="text-sm text-muted-foreground">Average</p>
                      <p className="text-lg font-bold">{stats.average.toFixed(1)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card w-[250px]">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-8 w-8 text-success" />
                    <div>
                      <p className="text-sm text-muted-foreground">Highest</p>
                      <p className="text-lg font-bold">{stats.highest}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-8 w-8 text-warning" />
                    <div>
                      <p className="text-sm text-muted-foreground">Lowest</p>
                      <p className="text-lg font-bold">{stats.lowest}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Mark Entry Table */}
          <Card className="shadow-card ">
            <CardHeader>
              <CardTitle className="text-lg">Student Marks</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Roll No.</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Previous Avg</TableHead>
                    <TableHead>Marks Obtained</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-xs">
                  {students.map((student) => {
                    const studentMarks = parseFloat(marks[student.id] || "");
                    const isValidMark = !isNaN(studentMarks) && studentMarks >= 0 && examData && studentMarks <= examData.maxMarks;
                    const gradeInfo = isValidMark && examData ? calculateGrade(studentMarks, examData.maxMarks) : null;
                    const percentage = isValidMark && examData ? ((studentMarks / examData.maxMarks) * 100).toFixed(1) : null;

                    return (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.rollNo}</TableCell>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{student.previousAvg}%</span>
                            <Progress value={student.previousAvg} className="w-16 h-2" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            placeholder="Enter marks"
                            value={marks[student.id] || ""}
                            onChange={(e) => handleMarkChange(student.id, e.target.value)}
                            className="w-24"
                            max={examData?.maxMarks}
                            min="0"
                          />
                        </TableCell>
                        <TableCell>
                          {gradeInfo && (
                            <Badge className={`${gradeInfo.color} bg-transparent border`}>
                              {gradeInfo.grade}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{percentage ? `${percentage}%` : "-"}</TableCell>
                        <TableCell>
                          {isValidMark ? (
                            <CheckCircle className="h-4 w-4 text-success" />
                          ) : (
                            marks[student.id] ? (
                              <AlertCircle className="h-4 w-4 text-destructive" />
                            ) : (
                              <div className="w-4 h-4" />
                            )
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                <Button variant="outline">Reset All</Button>
                <Button onClick={handleSubmit} >
                  Submit Final Marks
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default MarkEntry;
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Award, Download } from "lucide-react";
import { exportToCsv } from "@/lib/exportUtils";
import { toast } from "sonner";

export default function ReportCard() {
  const student = {
    name: "Rahul Singh",
    rollNo: "894",
    class: "12th",
  };

  const subjects = [
    { subject: "Mathematics", maxMarks: 100, obtained: 92 },
    { subject: "Physics", maxMarks: 100, obtained: 85 },
    { subject: "Computer Science", maxMarks: 100, obtained: 95 },
    { subject: "Chemistry", maxMarks: 100, obtained: 88 },
    { subject: "Literature", maxMarks: 100, obtained: 80 },
  ];

  const totalMax = subjects.reduce((acc, s) => acc + s.maxMarks, 0);
  const totalObtained = subjects.reduce((acc, s) => acc + s.obtained, 0);
  const percentage = ((totalObtained / totalMax) * 100).toFixed(2);

  const getGrade = (percent: number) => {
    if (percent >= 90) return "A+";
    if (percent >= 80) return "A";
    if (percent >= 70) return "B+";
    if (percent >= 60) return "B";
    return "C";
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A+": return "text-emerald-600 dark:text-emerald-400";
      case "A": return "text-blue-600 dark:text-blue-400";
      case "B+": return "text-amber-600 dark:text-amber-400";
      case "B": return "text-orange-600 dark:text-orange-400";
      default: return "text-muted-foreground";
    }
  };

  const overallGrade = getGrade(Number(percentage));

  const handleDownload = () => {
    const headers = ["Subject", "Max Marks", "Obtained Marks"];
    const rows = subjects.map(s => [s.subject, s.maxMarks, s.obtained]);
    rows.push(["Total", totalMax, totalObtained]);
    rows.push(["Percentage", `${percentage}%`, `Grade: ${overallGrade}`]);
    exportToCsv(`report_card_${student.rollNo}.csv`, headers, rows);
    toast.success(`Report Card downloaded for ${student.name}`);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-full">
      <div>
        <h1 className="text-xl font-bold text-foreground">Student Report Card</h1>
        <p className="text-muted-foreground text-xs mt-1">Semester Examination Result</p>
      </div>

      <Card className="border shadow-md">
        <CardHeader>
          <CardTitle className="flex text-md items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            {student.name}
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Roll No: {student.rollNo} • Class {student.class}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">

          {/* Subject-wise Marks Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead className="text-right">Max Marks</TableHead>
                  <TableHead className="text-right">Obtained</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subjects.map((subj, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-xs">{subj.subject}</TableCell>
                    <TableCell className="text-xs text-right">{subj.maxMarks}</TableCell>
                    <TableCell className="text-xs text-right font-medium">{subj.obtained}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col md:flex-row md:justify-between gap-4 pt-4 border-t">
            <div>
              <p className="font-semibold text-sm">Total Marks: {totalObtained}/{totalMax}</p>
              <p className="font-semibold text-xs text-muted-foreground">Percentage: {percentage}%</p>
            </div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-sm">Overall Grade:</p>
              <Badge variant="outline">
                <span className={`text-lg font-bold ${getGradeColor(overallGrade)}`}>
                  {overallGrade}
                </span>
              </Badge>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

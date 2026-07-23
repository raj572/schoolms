import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Award, Download } from "lucide-react";

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
      case "A+": return "text-green-600";
      case "A": return "text-blue-600";
      case "B+": return "text-yellow-600";
      case "B": return "text-orange-600";
      default: return "text-gray-600";
    }
  };

  const overallGrade = getGrade(Number(percentage));

  return (
    <div className="p-6 space-y-6 ml-12 my-4">
      <div>
        <h1 className="text-lg font-bold ">Student Report Card</h1>
        <p className="text-gray-500 text-xs">Semester Examination Result</p>
      </div>

      <Card className="border shadow-md">
        <CardHeader>
          <CardTitle className="flex text-md items-center gap-2">
            <Award className="h-5 w-5  text-primary" />
            {student.name}
          </CardTitle>
          <p className="text-xs ml-4 text-gray-500">
            Roll No: {student.rollNo} • {student.class}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">

          {/* Subject-wise Marks Table */}
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
                  <TableCell className=" text-xs  text-right px-12">{subj.maxMarks}</TableCell>
                  <TableCell className=" text-xs text-right px-9 font-medium">{subj.obtained}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex flex-col md:flex-row md:justify-between gap-4 pt-4 border-t">
            <div>
              <p className="font-semibold text-sm">Total Marks: {totalObtained}/{totalMax}</p>
              <p className="font-semibold text-xs text-gray-500">Percentage: {percentage}%</p>
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
            <Button >
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

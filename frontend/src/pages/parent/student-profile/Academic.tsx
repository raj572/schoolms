import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function StudentAcademic() {
  const academicInfo = {
    rollNo: "STU2025-101",
    class: "8th Grade",
    section: "A",
    admissionDate: "10 April 2021",
    currentYear: "2025-26",
    subjects: [
      { name: "Mathematics", grade: "A+", marks: "95/100" },
      { name: "Science", grade: "A", marks: "90/100" },
      { name: "English", grade: "A", marks: "88/100" },
      { name: "Social Science", grade: "B+", marks: "82/100" },
      { name: "Computer", grade: "A+", marks: "98/100" },
    ],
    performance: "Excellent",
    attendance: "96%",
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A+":
        return "text-green-600";
      case "A":
        return "text-blue-600";
      case "B+":
        return "text-yellow-600";
      case "B":
        return "text-orange-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="p-6 space-y-6 ml-9 m-6">
      <h1 className="text-lg font-bold">Academic Details</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Student Information</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4 text-sm">
          <Info label="Roll No" value={academicInfo.rollNo} />
          <Info label="Class" value={academicInfo.class} />
          <Info label="Section" value={academicInfo.section} />
          <Info label="Admission Date" value={academicInfo.admissionDate} />
          <Info label="Current Year" value={academicInfo.currentYear} />
          <Info label="Performance" value={academicInfo.performance} />
          <Info label="Attendance" value={academicInfo.attendance} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Subjects & Grades</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Marks</TableHead>
                <TableHead>Grade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {academicInfo.subjects.map((sub, i) => (
                <TableRow key={i}>
                  <TableCell className="text-xs">{sub.name}</TableCell>
                  <TableCell className="text-xs">{sub.marks}</TableCell>
                  <TableCell className={getGradeColor(sub.grade)}>
                    {sub.grade}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-medium">{label}</p>
      <p className="text-muted-foreground">{value}</p>
    </div>
  );
}

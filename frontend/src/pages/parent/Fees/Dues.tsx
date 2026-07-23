import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function ParentFeesDue() {
  const feesDue = [
    {
      id: 1,
      studentName: "Rohan Kumar",
      class: "8th Grade",
      dueDate: "2025-10-15",
      amount: "₹12,000",
      status: "Pending",
    },
    {
      id: 2,
      studentName: "Riya Sharma",
      class: "6th Grade",
      dueDate: "2025-10-10",
      amount: "₹10,500",
      status: "Overdue",
    },
    {
      id: 3,
      studentName: "Ankit Verma",
      class: "10th Grade",
      dueDate: "2025-11-05",
      amount: "₹15,000",
      status: "Pending",
    },
  ];

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Pending":
        return "secondary";
      case "Overdue":
        return "destructive";
      case "Paid":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <div className="p-6 space-y-6 ml-9 m-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold">Fees Due</h1>
          <p className="text-gray-500 text-xs">
            Parent can view all students' pending or overdue fees here.
          </p>
        </div>
        <Button  className="gap-2">
          <Download className="h-4 w-4" />
          Download Statement
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pending / Overdue Fees</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right px-9">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feesDue.map((fee) => (
                <TableRow key={fee.id}>
                  <TableCell className="font-medium text-xs">{fee.studentName}</TableCell>
                  <TableCell className="text-xs">{fee.class}</TableCell>
                  <TableCell className="text-xs">{fee.dueDate}</TableCell>
                  <TableCell className="text-xs">{fee.amount}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(fee.status)}>
                      {fee.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm">Pay Now</Button>
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

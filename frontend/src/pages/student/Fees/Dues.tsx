import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IndianRupee, Download, Wallet } from "lucide-react";

export default function StudentFeesDue() {
  const student = {
    name: "Rahul Singh",
    rollNo: "893",
    class: "12th",
  };

  const feesDue = [
    { head: "Addmission Fee", amount: 25000, dueDate: "2025-10-15", status: "Pending" },
    { head: "Library Fee", amount: 1500, dueDate: "2025-10-20", status: "Pending" },
    { head: "Book Fee", amount: 5000, dueDate: "2025-10-25", status: "Pending" },
  ];

  const totalDue = feesDue.reduce((acc, item) => acc + item.amount, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-700";
      case "Pending":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="p-6 space-y-6 ml-12 my-6">
      <div>
        <h1 className="text-lg font-bold ">Fees Due</h1>
        <p className="text-gray-500 text-xs">Check pending fees and pay online</p>
      </div>

      <Card className="border shadow-md">
        <CardHeader>
          <CardTitle className="flex text-lg items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            {student.name}
          </CardTitle>
          <p className=" text-gray-500 text-xs ml-7">
            Roll No: {student.rollNo} 
          </p>
          <p className=" text-gray-500 text-xs ml-7">
           Class:  {student.class}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fee Head</TableHead>
                <TableHead className="text-right">Amount (₹)</TableHead>
                <TableHead className="text-right">Due Date</TableHead>
                <TableHead className="text-right px-9">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feesDue.map((fee, index) => (
                <TableRow key={index}>
                  <TableCell className="text-xs">{fee.head}</TableCell>
                  <TableCell className="text-right px-11 text-xs">{fee.amount.toLocaleString()}</TableCell>
                  <TableCell className="text-right  text-xs">{fee.dueDate}</TableCell>
                  <TableCell className="text-right  text-xs">
                    <Badge className={getStatusColor(fee.status)}>{fee.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex flex-col md:flex-row md:justify-between gap-4 pt-4 border-t">
            <p className="font-semibold text-md flex items-center gap-2">
              <IndianRupee className="h-5 w-5 text-primary" />
              Total Due: ₹{totalDue.toLocaleString()}
            </p>

            <div className="flex gap-3">
              <Button variant="default">Pay Now</Button>
              <Button >
                <Download className="h-4 w-4" />
                Download Receipt
              </Button>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}

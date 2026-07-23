import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, ReceiptText } from "lucide-react";

export default function StudentPaymentHistory() {
  const student = {
    name: "Rahul Singh",
    rollNo: "878",
    class: "12th",
  };

  const payments = [
    {
      date: "2025-07-10",
      head: "Book Fee",
      transactionId: "TXN987654",
      amount: 25000,
      status: "Paid",
    },
    {
      date: "2025-07-15",
      head: "Addmission Fee",
      transactionId: "TXN987655",
      amount: 1500,
      status: "Paid",
    },
    {
      date: "2025-08-01",
      head: "Library Fee",
      transactionId: "TXN987656",
      amount: 5000,
      status: "Paid",
    },
  ];

  const totalPaid = payments.reduce((acc, p) => acc + p.amount, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-700";
      case "Failed":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="p-6 space-y-6 ml-12 my-4">
      <div>
        <h1 className="text-lg font-bold ">Payment History</h1>
        <p className="text-gray-500 text-xs">All successful fee transactions</p>
      </div>

      <Card className="border shadow-md">
        <CardHeader>
          <CardTitle className="flex text-lg items-center gap-2">
            <ReceiptText className="h-5 w-5  text-primary" />
            {student.name}
          </CardTitle>
          <p className="text-xs text-gray-500  pl-7">
            Roll No: {student.rollNo}
          </p>
          <p className="text-xs text-gray-500  pl-7">
            Class: {student.class}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Fee Head</TableHead>
                <TableHead>Transaction ID</TableHead>
                <TableHead className="text-right">Amount (₹)</TableHead>
                <TableHead className="text-right">Status</TableHead>
                <TableHead className="text-right px-11">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((p, index) => (
                <TableRow key={index}>
                  <TableCell className="text-xs">{p.date}</TableCell>
                  <TableCell className="text-xs">{p.head}</TableCell>
                  <TableCell className="text-xs">{p.transactionId}</TableCell>
                  <TableCell className="text-right text-xs px-9">{p.amount.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-xs ">
                    <Badge className={getStatusColor(p.status)}>{p.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button >
                      <Download className="h-4 w-4" />
                      Receipt
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex flex-col md:flex-row md:justify-between gap-4 pt-4 border-t">
            <p className="font-semibold text-md">
              Total Paid Amount: ₹{totalPaid.toLocaleString()}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

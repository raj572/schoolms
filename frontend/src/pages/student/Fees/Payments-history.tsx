import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, ReceiptText } from "lucide-react";
import { exportToCsv } from "@/lib/exportUtils";
import { toast } from "sonner";

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
      head: "Admission Fee",
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
        return "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300";
      case "Failed":
        return "bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const handleReceiptDownload = (payment: typeof payments[0]) => {
    const headers = ["Transaction ID", "Date", "Student Name", "Roll No", "Fee Head", "Amount (INR)", "Status"];
    const rows = [[payment.transactionId, payment.date, student.name, student.rollNo, payment.head, payment.amount, payment.status]];
    exportToCsv(`receipt_${payment.transactionId}.csv`, headers, rows);
    toast.success(`Receipt ${payment.transactionId} downloaded`);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-full">
      <div>
        <h1 className="text-xl font-bold text-foreground">Payment History</h1>
        <p className="text-muted-foreground text-xs mt-1">All successful fee transactions</p>
      </div>

      <Card className="border shadow-md">
        <CardHeader>
          <CardTitle className="flex text-lg items-center gap-2">
            <ReceiptText className="h-5 w-5 text-primary" />
            {student.name}
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Roll No: {student.rollNo} • Class: {student.class}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Fee Head</TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead className="text-right">Amount (₹)</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-xs">{p.date}</TableCell>
                    <TableCell className="text-xs">{p.head}</TableCell>
                    <TableCell className="text-xs font-mono">{p.transactionId}</TableCell>
                    <TableCell className="text-right text-xs font-medium">₹{p.amount.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-xs">
                      <Badge className={getStatusColor(p.status)}>{p.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => handleReceiptDownload(p)}>
                        <Download className="h-4 w-4 mr-1" />
                        Receipt
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between gap-4 pt-4 border-t">
            <p className="font-semibold text-md">
              Total Paid Amount: ₹{totalPaid.toLocaleString()}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

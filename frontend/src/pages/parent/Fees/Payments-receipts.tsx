import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function ParentPaymentReceipts() {
  const receipts = [
    {
      id: 1,
      studentName: "Rohan Kumar",
      class: "8th Grade",
      receiptNo: "RCPT-2025-001",
      date: "2025-09-15",
      amount: "₹12,000",
      mode: "UPI",
    },
    {
      id: 2,
      studentName: "Riya Sharma",
      class: "6th Grade",
      receiptNo: "RCPT-2025-002",
      date: "2025-08-20",
      amount: "₹10,500",
      mode: "Net Banking",
    },
    {
      id: 3,
      studentName: "Ankit Verma",
      class: "10th Grade",
      receiptNo: "RCPT-2025-003",
      date: "2025-07-10",
      amount: "₹15,000",
      mode: "Cash",
    },
  ];

  const handleDownload = (id: number) => {
    alert(`Download Receipt ID: ${id}`);
  };

  return (
    <div className="p-6 space-y-6 ml-9 m-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold">Payment Receipts</h1>
          <p className="text-gray-500 text-xs">
            Download receipts for all your previous fee payments
          </p>
        </div>
        <Button  className="gap-2">
          <Download className="h-4 w-4" />
          Download All
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Receipts History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Receipt No</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Mode of Payment</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {receipts.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium text-xs">{r.receiptNo}</TableCell>
                  <TableCell className="text-xs">{r.studentName}</TableCell>
                  <TableCell>{r.class}</TableCell>
                  <TableCell>{r.date}</TableCell>
                  <TableCell>{r.amount}</TableCell>
                  <TableCell>{r.mode}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload(r.id)}
                      className="gap-1"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
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

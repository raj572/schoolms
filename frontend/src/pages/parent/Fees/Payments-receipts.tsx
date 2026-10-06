import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { exportToCsv } from "@/lib/exportUtils";
import { useToast } from "@/hooks/use-toast";

export default function ParentPaymentReceipts() {
  const { toast } = useToast();
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

  const handleDownloadSingle = (receipt: typeof receipts[0]) => {
    exportToCsv(`receipt_${receipt.receiptNo}.csv`, [receipt], [
      { header: "Receipt No", key: "receiptNo" },
      { header: "Student Name", key: "studentName" },
      { header: "Class", key: "class" },
      { header: "Date", key: "date" },
      { header: "Amount", key: "amount" },
      { header: "Mode", key: "mode" },
    ]);
    toast({
      title: "Receipt Downloaded",
      description: `Receipt ${receipt.receiptNo} generated successfully.`,
    });
  };

  const handleDownloadAll = () => {
    exportToCsv("all_payment_receipts.csv", receipts, [
      { header: "Receipt No", key: "receiptNo" },
      { header: "Student Name", key: "studentName" },
      { header: "Class", key: "class" },
      { header: "Date", key: "date" },
      { header: "Amount", key: "amount" },
      { header: "Mode", key: "mode" },
    ]);
    toast({
      title: "All Receipts Downloaded",
      description: "Complete receipt history exported to CSV.",
    });
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Payment Receipts</h1>
          <p className="text-muted-foreground text-xs">
            Download receipts for all your previous fee payments
          </p>
        </div>
        <Button onClick={handleDownloadAll} className="gap-2">
          <Download className="h-4 w-4" />
          Download All
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-foreground">Receipts History</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
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
                  <TableCell className="font-medium text-xs text-foreground">{r.receiptNo}</TableCell>
                  <TableCell className="text-xs text-foreground">{r.studentName}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{r.class}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{r.date}</TableCell>
                  <TableCell className="text-xs font-semibold text-foreground">{r.amount}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{r.mode}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadSingle(r)}
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

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { IndianRupee, Download, Wallet, CreditCard } from "lucide-react";
import { exportToCsv } from "@/lib/exportUtils";
import { toast } from "sonner";
import { useState } from "react";

export default function StudentFeesDue() {
  const [showPayModal, setShowPayModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const student = {
    name: "Rahul Singh",
    rollNo: "893",
    class: "12th",
  };

  const feesDue = [
    { head: "Admission Fee", amount: 25000, dueDate: "2025-10-15", status: "Pending" },
    { head: "Library Fee", amount: 1500, dueDate: "2025-10-20", status: "Pending" },
    { head: "Book Fee", amount: 5000, dueDate: "2025-10-25", status: "Pending" },
  ];

  const totalDue = feesDue.reduce((acc, item) => acc + item.amount, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300";
      case "Pending":
        return "bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const handleDownload = () => {
    const headers = ["Fee Head", "Amount (INR)", "Due Date", "Status"];
    const rows = feesDue.map(f => [f.head, f.amount, f.dueDate, f.status]);
    rows.push(["Total Due", totalDue, "", ""]);
    exportToCsv(`fee_statement_${student.rollNo}.csv`, headers, rows);
    toast.success("Fee statement downloaded successfully");
  };

  const handlePayNow = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShowPayModal(false);
      toast.success("Payment initiated successfully!");
    }, 1000);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-full">
      <div>
        <h1 className="text-xl font-bold text-foreground">Fees Due</h1>
        <p className="text-muted-foreground text-xs mt-1">Check pending fees and pay online</p>
      </div>

      <Card className="border shadow-md">
        <CardHeader>
          <CardTitle className="flex text-lg items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            {student.name}
          </CardTitle>
          <p className="text-muted-foreground text-xs">
            Roll No: {student.rollNo} • Class: {student.class}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fee Head</TableHead>
                  <TableHead className="text-right">Amount (₹)</TableHead>
                  <TableHead className="text-right">Due Date</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feesDue.map((fee, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-xs">{fee.head}</TableCell>
                    <TableCell className="text-right text-xs">₹{fee.amount.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-xs">{fee.dueDate}</TableCell>
                    <TableCell className="text-right text-xs">
                      <Badge className={getStatusColor(fee.status)}>{fee.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4 pt-4 border-t">
            <p className="font-semibold text-md flex items-center gap-2">
              <IndianRupee className="h-5 w-5 text-primary" />
              Total Due: ₹{totalDue.toLocaleString()}
            </p>

            <div className="flex gap-3 w-full sm:w-auto">
              <Button className="w-full sm:w-auto" onClick={() => setShowPayModal(true)}>
                <CreditCard className="h-4 w-4 mr-2" /> Pay Now
              </Button>
              <Button variant="outline" className="w-full sm:w-auto" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download Statement
              </Button>
            </div>
          </div>

        </CardContent>
      </Card>

      {/* Payment Initiation Dialog */}
      <Dialog open={showPayModal} onOpenChange={setShowPayModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Fee Payment</DialogTitle>
            <DialogDescription>Total Amount Due: ₹{totalDue.toLocaleString()}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-xs text-muted-foreground">Select payment method to complete your fee payment securely.</p>
            <Button className="w-full" onClick={handlePayNow} disabled={isProcessing}>
              {isProcessing ? "Processing..." : "Proceed to Online Gateway"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, CreditCard } from "lucide-react";
import { exportToCsv } from "@/lib/exportUtils";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ParentFeesDue() {
  const { toast } = useToast();
  const [selectedFee, setSelectedFee] = useState<any>(null);
  const [isPayOpen, setIsPayOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [feesDue, setFeesDue] = useState([
    {
      id: 1,
      studentName: "Rohan Kumar",
      class: "8th Grade",
      dueDate: "2025-10-15",
      amount: "₹12,000",
      rawAmount: 12000,
      status: "Pending",
    },
    {
      id: 2,
      studentName: "Riya Sharma",
      class: "6th Grade",
      dueDate: "2025-10-10",
      amount: "₹10,500",
      rawAmount: 10500,
      status: "Overdue",
    },
    {
      id: 3,
      studentName: "Ankit Verma",
      class: "10th Grade",
      dueDate: "2025-11-05",
      amount: "₹15,000",
      rawAmount: 15000,
      status: "Pending",
    },
  ]);

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

  const handleDownloadStatement = () => {
    exportToCsv("parent_fees_statement.csv", feesDue, [
      { header: "Student Name", key: "studentName" },
      { header: "Class", key: "class" },
      { header: "Due Date", key: "dueDate" },
      { header: "Amount", key: "amount" },
      { header: "Status", key: "status" },
    ]);
    toast({
      title: "Statement Downloaded",
      description: "Fee dues statement saved to your device.",
    });
  };

  const handlePayClick = (fee: any) => {
    setSelectedFee(fee);
    setIsPayOpen(true);
  };

  const handleConfirmPayment = () => {
    if (!selectedFee) return;
    setIsProcessing(true);
    setTimeout(() => {
      setFeesDue((prev) =>
        prev.map((item) =>
          item.id === selectedFee.id ? { ...item, status: "Paid" } : item
        )
      );
      setIsProcessing(false);
      setIsPayOpen(false);
      toast({
        title: "Payment Successful",
        description: `Fee payment of ${selectedFee.amount} for ${selectedFee.studentName} processed successfully.`,
      });
    }, 1000);
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Fees Due</h1>
          <p className="text-muted-foreground text-xs">
            Parent can view all students' pending or overdue fees here.
          </p>
        </div>
        <Button onClick={handleDownloadStatement} className="gap-2">
          <Download className="h-4 w-4" />
          Download Statement
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-foreground">Pending / Overdue Fees</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feesDue.map((fee) => (
                <TableRow key={fee.id}>
                  <TableCell className="font-medium text-xs text-foreground">{fee.studentName}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{fee.class}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{fee.dueDate}</TableCell>
                  <TableCell className="text-xs font-semibold text-foreground">{fee.amount}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(fee.status)}>
                      {fee.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {fee.status !== "Paid" ? (
                      <Button size="sm" onClick={() => handlePayClick(fee)}>
                        Pay Now
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" disabled>
                        Paid
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Payment Confirmation Modal */}
      <Dialog open={isPayOpen} onOpenChange={setIsPayOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Complete Payment
            </DialogTitle>
            <DialogDescription>
              Confirm your fee payment details below.
            </DialogDescription>
          </DialogHeader>

          {selectedFee && (
            <div className="space-y-3 py-2 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Student:</span>
                <span className="font-medium text-foreground">{selectedFee.studentName}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Class:</span>
                <span className="font-medium text-foreground">{selectedFee.class}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Due Date:</span>
                <span className="font-medium text-foreground">{selectedFee.dueDate}</span>
              </div>
              <div className="flex justify-between text-base font-bold pt-1">
                <span>Total Amount:</span>
                <span className="text-primary">{selectedFee.amount}</span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPayOpen(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button onClick={handleConfirmPayment} disabled={isProcessing}>
              {isProcessing ? "Processing..." : "Confirm & Pay"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

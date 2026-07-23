import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  DollarSign,
  CreditCard,
  AlertTriangle,
  TrendingUp,
  Plus,
  Search,
  Download,
  Eye,
  Receipt,
  Send
} from "lucide-react";

export const FeesManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const feeStructure = [
    { grade: "Grade 1-3", tuition: 2500, library: 200, transport: 500, total: 3200 },
    { grade: "Grade 4-6", tuition: 3000, library: 250, transport: 500, total: 3750 },
    { grade: "Grade 7-9", tuition: 3500, library: 300, transport: 600, total: 4400 },
    { grade: "Grade 10-12", tuition: 4000, library: 350, transport: 600, total: 4950 }
  ];

  const feePayments = [
    {
      receiptNo: "RC001",
      studentName: "John Smith",
      rollNo: "101",
      grade: "10-A",
      amount: 4950,
      paymentMethod: "Credit Card",
      date: "2024-03-15",
      status: "Paid"
    },
    {
      receiptNo: "RC002", 
      studentName: "Emma Johnson",
      rollNo: "205",
      grade: "9-B", 
      amount: 4400,
      paymentMethod: "Bank Transfer",
      date: "2024-03-14",
      status: "Paid"
    },
    {
      receiptNo: "RC003",
      studentName: "Alex Wilson",
      rollNo: "087",
      grade: "11-A",
      amount: 4950,
      paymentMethod: "Cash",
      date: "2024-03-12",
      status: "Paid"
    }
  ];

  const feeDues = [
    {
      studentName: "Maya Patel",
      rollNo: "156",
      grade: "8-C",
      amount: 4400,
      dueDate: "2024-03-20",
      daysOverdue: 5,
      status: "Overdue"
    },
    {
      studentName: "Sarah Johnson",
      rollNo: "201",
      grade: "7-B",
      amount: 4400,
      dueDate: "2024-03-25", 
      daysOverdue: 0,
      status: "Due"
    },
    {
      studentName: "Michael Brown",
      rollNo: "142",
      grade: "12-A",
      amount: 4950,
      dueDate: "2024-03-30",
      daysOverdue: 0,
      status: "Upcoming"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Fees Management</h2>
          <p className="text-muted-foreground">Manage fee structure, payments, and outstanding dues</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button className="bg-gradient-primary hover:opacity-90">
            <Plus className="mr-2 h-4 w-4" />
            Record Payment
          </Button>
        </div>
      </div>

      {/* Fee Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-card shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Collection</p>
                <p className="text-2xl font-bold text-success">$89,430</p>
              </div>
              <DollarSign className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Outstanding Dues</p>
                <p className="text-2xl font-bold text-destructive">$12,340</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Collection Rate</p>
                <p className="text-2xl font-bold text-primary">87.9%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Transactions</p>
                <p className="text-2xl font-bold">247</p>
              </div>
              <CreditCard className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="structure" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="structure">Fee Structure</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="dues">Outstanding Dues</TabsTrigger>
          <TabsTrigger value="services">Fee Services</TabsTrigger>
        </TabsList>

        {/* Fee Structure Tab */}
        <TabsContent value="structure" className="space-y-4">
          <Card className="bg-gradient-card shadow-soft">
            <CardHeader>
              <CardTitle>Annual Fee Structure</CardTitle>
              <CardDescription>Breakdown of fees by grade levels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Grade</TableHead>
                      <TableHead>Tuition Fee</TableHead>
                      <TableHead>Library Fee</TableHead>
                      <TableHead>Transport Fee</TableHead>
                      <TableHead className="font-medium">Total Amount</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {feeStructure.map((fee) => (
                      <TableRow key={fee.grade}>
                        <TableCell className="font-medium">{fee.grade}</TableCell>
                        <TableCell>${fee.tuition}</TableCell>
                        <TableCell>${fee.library}</TableCell>
                        <TableCell>${fee.transport}</TableCell>
                        <TableCell className="font-bold text-primary">${fee.total}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-4">
          <Card className="bg-gradient-card shadow-soft">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Recent Payments</CardTitle>
                  <CardDescription>Latest fee payments received</CardDescription>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search payments..."
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Receipt No.</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Roll No.</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {feePayments.map((payment) => (
                      <TableRow key={payment.receiptNo}>
                        <TableCell className="font-medium">{payment.receiptNo}</TableCell>
                        <TableCell>{payment.studentName}</TableCell>
                        <TableCell>{payment.rollNo}</TableCell>
                        <TableCell>{payment.grade}</TableCell>
                        <TableCell className="font-medium">${payment.amount}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{payment.paymentMethod}</Badge>
                        </TableCell>
                        <TableCell>{payment.date}</TableCell>
                        <TableCell>
                          <Badge variant="default">{payment.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <Receipt className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dues Tab */}
        <TabsContent value="dues" className="space-y-4">
          <Card className="bg-gradient-card shadow-soft">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Outstanding Dues</CardTitle>
                  <CardDescription>Students with pending fee payments</CardDescription>
                </div>
                <Button variant="outline">
                  <Send className="mr-2 h-4 w-4" />
                  Send Reminders
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Roll No.</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Amount Due</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Days Overdue</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {feeDues.map((due, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{due.studentName}</TableCell>
                        <TableCell>{due.rollNo}</TableCell>
                        <TableCell>{due.grade}</TableCell>
                        <TableCell className="font-medium">${due.amount}</TableCell>
                        <TableCell>{due.dueDate}</TableCell>
                        <TableCell>{due.daysOverdue > 0 ? due.daysOverdue : "-"}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              due.status === "Overdue" ? "destructive" :
                              due.status === "Due" ? "secondary" : "outline"
                            }
                          >
                            {due.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <Send className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-4">
          <Card className="bg-gradient-card shadow-soft">
            <CardHeader>
              <CardTitle>Fee Services</CardTitle>
              <CardDescription>Additional fee-related services and options</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors">
                  <CardContent className="pt-6 text-center">
                    <CreditCard className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Online Payment Setup</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Configure online payment gateways for easy fee collection
                    </p>
                    <Button variant="outline" className="w-full">
                      Configure
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors">
                  <CardContent className="pt-6 text-center">
                    <Receipt className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Receipt Templates</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Customize receipt templates and automated emails
                    </p>
                    <Button variant="outline" className="w-full">
                      Customize
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors">
                  <CardContent className="pt-6 text-center">
                    <Send className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Payment Reminders</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Set up automated payment reminder notifications
                    </p>
                    <Button variant="outline" className="w-full">
                      Setup
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
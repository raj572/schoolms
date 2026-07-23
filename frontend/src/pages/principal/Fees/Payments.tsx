import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { Link } from "react-router-dom";

const Fees = () => {
  const feeRecords = [
    { id: 1, name: "Rahul Sharma", class: "10A", roll: "001", amount: "₹15,000", status: "Paid", dueDate: "2024-01-31" },
    { id: 2, name: "Priya Singh", class: "10B", roll: "002", amount: "₹15,000", status: "Pending", dueDate: "2024-01-31" },
    { id: 3, name: "Amit Kumar", class: "9A", roll: "003", amount: "₹12,000", status: "Paid", dueDate: "2024-01-31" },
    { id: 4, name: "Sneha Patel", class: "11A", roll: "004", amount: "₹18,000", status: "Overdue", dueDate: "2024-01-15" },
    { id: 5, name: "Ravi Gupta", class: "12B", roll: "005", amount: "₹20,000", status: "Paid", dueDate: "2024-01-31" },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Fee Management</h1>
            <p className="text-muted-foreground mt-2">Manage student fees and payment records</p>
          </div>
          <div className="flex gap-2">
            <Link to="/admin/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Fee Record
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Collection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <div className="text-2xl font-bold text-foreground">₹2,45,000</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <TrendingDown className="h-4 w-4 text-red-600" />
                <div className="text-2xl font-bold text-foreground">₹45,000</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <div className="text-2xl font-bold text-foreground">₹1,80,000</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Collection Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">84.5%</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Fee Records</CardTitle>
              <div className="relative w-64">
                <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                <Input placeholder="Search fee records..." className="pl-10" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Roll No.</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feeRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.roll}</TableCell>
                    <TableCell>{record.name}</TableCell>
                    <TableCell>{record.class}</TableCell>
                    <TableCell>{record.amount}</TableCell>
                    <TableCell>{record.dueDate}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        record.status === 'Paid' 
                          ? 'bg-green-100 text-green-800' 
                          : record.status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {record.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Fees;
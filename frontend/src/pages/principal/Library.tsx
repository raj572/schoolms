import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Book, BookOpen, Clock, AlertCircle, RefreshCw, Plus, Search, Edit, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { getLibraryStatistics, getAllBooks, getActiveIssues } from "@/services/libraryApiService";
import { Skeleton } from "@/components/ui/skeleton";
import AddBookDialog from "@/components/library/AddBookDialog";
import AssignBookDialog from "@/components/library/AssignBookDialog";
import UpdateBookIssueDialog from "@/components/library/UpdateBookIssueDialog";

interface LibraryStatistics {
  totalBooks: number;
  availableBooks: number;
  totalIssued: number;
  totalOverdue: number;
}

interface LibraryBook {
  id: number;
  title: string;
  author: string | null;
  isbn: string | null;
  status: string;
  available_quantity: number;
  quantity: number;
}

interface LibraryIssue {
  id: number;
  book_id: number;
  borrower_id: number;
  borrower_type: string;
  issue_date: string;
  due_date: string;
  return_date: string | null;
  fine_amount: number;
  status: string;
  book?: LibraryBook;
  borrower_name?: string;
  borrower?: any;
}

const Library = () => {
  const authUser = useAuthStore((state) => state.authUser);
  const [statistics, setStatistics] = useState<LibraryStatistics | null>(null);
  const [books, setBooks] = useState<LibraryBook[]>([]);
  const [issues, setIssues] = useState<LibraryIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddBookDialog, setShowAddBookDialog] = useState(false);
  const [showAssignBookDialog, setShowAssignBookDialog] = useState(false);
  const [showUpdateIssueDialog, setShowUpdateIssueDialog] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!authUser?.school_id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const schoolId = Number(authUser.school_id);
        
        // Fetch library statistics
        const statsResponse = await getLibraryStatistics(schoolId);
        if (statsResponse.status && statsResponse.data) {
          setStatistics(statsResponse.data);
        }

        // Fetch all books
        const booksResponse = await getAllBooks(schoolId);
        if (booksResponse.status && booksResponse.data) {
          setBooks(booksResponse.data);
        }

        // Fetch active issues
        const issuesResponse = await getActiveIssues(schoolId);
        if (issuesResponse.status && issuesResponse.data) {
          setIssues(issuesResponse.data);
        }
      } catch (error) {
        console.error("Error fetching library data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authUser?.school_id]);

  // Filter books based on search query
  const filteredBooks = books.filter(book => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      book.title.toLowerCase().includes(query) ||
      book.author?.toLowerCase().includes(query) ||
      book.isbn?.toLowerCase().includes(query)
    );
  });

  // Filter available books (books with available_quantity > 0)
  const availableBooks = filteredBooks.filter(book => book.available_quantity > 0);

  // Handle update issue
  const handleUpdateIssue = (issue: any) => {
    setSelectedIssue(issue);
    setShowUpdateIssueDialog(true);
  };

  // Calculate days overdue
  const calculateOverdueDays = (dueDate: string): number => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = now.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Calculate late fine
  const calculateLateFine = (issue: LibraryIssue): number => {
    if (issue.status !== 'issued') return 0;
    const overdueDays = calculateOverdueDays(issue.due_date);
    if (overdueDays > 0) {
      // Fine calculation: ₹5 per day for first 7 days, ₹10 per day after
      if (overdueDays <= 7) {
        return overdueDays * 5;
      } else {
        return (7 * 5) + ((overdueDays - 7) * 10);
      }
    }
    return 0;
  };

  // Get status color for issues
  const getIssueStatusColor = (issue: LibraryIssue) => {
    if (issue.status === 'returned') return 'text-gray-500';
    const overdueDays = calculateOverdueDays(issue.due_date);
    if (overdueDays > 7) return 'text-red-600';
    if (overdueDays > 0) return 'text-orange-600';
    return 'text-green-600';
  };

  // Refresh data
  const handleRefresh = async () => {
    if (!authUser?.school_id) return;
    
      try {
        setLoading(true);
        const schoolId = Number(authUser.school_id);
        
        const [statsResponse, booksResponse, issuesResponse] = await Promise.all([
          getLibraryStatistics(schoolId),
          getAllBooks(schoolId),
          getActiveIssues(schoolId)
        ]);

        if (statsResponse.status && statsResponse.data) {
          setStatistics(statsResponse.data);
        }

        if (booksResponse.status && booksResponse.data) {
          setBooks(booksResponse.data);
        }

        if (issuesResponse.status && issuesResponse.data) {
          setIssues(issuesResponse.data);
        }
    } catch (error) {
      console.error("Error refreshing library data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background ">
      <div className=" w-full">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-lg font-bold text-foreground">Library Management</h1>
            <p className=" text-xs text-muted-foreground mt-2">Track issued books, overdue items, and fines</p>
          </div>
          <div className="flex gap-2">
            <Link to="/admin/dashboard">
              <Button variant="outline" className="hover:bg-navbar hover:text-white">Back to Dashboard</Button>
            </Link>
            <Button variant="outline" onClick={handleRefresh} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" onClick={() => setShowAddBookDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Book
            </Button>
            <Button onClick={() => setShowAssignBookDialog(true)}>
              <BookOpen className="h-4 w-4 mr-2" />
              Assign Book
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="w-[250px]">
            <CardHeader className="text-center">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Books</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-16 ml-14" />
              ) : (
                <div className="flex items-center space-x-2 ml-14">
                  <Book className="h-4 w-4 text-blue-600" />
                  <div className="text-xl font-bold text-foreground">
                    {statistics?.totalBooks || 0}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-sm font-medium text-muted-foreground">Books Issued</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-16 ml-14 -my-4" />
              ) : (
                <div className="flex items-center space-x-2 ml-14 -my-4">
                  <BookOpen className="h-4 w-4 text-green-600" />
                  <div className="text-xl font-bold text-foreground">
                    {statistics?.totalIssued || 0}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-sm font-medium text-muted-foreground">Available Books</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-16 ml-14 -my-4" />
              ) : (
                <div className="flex items-center space-x-2 ml-14 -my-4">
                  <Book className="h-4 w-4 text-purple-600" />
                  <div className="text-xl font-bold text-foreground">
                    {statistics?.availableBooks || 0}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-sm font-medium text-muted-foreground">Overdue</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-16 ml-16 -my-4" />
              ) : (
                <div className="flex items-center space-x-2 ml-16 -my-4">
                  <Clock className="h-4 w-4 text-red-600" />
                  <div className="text-xl font-bold text-foreground">
                    {statistics?.totalOverdue || 0}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-0">
            <Tabs defaultValue="books" className="w-full">
              <TabsList className="grid w-full grid-cols-3 m-6 mb-0">
                <TabsTrigger value="books">All Books</TabsTrigger>
                <TabsTrigger value="available">Available Books</TabsTrigger>
                <TabsTrigger value="issued">Issued Books</TabsTrigger>
              </TabsList>

              {/* All Books Tab */}
              <TabsContent value="books" className="p-6 pt-4">
                <div className="flex justify-between items-center mb-4">
                  <CardTitle className="text-lg">Library Books</CardTitle>
                  <div className="relative w-64">
                    <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                    <Input 
                      placeholder="Search books..." 
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {loading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : (
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Author</TableHead>
                        <TableHead>ISBN</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBooks.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            {searchQuery ? "No books found matching your search" : "No books in the library yet"}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredBooks.map((book) => (
                          <TableRow key={book.id}>
                            <TableCell className="font-medium text-xs">{book.title}</TableCell>
                            <TableCell className="text-xs">{book.author || '-'}</TableCell>
                            <TableCell className="text-xs">{book.isbn || '-'}</TableCell>
                            <TableCell className="text-xs">
                              {book.available_quantity} / {book.quantity}
                            </TableCell>
                            <TableCell className="text-xs">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                book.available_quantity > 0 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-orange-100 text-orange-800'
                              }`}>
                                {book.available_quantity > 0 ? 'Available' : 'Unavailable'}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>

              {/* Available Books Tab */}
              <TabsContent value="available" className="p-6 pt-4">
                <div className="flex justify-between items-center mb-4">
                  <CardTitle className="text-lg">Available Books</CardTitle>
                  <div className="relative w-64">
                    <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                    <Input 
                      placeholder="Search books..." 
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {loading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : (
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Author</TableHead>
                        <TableHead>ISBN</TableHead>
                        <TableHead>Available</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {availableBooks.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            {searchQuery ? "No available books found matching your search" : "No books available for issue"}
                          </TableCell>
                        </TableRow>
                      ) : (
                        availableBooks.map((book) => (
                          <TableRow key={book.id}>
                            <TableCell className="font-medium text-xs">{book.title}</TableCell>
                            <TableCell className="text-xs">{book.author || '-'}</TableCell>
                            <TableCell className="text-xs">{book.isbn || '-'}</TableCell>
                            <TableCell className="text-xs font-semibold text-green-600">
                              {book.available_quantity}
                            </TableCell>
                            <TableCell className="text-xs">{book.quantity}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>

              {/* Issued Books Tab */}
              <TabsContent value="issued" className="p-6 pt-4">
                <div className="flex justify-between items-center mb-4">
                  <CardTitle className="text-lg">Currently Issued Books</CardTitle>
                </div>

                {loading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : (
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Book Title</TableHead>
                        <TableHead>Author</TableHead>
                        <TableHead>Borrower</TableHead>
                        <TableHead>Issue Date</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Overdue Days</TableHead>
                        <TableHead>Late Fine</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {issues.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                            No books currently issued
                          </TableCell>
                        </TableRow>
                      ) : (
                        issues.map((issue) => {
                          const overdueDays = calculateOverdueDays(issue.due_date);
                          const fine = calculateLateFine(issue);
                          const borrowerName = issue.borrower_name || 'Unknown';
                          
                          return (
                            <TableRow key={issue.id}>
                              <TableCell className="font-medium text-xs">
                                {issue.book?.title || 'Unknown Book'}
                              </TableCell>
                              <TableCell className="text-xs">
                                {issue.book?.author || '-'}
                              </TableCell>
                              <TableCell className="text-xs">
                                {borrowerName}
                              </TableCell>
                              <TableCell className="text-xs">
                                {new Date(issue.issue_date).toLocaleDateString()}
                              </TableCell>
                              <TableCell className="text-xs">
                                {new Date(issue.due_date).toLocaleDateString()}
                              </TableCell>
                              <TableCell className={`text-xs font-medium ${getIssueStatusColor(issue)}`}>
                                {overdueDays > 0 ? (
                                  <span className="flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    {overdueDays} days
                                  </span>
                                ) : (
                                  'On time'
                                )}
                              </TableCell>
                              <TableCell className="text-xs">
                                {fine > 0 ? (
                                  <span className="text-red-600 font-medium">₹{fine}</span>
                                ) : (
                                  '₹0'
                                )}
                              </TableCell>
                              <TableCell className="text-xs">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  overdueDays > 7 ? 'bg-red-100 text-red-800' :
                                  overdueDays > 0 ? 'bg-orange-100 text-orange-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {overdueDays > 7 ? 'Critical' :
                                   overdueDays > 0 ? 'Overdue' :
                                   'Active'}
                                </span>
                              </TableCell>
                              <TableCell className="text-xs">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleUpdateIssue(issue)}
                                  className="h-8 w-8 p-0"
                                  title="Update Issue"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Add Book Dialog */}
        {authUser?.school_id && (
          <AddBookDialog
            open={showAddBookDialog}
            onOpenChange={setShowAddBookDialog}
            onSuccess={handleRefresh}
            schoolId={Number(authUser.school_id)}
          />
        )}

        {/* Assign Book Dialog */}
        {authUser?.school_id && (
          <AssignBookDialog
            open={showAssignBookDialog}
            onOpenChange={setShowAssignBookDialog}
            onSuccess={handleRefresh}
            schoolId={Number(authUser.school_id)}
          />
        )}

        {/* Update Book Issue Dialog */}
        <UpdateBookIssueDialog
          open={showUpdateIssueDialog}
          onOpenChange={setShowUpdateIssueDialog}
          onSuccess={handleRefresh}
          issue={selectedIssue}
        />
      </div>
    </div>
  );
};

export default Library;
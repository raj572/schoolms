import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Book, BookOpen, Clock, AlertCircle, RefreshCw, Plus, Search, Edit, RotateCcw, Trash2, FileText, Download } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { getLibraryStatistics, getAllBooks, getActiveIssues, getAllIssues, getOverdueIssues, searchBooks, deleteBook, returnBook, updateBook, getDigitalResources, createDigitalResource, deleteDigitalResource } from "@/services/libraryApiService";
import { Skeleton } from "@/components/ui/skeleton";
import AddBookDialog from "@/components/library/AddBookDialog";
import AssignBookDialog from "@/components/library/AssignBookDialog";
import UpdateBookIssueDialog from "@/components/library/UpdateBookIssueDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

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
  book_code?: string;
  publisher?: string | null;
  category?: string | null;
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

interface DigitalResourceItem {
  id: number;
  title: string;
  resource_type: string;
  file_size: string;
  file_path_url?: string;
  downloads: number;
}

const LibrarianLibrary = () => {
  const authUser = useAuthStore((state) => state.authUser);
  const [statistics, setStatistics] = useState<LibraryStatistics | null>(null);
  const [books, setBooks] = useState<LibraryBook[]>([]);
  const [issues, setIssues] = useState<LibraryIssue[]>([]);
  const [allIssues, setAllIssues] = useState<LibraryIssue[]>([]);
  const [digitalResources, setDigitalResources] = useState<DigitalResourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddBookDialog, setShowAddBookDialog] = useState(false);
  const [showAssignBookDialog, setShowAssignBookDialog] = useState(false);
  const [showUpdateIssueDialog, setShowUpdateIssueDialog] = useState(false);
  const [showAddResourceDialog, setShowAddResourceDialog] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<LibraryIssue | null>(null);
  const [activeTab, setActiveTab] = useState("books");

  // New Resource Form
  const [newResource, setNewResource] = useState({
    title: "",
    resource_type: "PDF Document",
    file_size: "2.5 MB",
    file_path_url: "",
  });

  // Refresh data
  const handleRefresh = async () => {
    if (!authUser?.school_id) return;
    
    try {
      setLoading(true);
      const schoolId = Number(authUser.school_id);
      
      const [statsResponse, booksResponse, issuesResponse, allIssuesResponse, digitalRes] = await Promise.all([
        getLibraryStatistics(schoolId),
        getAllBooks(schoolId),
        getActiveIssues(schoolId),
        getAllIssues(schoolId),
        getDigitalResources(schoolId).catch(() => ({ status: false, data: [] }))
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

      if (allIssuesResponse.status && allIssuesResponse.data) {
        setAllIssues(allIssuesResponse.data);
      }

      if (digitalRes.status && digitalRes.data) {
        setDigitalResources(digitalRes.data);
      }
    } catch (error) {
      console.error("Error refreshing library data:", error);
      toast.error("Failed to refresh data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleRefresh();
  }, [authUser?.school_id]);

  const handleAddDigitalResource = async () => {
    if (!newResource.title.trim()) {
      toast.error("Please enter resource title");
      return;
    }

    try {
      const res = await createDigitalResource({
        school_id: Number(authUser?.school_id),
        title: newResource.title,
        resource_type: newResource.resource_type,
        file_size: newResource.file_size,
        file_path_url: newResource.file_path_url,
      });

      if (res.status) {
        toast.success("Digital resource uploaded successfully");
        setShowAddResourceDialog(false);
        setNewResource({ title: "", resource_type: "PDF Document", file_size: "2.5 MB", file_path_url: "" });
        handleRefresh();
      } else {
        toast.error(res.message || "Failed to upload digital resource");
      }
    } catch (error) {
      toast.error("Error uploading resource");
    }
  };

  const handleDeleteResource = async (id: number) => {
    if (!confirm("Are you sure you want to delete this resource?")) return;
    try {
      const res = await deleteDigitalResource(id);
      if (res.status) {
        toast.success("Resource deleted successfully");
        handleRefresh();
      }
    } catch (error) {
      toast.error("Failed to delete resource");
    }
  };

  const filteredBooks = books.filter(book => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      book.title.toLowerCase().includes(query) ||
      book.author?.toLowerCase().includes(query) ||
      book.isbn?.toLowerCase().includes(query) ||
      book.book_code?.toLowerCase().includes(query)
    );
  });

  const availableBooks = filteredBooks.filter(book => book.available_quantity > 0);

  const handleDeleteBook = async (bookId: number) => {
    if (!confirm("Are you sure you want to delete this book? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await deleteBook(bookId);
      if (response.status) {
        toast.success("Book deleted successfully");
        handleRefresh();
      } else {
        toast.error(response.message || "Failed to delete book");
      }
    } catch (error) {
      console.error("Error deleting book:", error);
      toast.error("Failed to delete book");
    }
  };

  const handleReturnBook = async (issueId: number) => {
    try {
      const response = await returnBook(issueId, Number(authUser?.id));
      if (response.status) {
        toast.success("Book returned successfully");
        handleRefresh();
      } else {
        toast.error(response.message || "Failed to return book");
      }
    } catch (error) {
      console.error("Error returning book:", error);
      toast.error("Failed to return book");
    }
  };

  const calculateOverdueDays = (dueDate: string): number => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = now.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-lg font-bold text-foreground">Library Management</h1>
            <p className="text-xs text-muted-foreground mt-2">Manage books, issues, and returns</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRefresh} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" onClick={() => setShowAddResourceDialog(true)}>
              <FileText className="h-4 w-4 mr-2" />
              Add Digital Resource
            </Button>
            <Button variant="outline" onClick={() => setShowAddBookDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Book
            </Button>
            <Button onClick={() => setShowAssignBookDialog(true)}>
              <BookOpen className="h-4 w-4 mr-2" />
              Issue Book
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Books</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center items-center pb-6">
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="flex items-center space-x-2">
                  <Book className="h-5 w-5 text-blue-500" />
                  <div className="text-xl font-bold text-foreground">
                    {statistics?.totalBooks || 0}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Books Issued</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center items-center pb-6">
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-emerald-500" />
                  <div className="text-xl font-bold text-foreground">
                    {statistics?.totalIssued || 0}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Available Books</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center items-center pb-6">
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="flex items-center space-x-2">
                  <Book className="h-5 w-5 text-purple-500" />
                  <div className="text-xl font-bold text-foreground">
                    {statistics?.availableBooks || 0}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Overdue</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center items-center pb-6">
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-rose-500" />
                  <div className="text-xl font-bold text-foreground">
                    {statistics?.totalOverdue || 0}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="border border-border/60 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="border-b border-border/60 px-6 pt-4">
                <TabsList className="grid w-full grid-cols-5 bg-muted/60 p-1">
                  <TabsTrigger value="books">All Books</TabsTrigger>
                  <TabsTrigger value="available">Available Books</TabsTrigger>
                  <TabsTrigger value="issued">Issued Books</TabsTrigger>
                  <TabsTrigger value="history">Issue History</TabsTrigger>
                  <TabsTrigger value="digital">Digital Resources</TabsTrigger>
                </TabsList>
              </div>

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
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBooks.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                            No books found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredBooks.map((book) => (
                          <TableRow key={book.id}>
                            <TableCell className="font-medium text-xs">
                              {book.title}
                              {book.book_code && (
                                <span className="block text-xs text-muted-foreground font-mono">
                                  {book.book_code}
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-xs">{book.author || '-'}</TableCell>
                            <TableCell className="text-xs font-mono">{book.isbn || '-'}</TableCell>
                            <TableCell className="text-xs font-semibold text-emerald-600">
                              {book.available_quantity}
                            </TableCell>
                            <TableCell className="text-xs">{book.quantity}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteBook(book.id)}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
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
                </div>
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
                        <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                          No books available for issue
                        </TableCell>
                      </TableRow>
                    ) : (
                      availableBooks.map((book) => (
                        <TableRow key={book.id}>
                          <TableCell className="font-medium text-xs">{book.title}</TableCell>
                          <TableCell className="text-xs">{book.author || '-'}</TableCell>
                          <TableCell className="text-xs font-mono">{book.isbn || '-'}</TableCell>
                          <TableCell className="text-xs font-semibold text-emerald-600">{book.available_quantity}</TableCell>
                          <TableCell className="text-xs">{book.quantity}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TabsContent>

              {/* Issued Books Tab */}
              <TabsContent value="issued" className="p-6 pt-4">
                <div className="flex justify-between items-center mb-4">
                  <CardTitle className="text-lg">Issued Books</CardTitle>
                </div>
                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Book</TableHead>
                      <TableHead>Borrower</TableHead>
                      <TableHead>Issue Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {issues.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                          No books currently issued
                        </TableCell>
                      </TableRow>
                    ) : (
                      issues.map((issue) => (
                        <TableRow key={issue.id}>
                          <TableCell className="font-medium text-xs">{issue.book?.title || 'Unknown'}</TableCell>
                          <TableCell className="text-xs">{issue.borrower_name || 'Unknown'}</TableCell>
                          <TableCell className="text-xs">{new Date(issue.issue_date).toLocaleDateString()}</TableCell>
                          <TableCell className="text-xs">{new Date(issue.due_date).toLocaleDateString()}</TableCell>
                          <TableCell className="text-xs">
                            <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">
                              {issue.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="ghost" onClick={() => handleReturnBook(issue.id)} className="h-8 w-8 p-0 text-emerald-600">
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TabsContent>

              {/* Issue History Tab */}
              <TabsContent value="history" className="p-6 pt-4">
                <div className="flex justify-between items-center mb-4">
                  <CardTitle className="text-lg">Issue History</CardTitle>
                </div>
                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Book</TableHead>
                      <TableHead>Borrower</TableHead>
                      <TableHead>Issue Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Return Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allIssues.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                          No issue history found
                        </TableCell>
                      </TableRow>
                    ) : (
                      allIssues.map((issue) => (
                        <TableRow key={issue.id}>
                          <TableCell className="font-medium text-xs">{issue.book?.title || 'Unknown'}</TableCell>
                          <TableCell className="text-xs">{issue.borrower_name || 'Unknown'}</TableCell>
                          <TableCell className="text-xs">{new Date(issue.issue_date).toLocaleDateString()}</TableCell>
                          <TableCell className="text-xs">{new Date(issue.due_date).toLocaleDateString()}</TableCell>
                          <TableCell className="text-xs">{issue.return_date ? new Date(issue.return_date).toLocaleDateString() : '-'}</TableCell>
                          <TableCell className="text-xs">
                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                              issue.status === 'returned' ? 'bg-muted text-muted-foreground' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {issue.status}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TabsContent>

              {/* Digital Resources Tab */}
              <TabsContent value="digital" className="p-6 pt-4">
                <div className="flex justify-between items-center mb-4">
                  <CardTitle className="text-lg">Digital Resources</CardTitle>
                  <Button size="sm" onClick={() => setShowAddResourceDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Upload Resource
                  </Button>
                </div>

                {loading ? (
                  <Skeleton className="h-32 w-full" />
                ) : digitalResources.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No digital resources uploaded yet. Click "Upload Resource" to add PDFs, video links, or course materials.
                  </div>
                ) : (
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Resource Type</TableHead>
                        <TableHead>File Size</TableHead>
                        <TableHead>Downloads</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {digitalResources.map((res) => (
                        <TableRow key={res.id}>
                          <TableCell className="font-medium text-xs flex items-center gap-2">
                            <FileText className="h-4 w-4 text-primary" />
                            {res.title}
                          </TableCell>
                          <TableCell className="text-xs">
                            <span className="px-2 py-0.5 rounded bg-muted font-medium">{res.resource_type}</span>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{res.file_size}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{res.downloads}</TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive h-8 w-8 p-0" onClick={() => handleDeleteResource(res.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
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

        {/* Add Digital Resource Dialog */}
        <Dialog open={showAddResourceDialog} onOpenChange={setShowAddResourceDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Digital Resource</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="title">Resource Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g. Data Structures Reference Guide PDF"
                  value={newResource.title}
                  onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Resource Type *</Label>
                <Select
                  value={newResource.resource_type}
                  onValueChange={(val) => setNewResource({ ...newResource, resource_type: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PDF Document">PDF Document</SelectItem>
                    <SelectItem value="PDF Collection">PDF Collection</SelectItem>
                    <SelectItem value="Video Course">Video Course</SelectItem>
                    <SelectItem value="E-Book">E-Book</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="file_size">File Size</Label>
                <Input
                  id="file_size"
                  placeholder="e.g. 12.5 MB"
                  value={newResource.file_size}
                  onChange={(e) => setNewResource({ ...newResource, file_size: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="url">File/Resource URL (Optional)</Label>
                <Input
                  id="url"
                  placeholder="https://..."
                  value={newResource.file_path_url}
                  onChange={(e) => setNewResource({ ...newResource, file_path_url: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddResourceDialog(false)}>Cancel</Button>
              <Button onClick={handleAddDigitalResource}>Upload Resource</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default LibrarianLibrary;

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Book, Download, Eye, Clock, BookOpen, FileText, Bookmark, ClipboardList, RefreshCw } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { getAllBooks, getBorrowerIssues, getDigitalResources } from "@/services/libraryApiService";

interface LibraryBookItem {
  id: number;
  book_title: string;
  author_name: string;
  book_code: string;
  category?: string;
  available_quantity: number;
  total_quantity: number;
  cover_image?: string;
}

interface BookIssueItem {
  id: number;
  issue_date: string;
  due_date: string;
  return_date?: string | null;
  status: string;
  book?: {
    id: number;
    book_title: string;
    author_name: string;
    book_code: string;
    cover_image?: string;
  };
}

interface DigitalResourceItem {
  id: number;
  title: string;
  resource_type: string;
  file_size: string;
  file_path_url?: string;
  downloads: number;
}

export default function StudentLibrary() {
  const authUser = useAuthStore((state) => state.authUser);
  const [books, setBooks] = useState<LibraryBookItem[]>([]);
  const [issues, setIssues] = useState<BookIssueItem[]>([]);
  const [digitalResources, setDigitalResources] = useState<DigitalResourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = async () => {
    if (!authUser?.school_id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const schoolId = Number(authUser.school_id);
      const studentId = Number(authUser.id);

      const [booksRes, issuesRes, altIssuesRes, digitalRes] = await Promise.all([
        getAllBooks(schoolId).catch(() => ({ status: false, data: [] })),
        getBorrowerIssues(studentId, 'student').catch(() => ({ status: false, data: [] })),
        getBorrowerIssues(studentId, 'App\\Models\\StudentDetails').catch(() => ({ status: false, data: [] })),
        getDigitalResources(schoolId).catch(() => ({ status: false, data: [] })),
      ]);

      if (booksRes.status && booksRes.data) {
        setBooks(booksRes.data);
      }

      const combinedIssues = [
        ...(issuesRes.data || []),
        ...(altIssuesRes.data || [])
      ];

      // Remove duplicate issues by ID
      const uniqueIssues = Array.from(new Map(combinedIssues.map(item => [item.id, item])).values());
      setIssues(uniqueIssues);

      if (digitalRes.status && digitalRes.data) {
        setDigitalResources(digitalRes.data);
      }
    } catch (error) {
      console.error("Error fetching library data for student:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [authUser?.school_id, authUser?.id]);

  const getStatusBadge = (status: string, dueDate?: string) => {
    const isOverdue = status === 'issued' && dueDate && new Date(dueDate) < new Date();
    if (status === 'returned') {
      return <Badge className="bg-emerald-500 text-white">Returned</Badge>;
    }
    if (isOverdue || status === 'overdue') {
      return <Badge variant="destructive">Overdue</Badge>;
    }
    if (status === 'issued') {
      return <Badge className="bg-blue-500 text-white">Borrowed</Badge>;
    }
    return <Badge variant="secondary">{status}</Badge>;
  };

  const filteredBooks = books.filter(b => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.book_title.toLowerCase().includes(q) ||
      b.author_name.toLowerCase().includes(q) ||
      b.book_code.toLowerCase().includes(q)
    );
  });

  const activeBorrowedBooks = issues.filter(i => i.status === 'issued');

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold text-foreground">Library</h1>
          <p className="text-muted-foreground text-xs">Access books, track issued items, and explore digital resources</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="catalog" className="space-y-6 w-full">
        <div className="overflow-x-auto pb-2">
          <TabsList className="flex min-w-max w-full bg-muted/60 p-1">
            <TabsTrigger value="catalog" className="gap-2">
              <Book className="h-4 w-4" />
              Catalog
            </TabsTrigger>
            <TabsTrigger value="borrowed" className="gap-2">
              <Clock className="h-4 w-4" />
              My Books ({activeBorrowedBooks.length})
            </TabsTrigger>
            <TabsTrigger value="issues" className="gap-2">
              <ClipboardList className="h-4 w-4" />
              Book Issues ({issues.length})
            </TabsTrigger>
            <TabsTrigger value="digital" className="gap-2">
              <FileText className="h-4 w-4" />
              Digital Resources
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Catalog Tab */}
        <TabsContent value="catalog" className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
              <Input 
                placeholder="Search books by title, author, or code..." 
                className="pl-10" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-48 w-full rounded-lg" />
              ))}
            </div>
          ) : filteredBooks.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No books found in the library catalog.
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBooks.map((book) => (
                <Card key={book.id} className="overflow-hidden border border-border/60 shadow-sm">
                  <CardContent className="p-5 flex gap-4">
                    <div className="w-20 h-28 bg-muted rounded flex items-center justify-center shrink-0 overflow-hidden">
                      {book.cover_image ? (
                        <img src={book.cover_image} alt={book.book_title} className="w-full h-full object-cover" />
                      ) : (
                        <Book className="h-10 w-10 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h3 className="font-semibold text-sm truncate" title={book.book_title}>{book.book_title}</h3>
                        <p className="text-muted-foreground text-xs mb-1 truncate">{book.author_name}</p>
                        <p className="text-xs font-mono text-muted-foreground mb-2">{book.book_code}</p>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant={book.available_quantity > 0 ? "secondary" : "destructive"} className="text-xs">
                          {book.available_quantity > 0 ? `${book.available_quantity} Available` : 'Out of Stock'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* My Books Tab */}
        <TabsContent value="borrowed" className="space-y-4">
          <Card className="border border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="flex text-md items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Currently Borrowed Books
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-20 w-full" />
              ) : activeBorrowedBooks.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  You currently have no borrowed books.
                </div>
              ) : (
                <div className="space-y-4">
                  {activeBorrowedBooks.map((issue) => (
                    <div key={issue.id} className="flex items-center justify-between p-4 border border-border/60 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-14 bg-muted rounded flex items-center justify-center shrink-0">
                          <Book className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">{issue.book?.book_title || 'Book'}</h4>
                          <p className="text-muted-foreground text-xs">{issue.book?.author_name || 'N/A'}</p>
                          <p className="text-xs text-rose-500 font-medium mt-1">Due Date: {new Date(issue.due_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div>
                        {getStatusBadge(issue.status, issue.due_date)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Book Issues History Tab */}
        <TabsContent value="issues" className="space-y-4">
          <Card className="border border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="flex text-md items-center gap-2">
                <ClipboardList className="h-5 w-5 text-primary" />
                Book Issues History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-32 w-full" />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-border/60 text-muted-foreground">
                        <th className="p-3 text-left">Book Title</th>
                        <th className="p-3 text-left">Book Code</th>
                        <th className="p-3 text-left">Issue Date</th>
                        <th className="p-3 text-left">Due Date</th>
                        <th className="p-3 text-left">Return Date</th>
                        <th className="p-3 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {issues.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-6 text-center text-muted-foreground">
                            No book issue records found.
                          </td>
                        </tr>
                      ) : (
                        issues.map((issue) => (
                          <tr key={issue.id} className="border-b border-border/40 hover:bg-muted/50 transition-colors">
                            <td className="p-3 font-medium text-foreground">{issue.book?.book_title || 'N/A'}</td>
                            <td className="p-3 font-mono text-xs text-muted-foreground">{issue.book?.book_code || 'N/A'}</td>
                            <td className="p-3 text-xs text-muted-foreground">{new Date(issue.issue_date).toLocaleDateString()}</td>
                            <td className="p-3 text-xs text-muted-foreground">{new Date(issue.due_date).toLocaleDateString()}</td>
                            <td className="p-3 text-xs text-muted-foreground">
                              {issue.return_date ? new Date(issue.return_date).toLocaleDateString() : '—'}
                            </td>
                            <td className="p-3">
                              {getStatusBadge(issue.status, issue.due_date)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Digital Resources Tab */}
        <TabsContent value="digital" className="space-y-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-40 w-full rounded-lg" />
              ))}
            </div>
          ) : digitalResources.length === 0 ? (
            <Card className="border border-border/60 shadow-sm">
              <CardContent className="p-8 text-center text-muted-foreground">
                No digital resources uploaded by the librarian yet.
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {digitalResources.map((resource) => (
                <Card key={resource.id} className="border border-border/60 shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <FileText className="h-8 w-8 text-primary" />
                      <Badge variant="outline">{resource.resource_type}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-sm line-clamp-2">{resource.title}</h3>
                      <p className="text-muted-foreground text-xs">Size: {resource.file_size}</p>
                      <p className="text-muted-foreground text-xs">{resource.downloads} downloads</p>
                    </div>
                    <div className="flex gap-2">
                      {resource.file_path_url ? (
                        <a href={resource.file_path_url} target="_blank" rel="noreferrer" className="flex-1">
                          <Button size="sm" className="w-full gap-2">
                            <Download className="h-3 w-3" />
                            Download
                          </Button>
                        </a>
                      ) : (
                        <Button size="sm" className="flex-1 gap-2" disabled>
                          <Download className="h-3 w-3" />
                          Download
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Book, BookOpen, Clock, AlertCircle, RefreshCw, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { getLibraryStatistics, getActiveIssues, getOverdueIssues } from "@/services/libraryApiService";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface LibraryStatistics {
  totalBooks: number;
  availableBooks: number;
  totalIssued: number;
  totalOverdue: number;
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
  book?: {
    id: number;
    title: string;
    author: string | null;
  };
  borrower_name?: string;
}

const LibrarianDashboard = () => {
  const authUser = useAuthStore((state) => state.authUser);
  const navigate = useNavigate();
  const [statistics, setStatistics] = useState<LibraryStatistics | null>(null);
  const [recentIssues, setRecentIssues] = useState<LibraryIssue[]>([]);
  const [overdueIssues, setOverdueIssues] = useState<LibraryIssue[]>([]);
  const [loading, setLoading] = useState(true);

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

        // Fetch active issues (recent)
        const issuesResponse = await getActiveIssues(schoolId);
        if (issuesResponse.status && issuesResponse.data) {
          // Get last 5 issues
          setRecentIssues(issuesResponse.data.slice(0, 5));
        }

        // Fetch overdue issues
        const overdueResponse = await getOverdueIssues(schoolId);
        if (overdueResponse.status && overdueResponse.data) {
          setOverdueIssues(overdueResponse.data.slice(0, 5));
        }
      } catch (error) {
        console.error("Error fetching library data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authUser?.school_id]);

  // Refresh data
  const handleRefresh = async () => {
    if (!authUser?.school_id) return;
    
    try {
      setLoading(true);
      const schoolId = Number(authUser.school_id);
      
      const [statsResponse, issuesResponse, overdueResponse] = await Promise.all([
        getLibraryStatistics(schoolId),
        getActiveIssues(schoolId),
        getOverdueIssues(schoolId)
      ]);

      if (statsResponse.status && statsResponse.data) {
        setStatistics(statsResponse.data);
      }

      if (issuesResponse.status && issuesResponse.data) {
        setRecentIssues(issuesResponse.data.slice(0, 5));
      }

      if (overdueResponse.status && overdueResponse.data) {
        setOverdueIssues(overdueResponse.data.slice(0, 5));
      }
    } catch (error) {
      console.error("Error refreshing library data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate days overdue
  const calculateOverdueDays = (dueDate: string): number => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = now.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <div className="space-y-9 overflow-hidden">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold">Librarian Dashboard</h2>
          <p className="text-gray-500 text-xs">Welcome to your library management dashboard</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => navigate('/librarian/library')}>
            Manage Library
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-card to-accent border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Books</CardTitle>
            <Book className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-lg font-bold">{statistics?.totalBooks || 0}</div>
                <p className="text-xs text-gray-500">Books in library</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-success-light border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Books</CardTitle>
            <BookOpen className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-lg font-bold text-success">{statistics?.availableBooks || 0}</div>
                <p className="text-xs text-gray-500">Ready to issue</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-warning-light border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Books Issued</CardTitle>
            <TrendingUp className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-lg font-bold text-warning">{statistics?.totalIssued || 0}</div>
                <p className="text-xs text-gray-500">Currently issued</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-error-light border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Books</CardTitle>
            <AlertCircle className="h-4 w-4 text-error" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-lg font-bold text-error">{statistics?.totalOverdue || 0}</div>
                <p className="text-xs text-gray-500">Requires attention</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Overdue Books */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Issues */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Book Issues</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : recentIssues.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No recent issues</p>
            ) : (
              <div className="space-y-3">
                {recentIssues.map((issue) => (
                  <div key={issue.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{issue.book?.title || 'Unknown Book'}</p>
                      <p className="text-xs text-muted-foreground">
                        {issue.borrower_name || 'Unknown Borrower'} • Due: {new Date(issue.due_date).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate('/librarian/library')}
                    >
                      View
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Overdue Books */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Overdue Books</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : overdueIssues.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No overdue books</p>
            ) : (
              <div className="space-y-3">
                {overdueIssues.map((issue) => {
                  const overdueDays = calculateOverdueDays(issue.due_date);
                  return (
                    <div key={issue.id} className="flex items-center justify-between p-3 border border-error rounded-lg bg-error-light/10">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{issue.book?.title || 'Unknown Book'}</p>
                        <p className="text-xs text-muted-foreground">
                          {issue.borrower_name || 'Unknown Borrower'} • {overdueDays} days overdue
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/librarian/library')}
                      >
                        Handle
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LibrarianDashboard;


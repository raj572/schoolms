import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Search,
  Mail,
  Phone,
  Calendar,
  MessageSquare,
  Eye,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getAllEnquiries, getEnquiry, updateEnquiryStatus, ContactEnquiry } from '@/services/superAdminApiService';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function SuperAdminEnquiries() {
  const { toast } = useToast();
  const [enquiries, setEnquiries] = useState<ContactEnquiry[]>([]);
  const [filteredEnquiries, setFilteredEnquiries] = useState<ContactEnquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedEnquiry, setSelectedEnquiry] = useState<ContactEnquiry | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEnquiries, setTotalEnquiries] = useState(0);

  useEffect(() => {
    fetchEnquiries();
  }, [currentPage, statusFilter]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = enquiries.filter(
        (enquiry) =>
          enquiry.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          enquiry.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          enquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          enquiry.subject.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEnquiries(filtered);
    } else {
      setFilteredEnquiries(enquiries);
    }
  }, [searchTerm, enquiries]);

  const fetchEnquiries = async () => {
    setIsLoading(true);
    try {
      const response = await getAllEnquiries({
        page: currentPage,
        per_page: 15,
        status: statusFilter !== 'all' ? (statusFilter as 'pending' | 'replied' | 'resolved') : undefined,
        search: searchTerm || undefined,
      });
      
      if (response.status && response.data) {
        setEnquiries(response.data.enquiries || []);
        setFilteredEnquiries(response.data.enquiries || []);
        if (response.data.pagination) {
          setTotalPages(response.data.pagination.last_page || 1);
          setTotalEnquiries(response.data.pagination.total || 0);
        }
      }
    } catch (error: any) {
      console.error('Error fetching enquiries:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch enquiries.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewEnquiry = async (enquiryId: number) => {
    try {
      const response = await getEnquiry(enquiryId);
      if (response.status && response.data) {
        setSelectedEnquiry(response.data);
        setIsDialogOpen(true);
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch enquiry details.',
      });
    }
  };

  const handleStatusUpdate = async (enquiryId: number, newStatus: 'pending' | 'replied' | 'resolved') => {
    try {
      const response = await updateEnquiryStatus(enquiryId, newStatus);
      if (response.status) {
        toast({
          title: 'Success',
          description: 'Enquiry status updated successfully.',
        });
        fetchEnquiries();
        if (selectedEnquiry?.id === enquiryId) {
          setSelectedEnquiry({ ...selectedEnquiry, status: newStatus });
        }
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update status.',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'default' as const, label: 'Pending', className: 'bg-yellow-100 text-yellow-700' },
      replied: { variant: 'default' as const, label: 'Replied', className: 'bg-blue-100 text-blue-700' },
      resolved: { variant: 'default' as const, label: 'Resolved', className: 'bg-green-100 text-green-700' },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading && enquiries.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-10 w-64" />
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Contact Enquiries
          </h1>
          <p className="text-muted-foreground mt-1">Manage and respond to customer enquiries</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Enquiries</p>
                <p className="text-2xl font-bold text-foreground">{totalEnquiries}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {enquiries.filter((e) => e.status === 'pending').length}
                </p>
              </div>
              <Mail className="w-8 h-8 text-yellow-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Replied</p>
                <p className="text-2xl font-bold text-blue-600">
                  {enquiries.filter((e) => e.status === 'replied').length}
                </p>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold text-green-600">
                  {enquiries.filter((e) => e.status === 'resolved').length}
                </p>
              </div>
              <MessageSquare className="w-8 h-8 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Enquiries List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by name, email, or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="replied">Replied</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : filteredEnquiries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No enquiries found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEnquiries.map((enquiry) => (
                    <TableRow key={enquiry.id}>
                      <TableCell className="font-medium">
                        {enquiry.first_name} {enquiry.last_name}
                      </TableCell>
                      <TableCell>{enquiry.email}</TableCell>
                      <TableCell>{enquiry.phone || '-'}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{enquiry.subject}</TableCell>
                      <TableCell>{getStatusBadge(enquiry.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(enquiry.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewEnquiry(enquiry.id)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing page {currentPage} of {totalPages} ({totalEnquiries} total)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enquiry Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Enquiry Details</DialogTitle>
            <DialogDescription>
              View and manage enquiry information
            </DialogDescription>
          </DialogHeader>
          
          {selectedEnquiry && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p className="text-base font-semibold">
                    {selectedEnquiry.first_name} {selectedEnquiry.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedEnquiry.status)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-base">{selectedEnquiry.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <p className="text-base">{selectedEnquiry.phone || '-'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Subject</p>
                  <p className="text-base">{selectedEnquiry.subject}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Message</p>
                  <p className="text-base whitespace-pre-wrap bg-muted p-3 rounded-md mt-1">
                    {selectedEnquiry.message}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Submitted</p>
                  <p className="text-base">{formatDate(selectedEnquiry.created_at)}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-medium text-muted-foreground mb-2">Update Status</p>
                <div className="flex gap-2">
                  <Button
                    variant={selectedEnquiry.status === 'pending' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusUpdate(selectedEnquiry.id, 'pending')}
                  >
                    Mark as Pending
                  </Button>
                  <Button
                    variant={selectedEnquiry.status === 'replied' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusUpdate(selectedEnquiry.id, 'replied')}
                  >
                    Mark as Replied
                  </Button>
                  <Button
                    variant={selectedEnquiry.status === 'resolved' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusUpdate(selectedEnquiry.id, 'resolved')}
                  >
                    Mark as Resolved
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}


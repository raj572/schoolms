import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Search, 
  Eye, 
  MoreVertical,
  Users,
  Calendar,
  Plus,
  Edit,
  Ban,
  Power,
  Loader2,
  CreditCard
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import Heading from '@/components/common/Heading';
import SchoolFormDialog from '@/components/administrator/SchoolFormDialog';
import SchoolDetailsDialog from '@/components/administrator/SchoolDetailsDialog';
import SubscriptionAssignmentDialog from '@/components/administrator/SubscriptionAssignmentDialog';
import { School, getAllSchools, toggleSchoolStatus, getSchoolSubscription, assignSubscription, SubscriptionAssignment } from '@/services/administratorApiService';

interface SchoolSubscription {
  status: string;
  plan?: {
    display_name?: string;
  };
}

export default function Schools() {
  const { toast } = useToast();
  const [schools, setSchools] = useState<School[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  
  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isToggleDialogOpen, setIsToggleDialogOpen] = useState(false);
  const [isSubscriptionDialogOpen, setIsSubscriptionDialogOpen] = useState(false);
  
  // Selected school states
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [selectedSchoolId, setSelectedSchoolId] = useState<number | null>(null);
  const [schoolToToggle, setSchoolToToggle] = useState<School | null>(null);
  
  // Subscription states
  const [selectedSchoolForSubscription, setSelectedSchoolForSubscription] = useState<School | null>(null);
  const [schoolSubscriptions, setSchoolSubscriptions] = useState<Map<number, SchoolSubscription>>(new Map());

  useEffect(() => {
    fetchSchools();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus]);

  useEffect(() => {
    // Fetch subscriptions for all loaded schools
    schools.forEach((school) => {
      if (!schoolSubscriptions.has(school.id)) {
        fetchSchoolSubscription(school.id);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schools]);

  const fetchSchools = async () => {
    setIsLoading(true);
    try {
      const filters: Record<string, string> = {};
      if (filterStatus !== 'all') {
        filters.status = filterStatus;
      }

      const response = await getAllSchools(filters);
      
      if (response.status && response.data) {
        setSchools(Array.isArray(response.data) ? response.data : []);
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: response.message || 'Failed to fetch schools',
        });
      }
    } catch (error) {
      console.error('Error fetching schools:', error);
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err?.response?.data?.message || 'Failed to fetch schools',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSchool = () => {
    setSelectedSchool(null);
    setIsFormOpen(true);
  };

  const handleEditSchool = (school: School) => {
    setSelectedSchool(school);
    setIsFormOpen(true);
  };

  const handleViewDetails = (schoolId: number) => {
    setSelectedSchoolId(schoolId);
    setIsDetailsOpen(true);
  };

  const handleToggleStatusClick = (school: School) => {
    setSchoolToToggle(school);
    setIsToggleDialogOpen(true);
  };

  const handleToggleStatusConfirm = async () => {
    if (!schoolToToggle) return;

    try {
      const response = await toggleSchoolStatus(schoolToToggle.id);
      
      if (response.status) {
        const newStatus = response.data.status;
        toast({
          title: 'Success',
          description: `School ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`,
        });
        fetchSchools(); // Refresh the list
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: response.message || 'Failed to update school status',
        });
      }
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err?.response?.data?.message || 'Failed to update school status',
      });
    } finally {
      setIsToggleDialogOpen(false);
      setSchoolToToggle(null);
    }
  };

  const handleFormSuccess = () => {
    fetchSchools(); // Refresh the list after create/update
  };

  const fetchSchoolSubscription = async (schoolId: number) => {
    try {
      const response = await getSchoolSubscription(schoolId);
      if (response.status && response.data) {
        setSchoolSubscriptions((prev) => new Map(prev).set(schoolId, response.data));
      }
    } catch (error) {
      // Silently fail - school might not have a subscription yet
      console.log(`No subscription found for school ${schoolId}`);
    }
  };

  const handleManageSubscription = (school: School) => {
    setSelectedSchoolForSubscription(school);
    setIsSubscriptionDialogOpen(true);
  };

  const handleSubscriptionSuccess = () => {
    // Subscription was successfully assigned (either trial or after payment)
    // Just refresh the data
    if (selectedSchoolForSubscription) {
      fetchSchoolSubscription(selectedSchoolForSubscription.id);
    }
    fetchSchools();
  };

  const getSubscriptionBadge = (schoolId: number) => {
    const subscription = schoolSubscriptions.get(schoolId);
    if (!subscription) {
      return <Badge variant="outline" className="bg-gray-100 text-gray-600">No Subscription</Badge>;
    }

    const statusColors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      trial: 'bg-blue-100 text-blue-800',
      expired: 'bg-red-100 text-red-800',
      canceled: 'bg-gray-100 text-gray-600',
      past_due: 'bg-amber-100 text-amber-800',
      suspended: 'bg-red-100 text-red-800',
    };

    return (
      <Badge className={statusColors[subscription.status] || 'bg-gray-100 text-gray-600'}>
        {subscription.plan?.display_name || subscription.status}
      </Badge>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredSchools = schools.filter(school => {
    const matchesSearch = 
      school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      school.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (school.principal_name && school.principal_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (school.email && school.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (school.school_code && school.school_code.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in w-full min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Heading
          title="Schools Management"
          description="View and manage all registered schools"
        />
        <Button onClick={handleAddSchool} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Add School
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search by school name, city, or principal..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-4 mt-4">
            <div className="text-sm text-gray-600">
              <span className="font-semibold">{filteredSchools.length}</span> schools found
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Schools List */}
      {!isLoading && (
      <div className="grid gap-4">
        {filteredSchools.map((school) => (
          <Card key={school.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex gap-4 flex-1">
                  <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-8 w-8 text-primary" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-xl font-semibold text-foreground truncate">{school.name}</h3>
                        <p className="text-sm text-muted-foreground">{school.city}, {school.state}</p>
                        {school.school_code && (
                          <p className="text-xs text-muted-foreground mt-1 font-mono">Code: {school.school_code}</p>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {school.board && <Badge variant="outline">{school.board}</Badge>}
                        {getSubscriptionBadge(school.id)}
                        <Badge className={getStatusColor(school.status)}>
                          {school.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 bg-muted/30 p-3 rounded-lg border border-border/40">
                      {school.principal_name && (
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground font-medium">Principal</p>
                          <p className="text-sm font-semibold text-foreground truncate">{school.principal_name}</p>
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground font-medium">Email</p>
                        <p className="text-sm font-semibold text-foreground truncate" title={school.email}>{school.email || 'N/A'}</p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground font-medium">Phone</p>
                        <p className="text-sm font-semibold text-foreground truncate">{school.phone || 'N/A'}</p>
                      </div>
                    </div>

                    {school.created_at && (
                      <div className="flex items-center gap-6 mt-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Created: {new Date(school.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleViewDetails(school.id)}>
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEditSchool(school)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit School
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleManageSubscription(school)}>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Manage Subscription
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleToggleStatusClick(school)}
                      className={school.status === 'active' ? 'text-amber-600' : 'text-green-600'}
                    >
                      {school.status === 'active' ? (
                        <>
                          <Ban className="w-4 h-4 mr-2" />
                          Disable School
                        </>
                      ) : (
                        <>
                          <Power className="w-4 h-4 mr-2" />
                          Enable School
                        </>
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      )}

      {!isLoading && filteredSchools.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No schools found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
            {schools.length === 0 && (
              <Button onClick={handleAddSchool}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First School
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <SchoolFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        school={selectedSchool}
        onSuccess={handleFormSuccess}
      />

      <SchoolDetailsDialog
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        schoolId={selectedSchoolId}
      />

      <AlertDialog open={isToggleDialogOpen} onOpenChange={setIsToggleDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {schoolToToggle?.status === 'active' ? 'Disable School?' : 'Enable School?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {schoolToToggle?.status === 'active' ? (
                <>
                  This will deactivate <strong>{schoolToToggle?.name}</strong>.
                  The school will no longer be able to access the system until it is re-enabled.
                  All data will be preserved and can be accessed again once re-enabled.
                </>
              ) : (
                <>
                  This will activate <strong>{schoolToToggle?.name}</strong>.
                  The school will be able to access the system again.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleToggleStatusConfirm}
              className={schoolToToggle?.status === 'active' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-green-600 hover:bg-green-700'}
            >
              {schoolToToggle?.status === 'active' ? 'Disable' : 'Enable'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Subscription Management Dialog */}
      {selectedSchoolForSubscription && (
        <SubscriptionAssignmentDialog
          open={isSubscriptionDialogOpen}
          onOpenChange={setIsSubscriptionDialogOpen}
          schoolId={selectedSchoolForSubscription.id}
          schoolName={selectedSchoolForSubscription.name}
          onSuccess={handleSubscriptionSuccess}
        />
      )}

    </div>
  );
}


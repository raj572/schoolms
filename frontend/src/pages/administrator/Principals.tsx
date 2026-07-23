import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  UserCircle, 
  Search, 
  Eye, 
  MoreVertical,
  Plus,
  Edit,
  Trash2,
  Loader2,
  Mail,
  Key,
  Building2,
  Link,
  Unlink
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
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
import PrincipalFormDialog from '@/components/administrator/PrincipalFormDialog';
import PrincipalDetailsDialog from '@/components/administrator/PrincipalDetailsDialog';
import AssignSchoolDialog from '@/components/administrator/AssignSchoolDialog';
import { 
  Principal, 
  getAllPrincipals, 
  deletePrincipal,
  togglePrincipalStatus,
  resendPrincipalCredentials,
  resetPrincipalPassword,
  unassignPrincipalFromSchool
} from '@/services/administratorApiService';

export default function Principals() {
  const { toast } = useToast();
  const [principals, setPrincipals] = useState<Principal[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  
  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAssignSchoolDialogOpen, setIsAssignSchoolDialogOpen] = useState(false);
  
  // Selected principal states
  const [selectedPrincipal, setSelectedPrincipal] = useState<Principal | null>(null);
  const [principalToDelete, setPrincipalToDelete] = useState<Principal | null>(null);
  const [principalForSchoolAssignment, setPrincipalForSchoolAssignment] = useState<Principal | null>(null);

  useEffect(() => {
    fetchPrincipals();
  }, [filterStatus]);

  const fetchPrincipals = async () => {
    setIsLoading(true);
    try {
      const response = await getAllPrincipals();
      console.log('Principals API response:', response);
      
      if (response.status && response.data) {
        setPrincipals(Array.isArray(response.data) ? response.data : []);
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: response.message || 'Failed to fetch principals',
        });
      }
    } catch (error: any) {
      console.error('Error fetching principals:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to fetch principals',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePrincipal = () => {
    setSelectedPrincipal(null);
    setIsFormOpen(true);
  };

  const handleEditPrincipal = (principal: Principal) => {
    setSelectedPrincipal(principal);
    setIsFormOpen(true);
  };

  const handleViewDetails = (principal: Principal) => {
    setSelectedPrincipal(principal);
    setIsDetailsOpen(true);
  };

  const handleDeleteClick = (principal: Principal) => {
    setPrincipalToDelete(principal);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!principalToDelete) return;

    try {
      const response = await deletePrincipal(principalToDelete.id);
      
      if (response.status) {
        toast({
          title: 'Success',
          description: 'Principal deleted successfully',
        });
        fetchPrincipals();
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: response.message || 'Failed to delete principal',
        });
      }
    } catch (error: any) {
      console.error('Error deleting principal:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to delete principal',
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setPrincipalToDelete(null);
    }
  };

  const handleToggleStatus = async (principal: Principal) => {
    try {
      const response = await togglePrincipalStatus(principal.id);
      
      if (response.status) {
        toast({
          title: 'Success',
          description: `Principal ${response.data.status === 'active' ? 'activated' : 'deactivated'} successfully`,
        });
        fetchPrincipals();
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: response.message || 'Failed to update principal status',
        });
      }
    } catch (error: any) {
      console.error('Error toggling principal status:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to update principal status',
      });
    }
  };

  const handleResendCredentials = async (principal: Principal) => {
    try {
      const response = await resendPrincipalCredentials(principal.id);
      
      if (response.status) {
        toast({
          title: 'Success',
          description: 'Credentials sent to principal email',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: response.message || 'Failed to send credentials',
        });
      }
    } catch (error: any) {
      console.error('Error resending credentials:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to send credentials',
      });
    }
  };

  const handleResetPassword = async (principal: Principal) => {
    try {
      const response = await resetPrincipalPassword(principal.id);
      
      if (response.status) {
        toast({
          title: 'Success',
          description: 'Password reset successfully and sent to principal email',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: response.message || 'Failed to reset password',
        });
      }
    } catch (error: any) {
      console.error('Error resetting password:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to reset password',
      });
    }
  };

  const handleAssignSchool = (principal: Principal) => {
    setPrincipalForSchoolAssignment(principal);
    setIsAssignSchoolDialogOpen(true);
  };

  const handleUnassignSchool = async (principal: Principal) => {
    try {
      const response = await unassignPrincipalFromSchool(principal.id);
      
      if (response.status) {
        toast({
          title: 'Success',
          description: 'Principal unassigned from school successfully',
        });
        fetchPrincipals();
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: response.message || 'Failed to unassign principal',
        });
      }
    } catch (error: any) {
      console.error('Error unassigning principal:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to unassign principal',
      });
    }
  };

  const filteredPrincipals = principals.filter((principal) => {
    const matchesSearch = 
      principal.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      principal.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      principal.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      principal.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (principal.school?.name || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = 
      filterStatus === 'all' || 
      principal.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: principals.length,
    active: principals.filter(p => p.status === 'active').length,
    inactive: principals.filter(p => p.status === 'inactive').length,
    assigned: principals.filter(p => p.school_id).length,
    unassigned: principals.filter(p => !p.school_id).length,
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Heading
        title="Principal Management"
        description="Manage principals, assign them to schools, and handle their credentials"
        icon={UserCircle}
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total Principals</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Active</div>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Inactive</div>
            <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Assigned</div>
            <div className="text-2xl font-bold text-blue-600">{stats.assigned}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Unassigned</div>
            <div className="text-2xl font-bold text-orange-600">{stats.unassigned}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="flex-1 flex gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search principals by name, email, phone, or school..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border rounded-md bg-background"
                title="Filter by status"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            
            <Button onClick={handleCreatePrincipal}>
              <Plus className="mr-2 h-4 w-4" />
              Add Principal
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Principals List */}
      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredPrincipals.length === 0 ? (
            <div className="text-center py-12">
              <UserCircle className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No principals found</h3>
              <p className="text-muted-foreground">
                {searchQuery || filterStatus !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Get started by creating your first principal'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Name</th>
                    <th className="text-left py-3 px-4 font-medium">Username</th>
                    <th className="text-left py-3 px-4 font-medium">Email</th>
                    <th className="text-left py-3 px-4 font-medium">Phone</th>
                    <th className="text-left py-3 px-4 font-medium">Assigned School</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-right py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPrincipals.map((principal) => (
                    <tr key={principal.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <UserCircle className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{principal.full_name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <code className="text-sm bg-muted px-2 py-1 rounded">{principal.username}</code>
                      </td>
                      <td className="py-3 px-4 text-sm">{principal.email}</td>
                      <td className="py-3 px-4 text-sm">{principal.phone}</td>
                      <td className="py-3 px-4">
                        {principal.school ? (
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="text-sm font-medium">{principal.school.name}</div>
                              <div className="text-xs text-muted-foreground">{principal.school.school_code}</div>
                            </div>
                          </div>
                        ) : (
                          <Badge variant="outline">Not Assigned</Badge>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={principal.status === 'active' ? 'default' : 'secondary'}>
                          {principal.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => handleViewDetails(principal)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditPrincipal(principal)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {principal.school_id ? (
                              <DropdownMenuItem onClick={() => handleUnassignSchool(principal)}>
                                <Unlink className="mr-2 h-4 w-4" />
                                Unassign School
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleAssignSchool(principal)}>
                                <Link className="mr-2 h-4 w-4" />
                                Assign to School
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleResendCredentials(principal)}>
                              <Mail className="mr-2 h-4 w-4" />
                              Resend Credentials
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleResetPassword(principal)}>
                              <Key className="mr-2 h-4 w-4" />
                              Reset Password
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleToggleStatus(principal)}>
                              {principal.status === 'active' ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(principal)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <PrincipalFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        principal={selectedPrincipal}
        onSuccess={fetchPrincipals}
      />

      <PrincipalDetailsDialog
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        principal={selectedPrincipal}
      />

      <AssignSchoolDialog
        open={isAssignSchoolDialogOpen}
        onOpenChange={setIsAssignSchoolDialogOpen}
        principal={principalForSchoolAssignment}
        onSuccess={fetchPrincipals}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the principal "{principalToDelete?.full_name}". 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}


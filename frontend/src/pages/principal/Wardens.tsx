import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Shield, 
  Search, 
  Plus,
  Edit,
  Trash2,
  Loader2,
  Mail,
  Phone,
  Key,
  Building2,
  UserCircle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/useAuthStore';
import Heading from '@/components/common/Heading';
import { 
  getAllWardens,
  createWarden,
  updateWarden,
  deleteWarden,
  toggleWardenStatus,
  resetWardenPassword
} from '@/services/wardenApiService';
import { getAllBuildings } from '@/services/hostelApiService';

interface Warden {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  username: string;
  status: string;
  school_id: number;
}

export default function Wardens() {
  const { toast } = useToast();
  const authUser = useAuthStore((state) => state.authUser);
  const [wardens, setWardens] = useState<Warden[]>([]);
  const [buildings, setBuildings] = useState<Array<{ id: number; warden_id?: number; warden?: { id: number }; building_name: string }>>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    username: '',
    status: 'active',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingWardenId, setEditingWardenId] = useState<number | null>(null);
  const [wardenToDelete, setWardenToDelete] = useState<Warden | null>(null);

  useEffect(() => {
    if (authUser?.school_id) {
      fetchWardens();
      fetchBuildings();
    }
  }, [authUser?.school_id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchWardens = async () => {
    setIsLoading(true);
    try {
      const response = await getAllWardens();
      if (response.status && response.data) {
        setWardens(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch wardens';
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBuildings = async () => {
    if (!authUser?.school_id) return;
    try {
      const response = await getAllBuildings(Number(authUser.school_id));
      if (response.status && response.data) {
        setBuildings(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching buildings:', error);
    }
  };

  const getWardenBuilding = (wardenId: number) => {
    return buildings.find((b: { warden_id?: number; warden?: { id: number } }) => 
      b.warden_id === wardenId || b.warden?.id === wardenId
    );
  };

  const handleCreate = () => {
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      username: '',
      status: 'active',
    });
    setIsEditing(false);
    setEditingWardenId(null);
    setIsFormOpen(true);
  };

  const handleEdit = (warden: Warden) => {
    setFormData({
      full_name: warden.full_name,
      email: warden.email,
      phone: warden.phone,
      username: warden.username,
      status: warden.status,
    });
    setIsEditing(true);
    setEditingWardenId(warden.id);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let response;
      if (isEditing && editingWardenId) {
        response = await updateWarden(editingWardenId, formData);
      } else {
        response = await createWarden(formData);
      }

      if (response.status) {
        toast({
          title: 'Success',
          description: isEditing ? 'Warden updated successfully' : 'Warden created successfully',
        });
        setIsFormOpen(false);
        fetchWardens();
        fetchBuildings();
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: response.message || 'Operation failed',
        });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Operation failed';
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
    }
  };

  const handleDeleteClick = (warden: Warden) => {
    setWardenToDelete(warden);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!wardenToDelete) return;

    try {
      const response = await deleteWarden(wardenToDelete.id);
      
      if (response.status) {
        toast({
          title: 'Success',
          description: 'Warden deleted successfully',
        });
        fetchWardens();
        fetchBuildings();
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: response.message || 'Failed to delete warden',
        });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete warden';
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setWardenToDelete(null);
    }
  };

  const handleToggleStatus = async (warden: Warden) => {
    try {
      const response = await toggleWardenStatus(warden.id);
      
      if (response.status) {
        toast({
          title: 'Success',
          description: `Warden ${response.data.status === 'active' ? 'activated' : 'deactivated'} successfully`,
        });
        fetchWardens();
      }
    } catch (error: unknown) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update status',
      });
    }
  };

  const handleResetPassword = async (warden: Warden) => {
    try {
      const response = await resetWardenPassword(warden.id);
      
      if (response.status) {
        toast({
          title: 'Success',
          description: 'Password reset successfully. New password sent to email.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: response.message || 'Failed to reset password',
        });
      }
    } catch (error: unknown) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to reset password',
      });
    }
  };

  const filteredWardens = wardens.filter(warden =>
    warden.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    warden.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    warden.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: wardens.length,
    active: wardens.filter(w => w.status === 'active').length,
    inactive: wardens.filter(w => w.status === 'inactive').length,
    assigned: wardens.filter(w => getWardenBuilding(w.id)).length,
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Heading
        title="Warden Management"
        description="Manage wardens, assign them to hostel buildings, and handle their credentials"
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total Wardens</div>
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
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search wardens..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Create Warden
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Wardens Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredWardens.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              No wardens found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Assigned Building</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWardens.map((warden) => {
                  const building = getWardenBuilding(warden.id);
                  return (
                    <TableRow key={warden.id}>
                      <TableCell className="font-medium">{warden.full_name}</TableCell>
                      <TableCell>{warden.email}</TableCell>
                      <TableCell>{warden.phone || '-'}</TableCell>
                      <TableCell>{warden.username}</TableCell>
                      <TableCell>
                        {building ? (
                          <Badge variant="outline">
                            <Building2 className="h-3 w-3 mr-1" />
                            {building.building_name}
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Unassigned</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={warden.status === 'active' ? 'default' : 'secondary'}>
                          {warden.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(warden)}
                          >
                            {warden.status === 'active' ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResetPassword(warden)}
                            title="Reset Password"
                          >
                            <Key className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(warden)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(warden)}
                            disabled={!!building}
                            title={building ? 'Cannot delete: assigned to building' : 'Delete'}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Warden' : 'Create New Warden'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Update warden information' : 'Create a new warden account. Credentials will be sent via email.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  disabled={isEditing}
                />
              </div>
              {isEditing && (
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    title="Status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {isEditing ? 'Update' : 'Create'} Warden
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the warden account
              {wardenToDelete && ` for ${wardenToDelete.full_name}`}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Eye, Edit, Trash2, ToggleLeft } from "lucide-react";
import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import { useUsersStore, UserData } from "@/store/useUsersStore";
import Heading from "@/components/common/Heading";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const UserList = () => {
  const {authUser}  = useAuthStore();
  const school_id = authUser.school_id;

  const {getAllUsers, updateUser, toggleStatus} = useUsersStore();
  const [users, setUsers] = useState<UserData[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

    const [open, setOpen] = useState(false);

    const [status, setStatus] = useState();

  const [formData, setFormData] = React.useState<UserData>({
      username: "",
      phone: "",
    })

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingUser, setEditingUser] = useState<number | null>(null);


  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const data = await getAllUsers(school_id);
        console.log('Fetched users data:', data);
        
        // Handle the API response structure
        if (data && Array.isArray(data)) {
          setUsers(data);
        } else if (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data)) {
          setUsers(data.data);
        } else {
          setUsers([]);
        }
      } catch (error: any) {
        console.error("Failed to fetch users:", error);
        toast.error("Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    if (school_id) {
      fetchUsers();
    }
  }, [getAllUsers, school_id]);


const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const success = await updateUser(editingUser, formData);
  if (success) {
    console.log("User updated successfully");

    // Reset form
    setFormData({
      username: "",
      phone: "",
    });
    setEditingUser(null);
    setEditingIndex(null)
    setOpen(false);
  }
};

  const handleDelete = (id: number) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const filteredUsers = users.filter(
    u =>
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen ">
      <div className="max-w-7xl mx-auto ">
        {/* Header */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-0 md:justify-between md:items-center mb-8">
          <Heading title="User Management" description="Manage all user records and information" />
          
          <div className="flex gap-2">
            <Link to="/principal/dashboard">
              <Button variant="outline" className=" ">Back to Dashboard</Button>
            </Link>
            <Link to="/principal/users/register">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </Link>
          </div>
        </div>

        {/* Edit Form */}
        <div>
          <Dialog open={open} onOpenChange={setOpen} >
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-lg text-center">Edit User</DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={formData.username || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                    placeholder="e.g., John Doe"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="e.g., +1234567890"
                  />
                </div>

                <div className="flex justify-center md:justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Update User</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{users.length}</div>
              <div className="text-sm text-muted-foreground">Total Users</div>
            </CardContent>
          </Card>
          <Card className="">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {users.filter(u => u.status === "active").length}
              </div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
          <Card>
            <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle className="text-lg">All Users</CardTitle>
              <div className="relative w-full sm:w-64">
                <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 " />
                </span>
                <Input
                  placeholder="Search users..."
                  className="pl-10 w-full"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <p className="text-sm text-center">Loading...</p>
              ) : filteredUsers.length === 0 ? (
                <p className="text-sm text-center">No users found.</p>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden sm:block">
                    <Table className="min-w-full">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Username</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead className="text-center">Status</TableHead>
                          <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map(user => {
                          const isAdministrator = user.role === "administrator";
                          return (
                          <TableRow key={user.id} className="text-xs font-medium">
                            <TableCell>{user.username}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.phone}</TableCell>
                            <TableCell>
                              {user.role}
                              {isAdministrator && (
                                <span className="ml-2 text-xs text-amber-600">(Protected)</span>
                              )}
                            </TableCell>
                            <TableCell className=" text-center ">
                              <Switch
                                checked={user.status === "active"}
                                disabled={isAdministrator}
                                onCheckedChange={async (checked) => {
                                  if (isAdministrator) {
                                    toast.error("Cannot modify administrator status");
                                    return;
                                  }
                                  const newStatus = checked ? "active" : "inactive";
                                  const updatedUser = { ...user, status: newStatus };
                                  const success = await toggleStatus(user.id, updatedUser);
                                  if (success) {
                                    setUsers(prev =>
                                      prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u)
                                    );
                                  }
                                }}
                              />
                            </TableCell>
                            <TableCell className="text-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={isAdministrator}
                                onClick={() => {
                                  if (isAdministrator) {
                                    toast.error("Cannot edit administrator details");
                                    return;
                                  }
                                  setEditingUser(user.id);
                                  setFormData(user);
                                  setOpen(true);
                                }}
                                title={isAdministrator ? "Administrator accounts cannot be edited" : "Edit user"}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        )})}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="sm:hidden space-y-4">
                    {filteredUsers.map(user => {
                      const isAdministrator = user.role === "administrator";
                      return (
                      <div key={user.id} className="border-b border-border py-4 ">
                        <div className="flex justify-between items-center mb-2">
                          <p className="font-medium">{user.username}</p>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={user.status === "active"}
                              disabled={isAdministrator}
                              onCheckedChange={async (checked) => {
                                if (isAdministrator) {
                                  toast.error("Cannot modify administrator status");
                                  return;
                                }
                                const newStatus = checked ? "active" : "inactive";
                                const updatedUser = { ...user, status: newStatus };
                                const success = await toggleStatus(user.id, updatedUser);
                                if (success) {
                                  setUsers(prev =>
                                    prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u)
                                  );
                                }
                              }}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={isAdministrator}
                              onClick={() => {
                                if (isAdministrator) {
                                  toast.error("Cannot edit administrator details");
                                  return;
                                }
                                setEditingUser(user.id);
                                setFormData(user);
                                setOpen(true);
                              }}
                              title={isAdministrator ? "Administrator accounts cannot be edited" : "Edit user"}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-1 text-sm text-slate-400">
                          <p><span className="font-medium">Email:</span> {user.email}</p>
                          <p><span className="font-medium">Phone:</span> {user.phone}</p>
                          <p>
                            <span className="font-medium">Role:</span> {user.role}
                            {isAdministrator && (
                              <span className="ml-2 text-xs text-amber-600">(Protected)</span>
                            )}
                          </p>
                        </div>
                      </div>
                    )})}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

      </div>
    </div>
  );
};

export default UserList;

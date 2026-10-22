import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { API_BASE_URL } from '@/lib/axios';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Users,
  UserCheck,
  UserX,
  Shield,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Mail,
  Phone,
  Calendar,
  MoreHorizontal,
  Loader2
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useUsersStore } from "@/store/useUsersStore";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  status: string;
  joinDate: string;
  avatar: string;
  permissions: string[];
  rawId?: number | string;
  isTeacher?: boolean;
}

export const UserManagement = () => {
  const navigate = useNavigate();
  const authUser = useAuthStore((state) => state.authUser);
  const { updateUser, toggleStatus, updateTeacher, deleteTeacher } = useUsersStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  
  // Action Modals State
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    phone: "",
    department: "General",
    status: "Active",
  });

  const { toast } = useToast();

  // Define permission templates for all 7 roles
  const permissionTemplates: Record<string, { label: string; permissions: string[]; canEdit: boolean }> = {
    'Administrator': {
      label: 'Administrator',
      permissions: ['Full System Access', 'Manage All Schools', 'User Management', 'System Settings', 'Reports', 'Dashboard Access'],
      canEdit: false // Principal cannot edit Administrator permissions
    },
    'Principal': {
      label: 'Principal',
      permissions: ['School Management', 'User Management', 'Attendance Management', 'Fee Management', 'Reports', 'Analytics', 'Settings'],
      canEdit: true
    },
    'Teacher': {
      label: 'Teacher',
      permissions: ['View Students', 'Grade Management', 'Mark Attendance', 'Create Assignments', 'View Reports', 'Class Timetable'],
      canEdit: true
    },
    'Accountant': {
      label: 'Accountant',
      permissions: ['Fee Collection', 'Payment Reports', 'Financial Reports', 'Generate Invoices', 'Payment Tracking', 'View Students'],
      canEdit: true
    },
    'Librarian': {
      label: 'Librarian',
      permissions: ['Book Management', 'Issue Books', 'Return Books', 'View Library Statistics', 'Manage Categories', 'Track Overdue Books'],
      canEdit: true
    },
    'Parent': {
      label: 'Parent',
      permissions: ['View Child Progress', 'Fee Payments', 'View Attendance', 'Exam Results', 'School Notices', 'Contact Teachers'],
      canEdit: true
    },
    'Student': {
      label: 'Student',
      permissions: ['View Timetable', 'View Assignments', 'View Results', 'View Attendance', 'Download Certificates', 'Contact Teachers'],
      canEdit: true
    }
  };

  // Fetch users data from API
  useEffect(() => {
    const fetchUsers = async () => {
      if (!authUser?.school_id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // Fetch all user types in parallel
        const [usersResponse, teachersResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/principal/user/getall/${authUser.school_id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }),
          fetch(`${API_BASE_URL}/principal/teacher/getall/${authUser.school_id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          })
        ]);

        const allUsers: User[] = [];

        // Process system users
        if (usersResponse.ok) {
          const result = await usersResponse.json();
          const systemUsers = result.data?.map((user: any) => ({
            id: user.id?.toString(),
            rawId: user.id,
            isTeacher: false,
            name: user.full_name || user.username || 'Unknown',
            email: user.email || '',
            phone: user.phone || '+91 0000000000',
            role: user.role || 'User',
            department: user.role === 'administrator' ? 'Administration' : 'General',
            status: user.status === 'active' ? 'Active' : 'Inactive',
            joinDate: user.created_at ? new Date(user.created_at).toISOString().split('T')[0] : '2024-01-01',
            avatar: '',
            permissions: user.role === 'administrator' ? ['Full Access', 'User Management', 'System Settings'] : []
          })) || [];
          allUsers.push(...systemUsers);
        }

        // Process teachers
        if (teachersResponse.ok) {
          const teachersResult = await teachersResponse.json();
          const teachers = teachersResult.data?.map((teacher: any, index: number) => ({
            id: `TEACH${teacher.id || index}`,
            rawId: teacher.id,
            isTeacher: true,
            name: teacher.name || 'Unknown Teacher',
            email: teacher.email || '',
            phone: teacher.phone || '+91 0000000000',
            role: 'teacher',
            department: 'Education',
            status: teacher.status === 'active' ? 'Active' : 'Inactive',
            joinDate: teacher.created_at ? new Date(teacher.created_at).toISOString().split('T')[0] : '2024-01-01',
            avatar: '',
            permissions: ['View Students', 'Grade Management', 'Attendance']
          })) || [];
          allUsers.push(...teachers);
        }

        setUsers(allUsers);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users data');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [authUser]);

  // Calculate dynamic stats from users data
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'Active').length;
  const inactiveUsers = totalUsers - activeUsers;
  const adminCount = users.filter(u => u.role === 'administrator').length;

  // Calculate role distribution
  const teacherCount = users.filter(u => u.role?.toLowerCase() === 'teacher').length;
  const parentCount = users.filter(u => u.role?.toLowerCase() === 'parent').length;
  const othersCount = users.filter(u => {
    const role = u.role?.toLowerCase();
    return role && !['teacher', 'parent', 'administrator', 'principal'].includes(role);
  }).length;

  const roleStats = [
    { role: "Teachers", count: teacherCount, color: "text-primary" },
    { role: "Parents", count: parentCount, color: "text-success" },
    { role: "Administrators", count: adminCount, color: "text-warning" },
    { role: "Others", count: othersCount, color: "text-secondary" }
  ];

  // All available permissions for all roles
  const permissions = [
    "Full System Access", "Manage All Schools", "User Management", "System Settings",
    "School Management", "Attendance Management", "Fee Management", "Reports", "Analytics",
    "View Students", "Grade Management", "Mark Attendance", "Create Assignments", "View Reports", "Class Timetable",
    "Fee Collection", "Payment Reports", "Financial Reports", "Generate Invoices", "Payment Tracking",
    "Book Management", "Issue Books", "Return Books", "View Library Statistics", "Manage Categories", "Track Overdue Books",
    "View Child Progress", "Fee Payments", "Exam Results", "School Notices", "Contact Teachers",
    "View Timetable", "View Assignments", "View Results", "View Attendance", "Download Certificates"
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.role.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === "all") return matchesSearch;
    
    const userRole = user.role?.toLowerCase() || '';
    const filterRole = activeTab.toLowerCase();
    
    if (filterRole === 'teacher' && userRole === 'teacher') return matchesSearch;
    if (filterRole === 'parent' && userRole === 'parent') return matchesSearch;
    if (filterRole === 'administrator' && (userRole === 'administrator' || userRole === 'principal')) return matchesSearch;
    
    return false;
  });

  const getRoleColor = (role: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (role?.toLowerCase()) {
      case "teacher": return "default";
      case "parent": return "secondary";
      case "administrator": return "destructive";
      case "principal": return "default";
      case "support staff": return "outline";
      default: return "outline";
    }
  };

  // Action: Open Edit User Modal
  const handleEditUser = (user: User) => {
    if (user.role?.toLowerCase() === 'administrator') {
      toast({
        title: "Protected Account",
        description: "Administrator accounts cannot be modified here.",
        variant: "destructive"
      });
      return;
    }

    setEditingUser(user);
    setEditFormData({
      name: user.name,
      phone: user.phone,
      department: user.department || "General",
      status: user.status || "Active",
    });
  };

  // Action: Save Edited User
  const handleSaveUser = async () => {
    if (!editingUser) return;

    try {
      if (editingUser.isTeacher && editingUser.rawId && authUser?.school_id) {
        const success = await updateTeacher(Number(editingUser.rawId), authUser.school_id, {
          name: editFormData.name,
          phone: editFormData.phone,
          status: editFormData.status.toLowerCase(),
        });

        if (success) {
          setUsers(prev => prev.map(u => u.id === editingUser.id ? {
            ...u,
            name: editFormData.name,
            phone: editFormData.phone,
            department: editFormData.department,
            status: editFormData.status,
          } : u));
          toast({
            title: "User Updated",
            description: `${editFormData.name}'s details have been updated.`,
          });
          setEditingUser(null);
        }
      } else if (editingUser.rawId) {
        const success = await updateUser(Number(editingUser.rawId), {
          username: editFormData.name,
          phone: editFormData.phone,
          status: editFormData.status.toLowerCase(),
        });

        if (success) {
          setUsers(prev => prev.map(u => u.id === editingUser.id ? {
            ...u,
            name: editFormData.name,
            phone: editFormData.phone,
            department: editFormData.department,
            status: editFormData.status,
          } : u));
          toast({
            title: "User Updated",
            description: `${editFormData.name}'s details have been updated.`,
          });
          setEditingUser(null);
        }
      } else {
        // Fallback local state update
        setUsers(prev => prev.map(u => u.id === editingUser.id ? {
          ...u,
          name: editFormData.name,
          phone: editFormData.phone,
          department: editFormData.department,
          status: editFormData.status,
        } : u));
        toast({
          title: "User Updated",
          description: `${editFormData.name}'s details have been updated.`,
        });
        setEditingUser(null);
      }
    } catch (err) {
      console.error("Error saving user:", err);
      toast({
        title: "Error",
        description: "Failed to update user details.",
        variant: "destructive"
      });
    }
  };

  // Action: Toggle Active / Inactive Status
  const handleToggleStatus = async (user: User) => {
    if (user.role?.toLowerCase() === 'administrator') {
      toast({
        title: "Action Denied",
        description: "Cannot modify administrator status.",
        variant: "destructive"
      });
      return;
    }

    const nextStatus = user.status === "Active" ? "Inactive" : "Active";
    const apiStatus = nextStatus.toLowerCase();

    try {
      if (user.isTeacher && user.rawId && authUser?.school_id) {
        const success = await updateTeacher(Number(user.rawId), authUser.school_id, {
          status: apiStatus,
        });
        if (success) {
          setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: nextStatus } : u));
          toast({
            title: "Status Changed",
            description: `${user.name} is now ${nextStatus}.`,
          });
        }
      } else if (user.rawId) {
        const success = await toggleStatus(Number(user.rawId), { status: apiStatus });
        if (success) {
          setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: nextStatus } : u));
          toast({
            title: "Status Changed",
            description: `${user.name} is now ${nextStatus}.`,
          });
        }
      } else {
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: nextStatus } : u));
        toast({
          title: "Status Changed",
          description: `${user.name} is now ${nextStatus}.`,
        });
      }
    } catch (err) {
      console.error("Error changing status:", err);
      toast({
        title: "Error",
        description: "Failed to change user status.",
        variant: "destructive"
      });
    }
  };

  // Action: Delete User
  const handleDeleteUser = async (user: User) => {
    if (user.role?.toLowerCase() === 'administrator') {
      toast({
        title: "Action Denied",
        description: "Administrator accounts cannot be deleted.",
        variant: "destructive"
      });
      return;
    }

    try {
      if (user.isTeacher && user.rawId) {
        const success = await deleteTeacher(Number(user.rawId));
        if (success) {
          setUsers(prev => prev.filter(u => u.id !== user.id));
          toast({
            title: "User Deleted",
            description: `${user.name} was removed successfully.`,
          });
        }
      } else {
        // Fallback local remove
        setUsers(prev => prev.filter(u => u.id !== user.id));
        toast({
          title: "User Removed",
          description: `${user.name} was removed from the list.`,
        });
      }
    } catch (err) {
      console.error("Error deleting user:", err);
      toast({
        title: "Error",
        description: "Failed to delete user.",
        variant: "destructive"
      });
    }
  };

  // Handle edit template button clicks
  const handleEditTemplate = (templateType: string) => {
    setEditingTemplate(templateType);
    const template = permissionTemplates[templateType];
    if (template) {
      setSelectedPermissions([...template.permissions]);
    }
  };

  // Handle save template
  const handleSaveTemplate = () => {
    if (!editingTemplate) return;
    
    toast({
      title: "Template Updated",
      description: `${editingTemplate} permissions have been updated successfully.`,
    });
    
    setEditingTemplate(null);
    setSelectedPermissions([]);
  };

  // Toggle permission selection
  const togglePermission = (permission: string) => {
    if (selectedPermissions.includes(permission)) {
      setSelectedPermissions(selectedPermissions.filter(p => p !== permission));
    } else {
      setSelectedPermissions([...selectedPermissions, permission]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-gray-600">Loading users data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-bold text-foreground">User Management</h2>
          <p className="text-muted-foreground text-xs">Manage users, roles, and permissions</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline"
            onClick={() => {
              const el = document.getElementById("search-input");
              el?.focus();
            }}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filter Users
          </Button>
          <Button 
            className="bg-gradient-primary hover:opacity-90"
            onClick={() => navigate("/principal/users/register")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-card shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Total Users</p>
                <p className="text-lg font-bold">{totalUsers}</p>
              </div>
              <Users className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Active Users</p>
                <p className="text-lg font-bold text-success">{activeUsers}</p>
              </div>
              <UserCheck className="h-6 w-6 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Inactive Users</p>
                <p className="text-lg font-bold text-destructive">{inactiveUsers}</p>
              </div>
              <UserX className="h-6 w-6 text-destructive" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Admins</p>
                <p className="text-lg font-bold text-warning">{adminCount}</p>
              </div>
              <Shield className="h-6 w-6 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Role Distribution */}
      <Card className="bg-gradient-card shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg">User Distribution by Role</CardTitle>
          <CardDescription className="text-xs">Breakdown of users across different roles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {roleStats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className={`text-lg font-bold ${stat.color}`}>{stat.count}</p>
                <p className="text-xs text-muted-foreground">{stat.role}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <Card className="bg-gradient-card shadow-soft">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="search-input"
                placeholder="Search users by name, email, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant={activeTab === "all" ? "default" : "outline"} 
                size="sm"
                onClick={() => setActiveTab("all")}
              >
                All
              </Button>
              <Button 
                variant={activeTab === "teacher" ? "default" : "outline"} 
                size="sm"
                onClick={() => setActiveTab("teacher")}
              >
                Teachers
              </Button>
              <Button 
                variant={activeTab === "parent" ? "default" : "outline"} 
                size="sm"
                onClick={() => setActiveTab("parent")}
              >
                Parents
              </Button>
              <Button 
                variant={activeTab === "administrator" ? "default" : "outline"} 
                size="sm"
                onClick={() => setActiveTab("administrator")}
              >
                Admins
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="bg-gradient-card shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg">Users List</CardTitle>
          <CardDescription className="text-xs">Manage all system users and their permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right px-9">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => {
                    const isAdmin = user.role?.toLowerCase() === 'administrator';
                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback>
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{user.name}</p>
                              <p className="text-xs text-muted-foreground">{user.id}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getRoleColor(user.role)}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{user.department}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-xs">
                              <Mail className="h-3 w-3" />
                              <span className="truncate max-w-[120px]">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                              <Phone className="h-3 w-3" />
                              <span>{user.phone}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3" />
                            {user.joinDate}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={user.status === "Active" ? "default" : "secondary"}
                          >
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setViewingUser(user)}
                              title="View user details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditUser(user)}
                              title={isAdmin ? "Administrator accounts cannot be edited" : "Edit user"}
                              disabled={isAdmin}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" title="More options">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-44">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => setViewingUser(user)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleEditUser(user)}
                                  disabled={isAdmin}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit User
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleToggleStatus(user)}
                                  disabled={isAdmin}
                                >
                                  {user.status === "Active" ? (
                                    <>
                                      <UserX className="mr-2 h-4 w-4 text-amber-500" />
                                      Deactivate
                                    </>
                                  ) : (
                                    <>
                                      <UserCheck className="mr-2 h-4 w-4 text-emerald-500" />
                                      Activate
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => setUserToDelete(user)}
                                  disabled={isAdmin}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete User
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Permissions Management */}
      <Card className="bg-gradient-card shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg">Permission Templates</CardTitle>
          <CardDescription className="text-xs">Pre-defined permission sets for different user roles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(permissionTemplates).map(([key, template]) => (
              <Card 
                key={key} 
                className={`border ${template.canEdit ? '' : 'opacity-60'}`}
              >
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className={`h-5 w-5 ${
                      key === 'Administrator' ? 'text-red-600' :
                      key === 'Principal' ? 'text-blue-600' :
                      key === 'Teacher' ? 'text-green-600' :
                      key === 'Accountant' ? 'text-purple-600' :
                      key === 'Parent' ? 'text-orange-600' :
                      'text-gray-600'
                    }`} />
                    <h4 className="font-medium">{template.label}</h4>
                    {!template.canEdit && (
                      <Badge variant="outline" className="ml-auto text-xs">Locked</Badge>
                    )}
                  </div>
                  <div className="space-y-1 mb-3 max-h-32 overflow-y-auto">
                    {template.permissions.slice(0, 3).map((permission, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs mr-1 mb-1">
                        {permission}
                      </Badge>
                    ))}
                    {template.permissions.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{template.permissions.length - 3} more
                      </Badge>
                    )}
                  </div>
                  <Button 
                    className="w-full mt-4"
                    onClick={() => handleEditTemplate(key)}
                    disabled={!template.canEdit}
                    variant={!template.canEdit ? "outline" : "default"}
                  >
                    {template.canEdit ? 'Edit Template' : 'Cannot Edit'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* View User Details Dialog */}
      <Dialog open={viewingUser !== null} onOpenChange={(open) => !open && setViewingUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>Full profile details and system access permissions</DialogDescription>
          </DialogHeader>
          {viewingUser && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-3 pb-3 border-b">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={viewingUser.avatar} />
                  <AvatarFallback className="text-base font-semibold">
                    {viewingUser.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-base">{viewingUser.name}</h3>
                  <p className="text-xs text-muted-foreground">ID: {viewingUser.id}</p>
                  <div className="flex gap-2 mt-1">
                    <Badge variant={getRoleColor(viewingUser.role)} className="capitalize">
                      {viewingUser.role}
                    </Badge>
                    <Badge variant={viewingUser.status === "Active" ? "default" : "secondary"}>
                      {viewingUser.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-xs text-muted-foreground block">Email</span>
                  <span className="font-medium break-all">{viewingUser.email || "N/A"}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Phone</span>
                  <span className="font-medium">{viewingUser.phone || "N/A"}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Department</span>
                  <span className="font-medium">{viewingUser.department || "General"}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Join Date</span>
                  <span className="font-medium">{viewingUser.joinDate || "N/A"}</span>
                </div>
              </div>

              {viewingUser.permissions && viewingUser.permissions.length > 0 && (
                <div>
                  <span className="text-xs text-muted-foreground block mb-2">Permissions</span>
                  <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto">
                    {viewingUser.permissions.map((perm, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {perm}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingUser(null)}>
              Close
            </Button>
            {viewingUser && viewingUser.role?.toLowerCase() !== 'administrator' && (
              <Button onClick={() => {
                const u = viewingUser;
                setViewingUser(null);
                handleEditUser(u);
              }}>
                <Edit className="h-4 w-4 mr-2" />
                Edit User
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editingUser !== null} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update account details and status for this user.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editFormData.name}
                onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Full Name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                value={editFormData.phone}
                onChange={(e) => setEditFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+91 ..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-dept">Department</Label>
              <Input
                id="edit-dept"
                value={editFormData.department}
                onChange={(e) => setEditFormData(prev => ({ ...prev, department: e.target.value }))}
                placeholder="Department"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={editFormData.status}
                onValueChange={(val) => setEditFormData(prev => ({ ...prev, status: val }))}
              >
                <SelectTrigger id="edit-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveUser}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <Dialog open={userToDelete !== null} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove <strong className="text-foreground">{userToDelete?.name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setUserToDelete(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => {
                if (userToDelete) {
                  handleDeleteUser(userToDelete);
                  setUserToDelete(null);
                }
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Permission Template Dialog */}
      <Dialog open={editingTemplate !== null} onOpenChange={(open) => !open && setEditingTemplate(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit {editingTemplate} Permissions</DialogTitle>
            <DialogDescription>
              Select the permissions for users with {editingTemplate} role.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Available Permissions</h4>
              <div className="grid grid-cols-2 gap-3">
                {permissions.map((permission, index) => (
                  <div key={`${permission}-${index}`} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${permission}-${index}`}
                      checked={selectedPermissions.includes(permission)}
                      onCheckedChange={() => togglePermission(permission)}
                    />
                    <label
                      htmlFor={`${permission}-${index}`}
                      className="text-sm cursor-pointer"
                    >
                      {permission}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setEditingTemplate(null);
                setSelectedPermissions([]);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveTemplate}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Heading from '@/components/common/Heading';
import { Badge } from "@/components/ui/badge";
import { API_BASE_URL } from '@/lib/axios';
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
}

export const UserManagement = () => {
  const authUser = useAuthStore((state) => state.authUser);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
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

        const allUsers: any[] = [];

        // Process system users
        if (usersResponse.ok) {
          const result = await usersResponse.json();
          const systemUsers = result.data?.map((user: any) => ({
            id: user.id?.toString(),
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
            name: teacher.name || 'Unknown Teacher',
            email: teacher.email || '',
            phone: teacher.phone || '+91 0000000000',
            role: 'teacher', // Explicitly set teacher role
            department: 'Education',
            status: teacher.status === 'active' ? 'Active' : 'Inactive',
            joinDate: teacher.created_at ? new Date(teacher.created_at).toISOString().split('T')[0] : '2024-01-01',
            avatar: '',
            permissions: ['View Students', 'Grade Management', 'Attendance']
          })) || [];
          allUsers.push(...teachers);
        }

        console.log('All users loaded:', allUsers);
        console.log('Teachers count:', allUsers.filter(u => u.role === 'teacher').length);
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

  // All available permissions for all roles (unique list)
  const permissions = [
    // Administrative permissions
    "Full System Access", "Manage All Schools", "User Management", "System Settings",
    // Principal permissions  
    "School Management", "Attendance Management", "Fee Management", "Reports", "Analytics",
    // Teacher permissions
    "View Students", "Grade Management", "Mark Attendance", "Create Assignments", "View Reports", "Class Timetable",
    // Accountant permissions
    "Fee Collection", "Payment Reports", "Financial Reports", "Generate Invoices", "Payment Tracking",
    // Librarian permissions
    "Book Management", "Issue Books", "Return Books", "View Library Statistics", "Manage Categories", "Track Overdue Books",
    // Parent permissions
    "View Child Progress", "Fee Payments", "Exam Results", "School Notices", "Contact Teachers",
    // Student permissions
    "View Timetable", "View Assignments", "View Results", "View Attendance", "Download Certificates"
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.role.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === "all") return matchesSearch;
    
    // Handle different role mappings
    const userRole = user.role?.toLowerCase() || '';
    const filterRole = activeTab.toLowerCase();
    
    // Map database roles to filter tabs
    if (filterRole === 'teacher' && userRole === 'teacher') {
      return matchesSearch;
    }
    if (filterRole === 'parent' && userRole === 'parent') return matchesSearch;
    if (filterRole === 'administrator' && (userRole === 'administrator' || userRole === 'principal')) return matchesSearch;
    
    return false;
  });

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "teacher": return "default";
      case "parent": return "secondary";
      case "administrator": return "destructive";
      case "support staff": return "outline";
      default: return "outline";
    }
  };

  // Handle edit template button clicks
  const handleEditTemplate = (templateType: string) => {
    setEditingTemplate(templateType);
    // Get current permissions for this template
    const template = permissionTemplates[templateType];
    if (template) {
      setSelectedPermissions([...template.permissions]);
    }
  };

  // Handle save template
  const handleSaveTemplate = () => {
    if (!editingTemplate) return;
    
    // Here you would typically save to API/database
    console.log(`Saving ${editingTemplate} template with permissions:`, selectedPermissions);
    
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
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
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
    <div className="space-y-6 ">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-bold text-foreground">User Management</h2>
          <p className="text-muted-foreground text-xs">Manage users, roles, and permissions</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter Users
          </Button>
          <Button className="bg-gradient-primary hover:opacity-90">
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
                {filteredUsers.map((user) => (
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
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
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
            {/* All Available Permissions */}
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
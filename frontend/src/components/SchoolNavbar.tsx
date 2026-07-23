import { Search, User, Menu, Star, User2, Bell, Sun, SunDim } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";

import { useAuthStore } from "@/store/useAuthStore";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "./theme/ThemeToggle";
import { NotificationPanel } from "./Notifications/NotificationPanel";

interface SchoolNavbarProps {
  currentRole: string;
  onRoleChange: (role: string) => void;
}

export function SchoolNavbar({ currentRole, onRoleChange }: SchoolNavbarProps) {

  const { authUser, logout } = useAuthStore();
  const navigate = useNavigate();

  
  const roles = [
    { id: "principal", label: "Principal", color: "bg-red-500" },
    { id: "teacher", label: "Teacher", color: "bg-blue-500" },
    { id: "student", label: "Student", color: "bg-green-500" },
    { id: "parent", label: "Parent", color: "bg-purple-500" },
    { id: "accountant", label: "Accountant", color: "bg-orange-500" },
  ];
  const currentRoleData = roles.find((role) => role.id === authUser.role);

  // Helper function to get profile settings route based on role
  const getProfileSettingsRoute = () => {
    const role = authUser?.role;
    
    // Map roles to their profile settings routes
    const routeMap: Record<string, string> = {
      'administrator': '/administrator/profile-settings',
      'librarian': '/librarian/profile-settings',
      'teacher': '/teacher/my-profile',
      'principal': '/principal/settings/school-info', // Principal doesn't have profile-settings, using settings as alternative
      'accountant': '/accountant/profile-settings', // Will need to add this route if not exists
      'student': '/student/profile',
      'parent': '/parent/children-personal-info', // Will need to add this route if not exists
    };
    
    return routeMap[role || ''] || '/administrator/profile-settings'; // Default fallback
  };

  //Logout Function
   const handleLogout = async () => {
    const isSuperAdmin = authUser?.role === 'super_admin';
    await logout();
    navigate(isSuperAdmin ? "/super-admin/login" : "/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-background  text-sidebar-foreground border-b border-border">
      <div className="flex h-14 md:h-16 items-center justify-between mx-auto max-w-7xl px-2 md:px-4">

        <div className="flex  items-center gap-4">
          <SidebarTrigger className="" />
        </div>

        <div className="flex items-center justify-end w-full gap-0 md:gap-2 md:w-2/3 lg:w-1/2 ">

          <div className="flex items-center gap-2  flex-1 max-w-md mx-4">
          <div className="relative flex-1 ">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search..." className="pl-9 h-8 md:h-9 " />
          </div>
        </div>


          {/* Notifications */}
          <NotificationPanel />

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              
              <div className="w-11 md:w-10 ">
                 <Avatar className="h-8 w-8 cursor-pointer   ">
                  <AvatarFallback>
                    <User className="h-4 w-4 text-primary" />
                  </AvatarFallback>
                </Avatar>
              </div>
               

            </DropdownMenuTrigger>
             <DropdownMenuContent className="w-56 " align="end" forceMount>
              <DropdownMenuLabel>
                  {authUser.role === "teacher" ? authUser?.full_name : authUser.username}
                </DropdownMenuLabel>

              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate(getProfileSettingsRoute())}>
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600" onClick={handleLogout}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

            <div className="border-l mr-2 h-5 border-border">
            </div>

            <ThemeToggle/>
        </div>
          

      </div>
    </header>
  );
}

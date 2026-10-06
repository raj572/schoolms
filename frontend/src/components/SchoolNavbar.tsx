import { useState, useEffect } from "react";
import { Search, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import { useAuthStore } from "@/store/useAuthStore";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "./theme/ThemeToggle";
import { NotificationPanel } from "./Notifications/NotificationPanel";
import { roleMenus, MenuItem } from "@/data/sidebardata";

interface SchoolNavbarProps {
  currentRole: string;
  onRoleChange: (role: string) => void;
}

interface SearchableItem {
  title: string;
  href: string;
  group: string;
  icon?: React.ElementType;
}

export function SchoolNavbar({ currentRole, onRoleChange }: SchoolNavbarProps) {
  const { authUser, logout } = useAuthStore();
  const navigate = useNavigate();
  const [openSearch, setOpenSearch] = useState(false);

  const activeRole = authUser?.role || currentRole;

  // Global keyboard shortcut Ctrl+K or Cmd+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpenSearch((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Build searchable items based on user role
  const getSearchableItems = (): SearchableItem[] => {
    const menus: MenuItem[] = roleMenus[activeRole] || [];
    const items: SearchableItem[] = [];

    menus.forEach((menu) => {
      if (menu.submenu && menu.submenu.length > 0) {
        menu.submenu.forEach((sub) => {
          items.push({
            title: sub.title,
            href: sub.href,
            group: menu.title,
            icon: sub.icon || menu.icon,
          });
        });
      } else if (menu.href) {
        items.push({
          title: menu.title,
          href: menu.href,
          group: "Navigation",
          icon: menu.icon,
        });
      }
    });

    return items;
  };

  const searchableItems = getSearchableItems();

  // Group searchable items by category
  const groupedItems = searchableItems.reduce((acc, item) => {
    const key = item.group;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, SearchableItem[]>);

  const handleSelect = (href: string) => {
    setOpenSearch(false);
    navigate(href);
  };

  // Helper function to get profile settings route based on role
  const getProfileSettingsRoute = () => {
    const role = authUser?.role;
    
    const routeMap: Record<string, string> = {
      'administrator': '/administrator/profile-settings',
      'librarian': '/librarian/profile-settings',
      'teacher': '/teacher/my-profile',
      'principal': '/principal/settings/school-info',
      'accountant': '/accountant/profile-settings',
      'student': '/student/profile',
      'parent': '/parent/children-personal-info',
    };
    
    return routeMap[role || ''] || '/administrator/profile-settings';
  };

  // Logout Function
  const handleLogout = async () => {
    const isSuperAdmin = authUser?.role === 'super_admin';
    await logout();
    navigate(isSuperAdmin ? "/super-admin/login" : "/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-background text-sidebar-foreground border-b border-border">
      <div className="flex h-14 md:h-16 items-center justify-between mx-auto max-w-7xl px-2 md:px-4">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="" />
        </div>

        <div className="flex items-center justify-end w-full gap-0 md:gap-2 md:w-2/3 lg:w-1/2">
          {/* Search Trigger Input */}
          <div className="flex items-center gap-2 flex-1 max-w-md mx-4">
            <div
              className="relative flex-1 cursor-pointer"
              onClick={() => setOpenSearch(true)}
            >
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search pages and features..."
                readOnly
                onClick={() => setOpenSearch(true)}
                className="pl-9 pr-12 h-8 md:h-9 cursor-pointer select-none"
              />
              <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 hidden md:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>
          </div>

          {/* Search Command Dialog Modal */}
          <CommandDialog open={openSearch} onOpenChange={setOpenSearch}>
            <CommandInput placeholder="Type to search pages, modules, or tools..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              {Object.entries(groupedItems).map(([group, items]) => (
                <CommandGroup key={group} heading={group}>
                  {items.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <CommandItem
                        key={item.href}
                        onSelect={() => handleSelect(item.href)}
                        className="cursor-pointer"
                      >
                        {IconComponent && <IconComponent className="mr-2 h-4 w-4 text-primary" />}
                        <span>{item.title}</span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              ))}
            </CommandList>
          </CommandDialog>

          {/* Notifications */}
          <NotificationPanel />

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="w-11 md:w-10">
                <Avatar className="h-8 w-8 cursor-pointer">
                  <AvatarFallback>
                    <User className="h-4 w-4 text-primary" />
                  </AvatarFallback>
                </Avatar>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel>
                {authUser?.role === "teacher" ? authUser?.full_name : authUser?.username}
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

          <div className="border-l mr-2 h-5 border-border" />

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}


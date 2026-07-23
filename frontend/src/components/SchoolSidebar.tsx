import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { useSidebar } from "@/components/ui/sidebar"; 
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { roleMenus, MenuItem } from "@/data/sidebardata";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile"; // 

interface SchoolSidebarProps {
  currentRole: string;
}

export function SchoolSidebar({ currentRole }: SchoolSidebarProps) {
  const [openGroups, setOpenGroups] = useState<string[]>([]);
  const location = useLocation();
  const { setOpenMobile } = useSidebar(); 
  const isMobile = useIsMobile(); 

  const currentMenus = roleMenus[currentRole] || [];

  const toggleGroup = (title: string) => {
    setOpenGroups((prev) =>
      prev.includes(title) ? prev.filter((g) => g !== title) : [...prev, title]
    );
  };

  const isActive = (href: string) => location.pathname === href;

  const handleLinkClick = () => {
    if (isMobile) {
      // closes the mobile sidebar
      setOpenMobile(false);
    }
  };

  const renderMenuItem = (item: MenuItem) => {
    if (item.submenu) {
      const isOpen = openGroups.includes(item.title);

      return (
        <Collapsible
          key={item.title}
          open={isOpen}
          onOpenChange={() => toggleGroup(item.title)}
        >
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton>
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
                {isOpen ? (
                  <ChevronDown className="ml-auto h-4 w-4" />
                ) : (
                  <ChevronRight className="ml-auto h-4 w-4" />
                )}
              </SidebarMenuButton>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <SidebarMenuSub>
                {item.submenu.map((subItem) => (
                  <SidebarMenuSubItem key={subItem.href}>
                    <SidebarMenuSubButton
                      asChild
                      onClick={handleLinkClick}
                      className={
                        isActive(subItem.href)
                          ? "bg-primary text-white"
                          : undefined
                      }
                    >
                      <Link to={subItem.href}>
                        <subItem.icon className="h-4 w-4" />
                        <span>{subItem.title}</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      );
    }

    return (
      <SidebarMenuItem key={item.href}>
        <SidebarMenuButton
          asChild
          onClick={handleLinkClick}
          className={isActive(item.href) ? "bg-primary text-white" : ""}
        >
          <Link to={item.href}>
            <item.icon className="h-4 w-4" />
            <span>{item.title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar className="border-border ">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-semibold mb-4 ">
            {currentRole.charAt(0).toUpperCase() + currentRole.slice(1)} Panel
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{currentMenus.map(renderMenuItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

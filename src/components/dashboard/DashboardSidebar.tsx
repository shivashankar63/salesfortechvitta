import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
  LogOut,
  TrendingUp,
  Menu,
  X,
  ChevronDown,
  Briefcase,
  Target,
  LineChart,
  PieChart,
  Award,
  Phone,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SidebarProps {
  role: "owner" | "manager" | "salesman";
}

const getMenuItems = (role: "owner" | "manager" | "salesman") => {
  const baseItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/" + role },
  ];

  const ownerItems = [
    ...baseItems,
    { icon: BarChart3, label: "All Leads", path: "/leads" },
    { icon: Users, label: "Teams", path: "/teams" },
    { icon: LineChart, label: "Analytics", path: "/analytics" },
    { icon: Briefcase, label: "Regions", path: "/regions" },
    { icon: PieChart, label: "Revenue Reports", path: "/revenue" },
    { icon: Settings, label: "Organization", path: "/settings" },
  ];

  const managerItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/manager" },
    { icon: Briefcase, label: "Projects", path: "/manager/projects" },
    { icon: Target, label: "Lead Pipeline", path: "/manager/pipeline" },
    { icon: Target, label: "Leads", path: "/manager/leads" },
    { icon: TrendingUp, label: "Sales Performance", path: "/manager/sales-performance" },
    { icon: Award, label: "Team Activity", path: "/manager/activity" },
  ];

  const salesmanItems = [
    ...baseItems,
    { icon: Phone, label: "My Leads", path: "/sales/my-leads" },
    { icon: Target, label: "Pipeline", path: "/sales/pipeline" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  if (role === "owner") return ownerItems;
  if (role === "manager") return managerItems;
  return salesmanItems;
};

const DashboardSidebar = ({ role }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");
  const location = useLocation();
  const navigate = useNavigate();
  const menuItems = getMenuItems(role);

  const roleLabels = {
    owner: "Owner",
    manager: "Manager",
    salesman: "Salesman",
  };

  const roleColors = {
    owner: "bg-blue-600",
    manager: "bg-purple-600",
    salesman: "bg-orange-600",
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/", { replace: true });
  };

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      const email = data?.user?.email || "User";
      setUserEmail(email);
    };
    fetchUser();
  }, []);

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-4 flex items-center justify-between">
        <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
          <div className={`w-10 h-10 rounded-xl ${roleColors[role]} flex items-center justify-center flex-shrink-0`}>
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <span className="text-xl font-bold text-sidebar-foreground block">SalesFlow</span>
              <span className="text-xs text-sidebar-foreground/60">{roleLabels[role]}</span>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <Menu className="w-5 h-5" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <button
                  onClick={() => {
                    navigate(item.path);
                    setIsMobileOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                    isActive
                      ? `${roleColors[role]} text-white`
                      : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                    isCollapsed && "justify-center"
                  )}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && <span className="font-medium">{item.label}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-3 border-t border-sidebar-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "w-full flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-accent transition-colors",
                isCollapsed && "justify-center"
              )}
            >
              <Avatar className="w-10 h-10">
                <AvatarFallback className={`${roleColors[role]} text-white font-medium`}>
                  JD
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-sidebar-foreground">{userEmail}</p>
                    <p className="text-xs text-sidebar-foreground/60">{roleLabels[role]}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-sidebar-foreground/60" />
                </>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => navigate("/settings")}>Profile Settings</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/settings")}>Preferences</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-card shadow-soft text-foreground hover:bg-card/80"
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col bg-sidebar h-screen sticky top-0 transition-all duration-300",
          isCollapsed ? "w-[72px]" : "w-64"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-sidebar w-64 shadow-lg transition-transform duration-300 ease-in-out lg:hidden",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button
          onClick={() => setIsMobileOpen(false)}
          className="absolute top-4 right-4 p-2 hover:bg-sidebar-accent rounded-lg lg:hidden"
        >
          <X className="w-5 h-5 text-sidebar-foreground" />
        </button>
        <div className="mt-12">
          <SidebarContent />
        </div>
      </aside>
    </>
  );
};

export default DashboardSidebar;

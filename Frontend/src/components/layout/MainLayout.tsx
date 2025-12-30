import { cn } from "@/lib/utils";
import {
  Calendar,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Pill, // Added for Medicines icon
  Settings,
  User,
  Users,
  X,
  Moon,
  Sun,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import NotificationCenter from "../ui/NotificationCenter"; // Import NotificationCenter
interface MainLayoutProps {
  children: React.ReactNode;
  userType: "doctor" | "patient";
}

const MainLayout = ({ children, userType }: MainLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const doctorNavItems = [
    {
      title: "Dashboard",
      href: "/doctor/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Recent Prescriptions",
      href: "/doctor/prescriptions",
      icon: Users,
    },
    {
      title: "Appointments",
      href: "/doctor/appointments",
      icon: Calendar,
    },
    {
      title: "Prescriptions",
      href: "/doctor/new-prescription",
      icon: FileText,
    },
    {
      title: "Update Schedule",
      href: "/doctor/update-schedule",
      icon: FileText,
    },
    {
      title: "Medicines", // New Medicines option
      href: "/doctor/medicines",
      icon: Pill, // Using Pill icon for medicines
    },
    {
      title: "Profile",
      href: "/doctor/profile",
      icon: User,
    },
    // {
    //   title: "Settings",
    //   href: "/doctor/settings",
    //   icon: Settings,
    // },
  ];

  const patientNavItems = [
    {
      title: "Dashboard",
      href: "/patient/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Book Appointment",
      href: "/patient/book-appointment",
      icon: Calendar,
    },
    {
      title: "Appointments",
      href: "/patient/appointments",
      icon: Calendar,
    },
    {
      title: "Prescriptions",
      href: "/patient/prescriptions",
      icon: FileText,
    },
    // {
    //   title: "Prescriptions",
    //   href: "/patient/prescriptions",
    //   icon: FileText,
    // },

    // {
    //   title: "Medical Records",
    //   href: "/patient/medical-records",
    //   icon: Activity,
    // },
    {
      title: "Profile",
      href: "/patient/profile",
      icon: User,
    },
    // {
    //   title: "Settings",
    //   href: "/patient/settings",
    //   icon: Settings,
    // },
  ];

  const navItems = userType === "doctor" ? doctorNavItems : patientNavItems;

  const handleLogout = () => {
    // Add logout logic here
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Navbar */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-50 transition-colors">
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {isSidebarOpen ? (
                <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              )}
            </button>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {userType === "doctor" ? "Doctor Portal" : "Patient Portal"}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {/* Replace static Bell with NotificationCenter */}
            <NotificationCenter />
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out z-40",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors",
                location.pathname === item.href && "bg-primary/10 dark:bg-blue-900/20 text-primary dark:text-blue-400"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.title}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main
        className={cn(
          "pt-16 transition-all duration-300 ease-in-out",
          isSidebarOpen ? "ml-64" : "ml-0"
        )}
      >
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
};

export default MainLayout;

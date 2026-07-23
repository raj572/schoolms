
import {
  Home,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  MessageSquare,
  FileText,
  Settings,
  BarChart3,
  CreditCard,
  UserCheck,
  Clock,
  School,
  Car,
  Utensils,
  Stethoscope,
  Trophy,
  Camera,
  Globe,
  Calculator,
  PieChart,
  Receipt,
  Wallet,
  ChevronDown,
  ChevronRight,
  User,
  BookA,
  Users2,
  Contact,
  NotebookPen,
  Presentation,
  UserPlus,
  List,
  ClipboardList,
  Archive,
  BookCheck,
  BookCopy,
  CalendarHeart,
  Calendar1,
  SquareLibrary,
  HandCoins,
  Package,
  Building2,
  Shield,
  UserCircle,
  CheckCircle,
  QrCode,
  FileText as FileTextIcon,
} from "lucide-react";

export interface MenuItem {
  title: string;
  icon: React.ElementType;
  href: string;
  submenu?: MenuItem[];
}

export interface RoleMenus {
  [key: string]: MenuItem[];
}

export const roleMenus: RoleMenus = {
  principal: [
    {
      title: "Dashboard",
      icon: Home,
      href: "/principal/dashboard",
    },

    {
      title: "Users ",
      icon: Users,
      href: "/principal/users",
      submenu: [
        { title: "Register", icon: UserPlus, href: "/principal/users/register" },
        { title: "List", icon: ClipboardList, href: "/principal/users/list" },
      ],
    },

    {
      title: "Students ",
      icon: Contact,
      href: "/principal/students",
      submenu: [
        { title: "Register", icon: UserPlus, href: "/principal/students/register" },
        { title: "List", icon: ClipboardList, href: "/principal/students/list" },
        {
          title: "Attendance Analytics",
          icon: BarChart3,
          href: "/principal/students/attendance/analytics",
        },
        { title: "Services", icon: HandCoins, href: "/principal/students/servicelist" }
      ],
    },
    {
      title: "Teachers",
      icon: GraduationCap,
      href: "/principal/teachers",
      submenu: [
        { title: "Register", icon: UserPlus, href: "/principal/teachers/register" },
        { title: "List", icon: ClipboardList, href: "/principal/teachers/list" },
        // {
        //   title: "Assign Subjects",
        //   icon: BookCheck,
        //   href: "/principal/teachers/subject",
        // },
      ],
    },

    {
      title: "Classes",
      icon: Presentation,
      href: "/principal/classes/class",
      submenu: [
        { title: "List", icon: ClipboardList, href: "/principal/classes/list" },
        { title: "Subjects", icon: BookCopy, href: "/principal/classes/subjectlist" },
        // { title: "Subjects", icon: BookCopy, href: "/principal/classes/subjects" },
        {
          title: "Timetable",
          icon: Calendar1,
          href: "/principal/classes/timetable",
        },
      ],
    },
    {
      title: "Exam",
      icon: NotebookPen,
      href: "/principal/exam",
    },

    {
      title: "Attendance",
      icon: CheckCircle,
      href: "/principal/attendance",
      submenu: [
        { title: "Teacher Attendance", icon: UserCheck, href: "/principal/attendance/teachers" },
        { title: "Analytics", icon: BarChart3, href: "/principal/attendance/dashboard" },
      ],
    },

    {
      title: "Library",
      icon: BookOpen,
      href: "/principal/library",
    },
    {
      title: "Transport",
      icon: Car,
      href: "/principal/transport",
    },
    {
      title: "Hostel",
      icon: Home,
      href: "/principal/hostel",
    },
    {
      title: "Wardens",
      icon: Shield,
      href: "/principal/wardens",
    },
    {
      title: "Communication",
      icon: MessageSquare,
      href: "/principal/communication",
      
       
    
    },
    {
      title: "Reports",
      icon: BarChart3,
      href: "/principal/reports",
      submenu: [
        {
          title: "Student ",
          icon: GraduationCap,
          href: "/principal/reports/student",
        },
        { title: "Fees", icon: PieChart, href: "/principal/reports/fee" },
        { title: "Attendance", icon: Clock, href: "/principal/reports/attendance" },
        { title: "Exams", icon: Clock, href: "/principal/reports/exams" },
        { title: "Syllabus Overview", icon: BookCheck, href: "/principal/reports/syllabus-overview" },
        { title: "Syllabus Detailed", icon: SquareLibrary, href: "/principal/reports/syllabus-detailed" },
      ],
    },
    {
      title: "Settings",
      icon: Settings,
      href: "/principal/settings",
      submenu: [
        {
          title: "User Management",
          icon: Settings,
          href: "/principal/settings/user-management",
        },
        { title: "Roles", icon: CreditCard, href: "/principal/settings/roles" },
        {
          title: "School info",
          icon: MessageSquare,
          href: "/principal/settings/school-info",
        },
      ],
    },
        
  ],
  teacher: [
    {
      title: "Dashboard",
      icon: Home,
      href: "/teacher/dashboard",
      
    },
    {
      title: "My Profile",
      icon: GraduationCap,
      href: "/teacher/my-profile",
    },
    {
      title: "My Classes",
      icon: Clock,
      href: "/teacher/my-classes",
    },
    {
      title: "Attendance",
      icon: CheckCircle,
      href: "/teacher/attendance",
      submenu: [
        { title: "Mark Attendance", icon: CheckCircle, href: "/teacher/attendance" },
        { title: "View Records", icon: FileTextIcon, href: "/teacher/attendance/records" },
      ],
    },
    {
      title: "Syllabus Completion",
      icon: BookCheck,
      href: "/teacher/syllabus-completion",
    },
    {
      title: "Exam",
      icon: BookOpen,
      href: "/teacher/exam",
      submenu: [
        { title: "Schedule", icon: Settings, href: "/teacher/exam/schedule" },
        {
          title: "Marks Entry",
          icon: CreditCard,
          href: "/teacher/exam/marks-entry",
        },
      ],
    },
    {
      title: "Assignments",
      icon: FileText,
      href: "/teacher/assignments",
    },
    {
      title: "Reports",
      icon: BarChart3,
      href: "/teacher/reports",
    },
    {
      title: "Communication",
      icon: MessageSquare,
      href: "/teacher/communication",
      
    },
  ],
  student: [
    {
      title: "Dashboard",
      icon: Home,
      href: "/student/dashboard",
      
    },
    {
      title: "My Profile",
      icon: User,
      href: "/student/profile",
    },
    {
      title: "Attendance",
      icon: FileText,
      href: "/student/attendance",
    },
    {
      title: "Exams",
      icon: BarChart3,
      href: "/student/exams",
      submenu: [
       
        { title: "Results", icon: CreditCard, href: "/student/exams/result" },
        {
          title: "Reports Cards",
          icon: CreditCard,
          href: "/student/exams/reports-cards",
        },
      ],
    },
    {
      title: "Fees",
      icon: CreditCard,
      href: "/student/fees",
      submenu: [
        { title: "Dues", icon: Settings, href: "/student/fees/due" },
        {
          title: "Payments History",
          icon: CreditCard,
          href: "/student/fees/payments-history",
        },
      ],
    },
    {
      title: "Library",
      icon: BookOpen,
      href: "/student/library",
    },
    {
      title: "Messages",
      icon: MessageSquare,
      href: "/student/messages",
    },
  ],
  parent: [
    {
      title: "Dashboard",
      icon: Home,
      href: "/parent/dashboard",
    },
    {
      title: "Student Profile",
      icon: GraduationCap,
      href: "/parent/children",
      submenu: [
        {
          title: "Academic",
          icon: Settings,
          href: "/parent/children/academic",
        },
        {
          title: "Personal Info",
          icon: CreditCard,
          href: "/parent/children-personal-info",
        },
      ],
    },
    {
      title: "Attendance",
      icon: BarChart3,
      href: "/parent/attendance",
    },
    {
      title: "Exams",
      icon: Clock,
      href: "/parent/exams",
      submenu: [
        { title: "Results", icon: Settings, href: "/parent/exams/results" },
        { title: "Report Cards", icon: CreditCard, href: "/parent/exams/reports-cards" },
      ],
    },
    {
      title: "Fees",
      icon: CreditCard,
      href: "/parent/fees",
      submenu: [
        { title: "Dues", icon: Settings, href: "/parent/fees/dues" },
        {
          title: "Payments Receipts",
          icon: CreditCard,
          href: "/parent/fees/payments-receipts",
        },
      ],
    },
    {
      title: "Notices",
      icon: MessageSquare,
      href: "/parent/notices",
    },
  ],
  accountant: [
    {
      title: "Dashboard",
      icon: Home,
      href: "/accountant/dashboard",
    },
    {
      title: " Fees",
      icon: CreditCard,
      href: "/accountant/fees",
    },
    
    {
      title: "Fees Structure",
      icon: Receipt,
      href: "/accountant/fees-structure",
    },
    {
      title: "Monthly Dues",
      icon: Receipt,
      href: "/accountant/monthly-dues",
    },
    {
      title: "Annual Payments",
      icon: Receipt,
      href: "/accountant/annual-payments",
    },
    {
      title: "Service Charges",
      icon: Receipt,
      href: "/accountant/service-charges",
    },
    {
      title: "Payments",
      icon: Receipt,
      href: "/accountant/payments",
    },
    {
      title: "Extra Services",
      icon: Receipt,
      href: "/accountant/extra-services",
    },

    {
      title: "Reports",
      icon: BarChart3,
      href: "/accountant/reports",
      submenu: [
        {
          title: "Fee Reports",
          icon: Receipt,
          href: "/accountant/report/fee",
        },
        {
          title: "Dues Pending",
          icon: CreditCard,
          href: "/accountant/report/dues-pending",
        },
        {
          title: "Transactions",
          icon: Wallet,
          href: "/accountant/report/transactions",
        },
      ],
    },
  ],
  librarian: [
    {
      title: "Dashboard",
      icon: Home,
      href: "/librarian/dashboard",
    },
    {
      title: "Library",
      icon: BookOpen,
      href: "/librarian/library",
    },
  ],
  administrator: [
    {
      title: "Dashboard",
      icon: Home,
      href: "/administrator/dashboard",
    },
    {
      title: "Schools",
      icon: School,
      href: "/administrator/schools",
    },
    {
      title: "Principals",
      icon: UserCircle,
      href: "/administrator/principals",
    },
    {
      title: "Subscriptions",
      icon: Receipt,
      href: "/administrator/subscriptions",
    },
    {
      title: "Payments",
      icon: Wallet,
      href: "/administrator/payments",
    },
  ],
  super_admin: [
    {
      title: "Dashboard",
      icon: Shield,
      href: "/super-admin/dashboard",
    },
    {
      title: "Subscription Plans",
      icon: Package,
      href: "/super-admin/plans",
    },
    {
      title: "Schools",
      icon: Building2,
      href: "/super-admin/schools",
    },
    {
      title: "Analytics",
      icon: BarChart3,
      href: "/super-admin/analytics",
    },
    {
      title: "Settings",
      icon: Settings,
      href: "/super-admin/settings",
    },
  ],
  warden: [
    {
      title: "Dashboard",
      icon: Home,
      href: "/warden/dashboard",
    },
    {
      title: "Hostel",
      icon: Building2,
      href: "/warden/hostel",
    },
    {
      title: "Mess",
      icon: Utensils,
      href: "/warden/mess",
    },
  ],
};
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { AuthInitializer } from "@/components/auth/AuthInitializer";
import Index from "./pages/principal/Dashboard";
import Layout from "./components/Layout";
import Hostel from "./pages/principal/Hostel";
import Library from "./pages/principal/Library";
import Transport from "./pages/principal/Transport";
import StudentList from "./pages/principal/students/List";
import List from "./pages/principal/teachers/List";
import Records from "./pages/principal/students/Records";
import StudentDetails from "./pages/principal/students/StudentDetails";
import StudentRegister from "./pages/principal/students/Register";
import Register from "./pages/principal/teachers/Register";
import StudentAttendanceAnalytics from "./pages/principal/students/attendance/StudentAttendanceAnalytics";
import ClassWiseAttendanceAnalysis from "./pages/principal/students/attendance/ClassWiseAttendanceAnalysis";
import StudentIndividualAnalysis from "./pages/principal/students/attendance/StudentIndividualAnalysis";
import MarkAttendance from "./pages/principal/students/attendance/Mark-attendance";
import { Exam } from "./pages/principal/Exam";
import Timetable from "./pages/principal/classes/Timetable";
import { Subjects } from "./pages/principal/classes/Subjects";
import Roles from "./pages/principal/settings/Roles";
import { SchoolInfo } from "./pages/principal/settings/School-info";
import { UserManagement } from "./pages/principal/settings/User-management";
import ClassList from "./pages/principal/classes/List";
import StudentReports from "./pages/principal/reports/Students";
import FeeReports from "./pages/principal/reports/Fees";
import AttendanceReport from "./pages/principal/reports/Attendance";
import ExamReport from "./pages/principal/reports/Exams";
import SyllabusOverview from "./pages/principal/reports/Syllabus-overview";
import SyllabusDetailed from "./pages/principal/reports/Syllabus-detailed";

// Teacher Attendance Pages
import Dashboard from "./pages/teacher/Dashboard";
import TeacherMarkAttendance from "./pages/teacher/attendance/MarkAttendance";
import AttendanceRecords from "./pages/teacher/attendance/AttendanceRecords";

// Principal Attendance Pages
import TeacherAttendancePage from "./pages/principal/attendance/TeacherAttendance";
import AttendanceDashboard from "./pages/principal/attendance/Dashboard";
import MyClasses from "./pages/teacher/My-classes";
import ClassDetails from "./pages/teacher/Class-details";
import TeacherProfile from "./pages/teacher/My-profile";
import EditTeacherProfile from "./pages/teacher/Edit-profile";
import ChangePassword from "./pages/teacher/Change-password";
import TeacherReports from "./pages/teacher/Reports";
import TeacherAssignments from "./pages/teacher/Assignments";
import TeacherCommunication from "./pages/teacher/Communication";
import MarkEntry from "./pages/teacher/Exam/Marks-entry";
import ExamSchedule from "./pages/teacher/Exam/Schedule";
import SyllabusCompletion from "./pages/teacher/Syllabus-completion";
import AdminDashboard from "./pages/principal/Dashboard";
import StudentDashboard from "./pages/student/Student-dashboard";
import StudentAttendance from "./pages/student/Attendance";
import StudentMessages from "./pages/student/Messages";
import StudentLibrary from "./pages/student/Library";
import StudentExams from "./pages/student/Exams/Result";
import StudentProfile from "./pages/student/My-profile";
import ReportCard from "./pages/student/Exams/Reports-cards";
import StudentFeesDue from "./pages/student/Fees/Dues";
import StudentPaymentHistory from "./pages/student/Fees/Payments-history";
import ParentDashboard from "./pages/parent/Dashboard";
import ParentNotices from "./pages/parent/Notices";
import ParentFeesDue from "./pages/parent/Fees/Dues";
import ParentPaymentReceipts from "./pages/parent/Fees/Payments-receipts";
import StudentAcademic from "./pages/parent/student-profile/Academic";
import StudentPersonal from "./pages/parent/student-profile/Personal-info";
import { Communication } from "./pages/principal/Communication";
import AccountantDashboard from "./pages/accountant/Dashboard";
import AccountantFees from "./pages/accountant/Fees";
import AccountantPayments from "./pages/accountant/Payments";
import AccountantDues from "./pages/accountant/reports/Dues-pending";
import Transactions from "./pages/accountant/reports/Transactions";
import AccountantFeeReports from "./pages/accountant/reports/Fee-reports";
import AccountantExtraServices from "./pages/accountant/Extra-services";
import AccountantMonthlyDue from "./pages/accountant/Monthly-dues";
import AccountantFeeStructure from "./pages/accountant/FeesStructure";
import AnnualPayments from "./pages/accountant/AnnualPayments";
import ServiceCharges from "./pages/accountant/ServiceCharges";
import SignupPage from "./pages/auth/SignupPage";
import LoginPage from "./pages/auth/LoginWithSchoolPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import { PrivateRoute } from "./components/routes/PrivateRoute";
import { PublicRoute } from "./components/routes/PublicRoute";
import RequestOtpPage from "./pages/auth/RequestOtpPage";
import SchoolSetupWizard from "./pages/onboarding/SchoolSetupWizard";
import AdminSchoolSetupPage from "./pages/onboarding/AdminSchoolSetupPage";
import PricingPage from "./pages/subscription/PricingPage";
import PaymentPage from "./pages/subscription/PaymentPage";
import SubscriptionManagementPage from "./pages/subscription/SubscriptionManagementPage";
import RequireSubscription from "./components/RequireSubscription";
import PrincipalSubscriptionCheck from "./components/PrincipalSubscriptionCheck";
import UserRegister from "./pages/principal/users/Register";
import UserList from "./pages/principal/users/List";
import SubjectList from "./pages/principal/classes/SubjectList";
import Details from "./pages/principal/teachers/Details";
import NotFound from "./components/common/NotFound";
import Landing from "./pages/landing/Landing";
import ServiceList from "./pages/principal/students/ServiceList";

// Administrator pages
import AdministratorDashboard from "./pages/administrator/Dashboard";
import Schools from "./pages/administrator/Schools";
import Principals from "./pages/administrator/Principals";
import AdministratorSubscriptions from "./pages/administrator/Subscriptions";
import SubscriptionPayments from "./pages/administrator/SubscriptionPayments";
import ProfileSettings from "./pages/administrator/ProfileSettings";

// Librarian pages
import LibrarianDashboard from "./pages/librarian/Dashboard";
import LibrarianLibrary from "./pages/librarian/Library";

// Warden pages
import WardenDashboard from "./pages/warden/Dashboard";
import WardenHostel from "./pages/warden/Hostel";
import WardenMess from "./pages/warden/Mess";
import Wardens from "./pages/principal/Wardens";

// Super Admin pages
import SuperAdminLogin from "./pages/super-admin/Login";
import SuperAdminForgotPassword from "./pages/super-admin/ForgotPassword";
import SuperAdminResetPassword from "./pages/super-admin/ResetPassword";
import SuperAdminDashboard from "./pages/super-admin/Dashboard";
import SuperAdminPlans from "./pages/super-admin/SubscriptionPlans";
import SuperAdminSchools from "./pages/super-admin/Schools";
import SuperAdminEnquiries from "./pages/super-admin/Enquiries";
import SuperAdminAllUsers from "./pages/super-admin/AllUsers";
import SuperAdminLayout from "./components/SuperAdminLayout";
import HomeLayout from "./pages/landing/HomeLayout";
import About from "./pages/landing/About";
import Contact from "./pages/landing/Contact";
import Pricing from "./pages/landing/Pricing";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthInitializer />
      <Toaster />
      <Sonner />
      <Routes>

        <Route element={<HomeLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/pricing" element={<Pricing/>}/>
          
        </Route>

        {/* Super Admin Routes (Separate Authentication System) */}
        <Route path="/super-admin/login" element={<SuperAdminLogin />} />
        <Route path="/super-admin/forgot-password" element={<SuperAdminForgotPassword />} />
        <Route path="/super-admin/reset-password" element={<SuperAdminResetPassword />} />
        <Route element={<PrivateRoute allowedRoles={['super_admin']} />}>
          <Route path="/super-admin" element={<SuperAdminLayout />}>
            <Route path="dashboard" element={<SuperAdminDashboard />} />
            <Route path="plans" element={<SuperAdminPlans />} />
            <Route path="enquiries" element={<SuperAdminEnquiries />} />
            <Route path="users" element={<SuperAdminAllUsers />} />
            <Route path="schools" element={<SuperAdminSchools />} />
          </Route>
        </Route>

        {/* Public Routes */}
        <Route path="/signup" element={<SignupPage/>}/>
        <Route path="/school-setup" element={<AdminSchoolSetupPage />} />
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/verify-otp" element={<RequestOtpPage/>}/>
          <Route path="/reset-password" element={<ResetPasswordPage/>}/>
        </Route>

        {/* Onboarding Routes (Authenticated but not requiring full subscription) */}
        <Route element={<PrivateRoute allowedRoles={['principal', 'teacher', 'student', 'parent', 'accountant', 'administrator', 'librarian']} />}>
          <Route path="/choose-plan" element={<PricingPage />} />
          <Route path="/payment" element={<PaymentPage />} />
        </Route>

        {/* Subscription Management (Requires subscription) */}
        <Route element={<PrivateRoute allowedRoles={['principal']} />}>
          <Route path="/subscription/manage" element={
            <RequireSubscription>
              <SubscriptionManagementPage />
            </RequireSubscription>
          } />
        </Route>

        {/* admin panel */}
        <Route element={<PrivateRoute allowedRoles={['principal']} />}>
          {/* Principal routes with subscription check */}
          <Route path="/principal" element={<Layout />}>
            {/* Dashboard - always accessible */}
            <Route path="dashboard" element={<AdminDashboard />} />

            {/* Protected routes - require subscription */}
            <Route element={<PrincipalSubscriptionCheck />}>
              <Route path="hostel" element={<Hostel />} />
              <Route path="wardens" element={<Wardens />} />
              <Route path="library" element={<Library />} />
              <Route path="transport" element={<Transport />} />
              <Route path="exam" element={<Exam />} />
              <Route path="classes/subjects" element={<Subjects />} />
              <Route path="classes/subjectlist" element={<SubjectList />} />
              <Route path="classes/timetable" element={<Timetable />} />
              <Route path="classes/list" element={<ClassList />} />
              <Route path="settings/roles" element={<Roles />} />
              <Route path="settings/school-info" element={<SchoolInfo />} />
              <Route path="settings/user-management" element={<UserManagement />} />
              <Route path="communication" element={<Communication />} />
              <Route path="teachers/list" element={<List />} />
              <Route path="teachers/register" element={<Register />} />
              {/* <Route path="teachers/subject" element={<AssignSubject />} /> */}
              <Route path="/principal/teachers/list/details/:id" element={<Details />} />
              
              {/* Reports */}
              <Route path="reports">
                <Route path="student" element={<StudentReports />} />
                <Route path="fee" element={<FeeReports />} />
                <Route path="attendance" element={<AttendanceReport />} />
                <Route path="exams" element={<ExamReport />} />
                <Route path="syllabus-overview" element={<SyllabusOverview />} />
                <Route path="syllabus-detailed" element={<SyllabusDetailed />} />
              </Route>

              {/* Attendance Management */}
              <Route path="attendance">
                <Route path="teachers" element={<TeacherAttendancePage />} />
                <Route path="dashboard" element={<AttendanceDashboard />} />
              </Route>

              <Route
                path="students/attendance/mark-attendance"
                element={<MarkAttendance />}
              />

              <Route path="students/">
                <Route path="list" element={<StudentList />} />
                <Route path="details/:id" element={<StudentDetails />} />
                <Route path="register" element={<StudentRegister />} />
                <Route path="servicelist" element={<ServiceList/>}/>
                <Route path="attendance/analytics" element={<StudentAttendanceAnalytics />} />
                <Route path="attendance/class/:classId" element={<ClassWiseAttendanceAnalysis />} />
                <Route path="attendance/student/:studentId" element={<StudentIndividualAnalysis />} />
              </Route>

              <Route path="users/">
                <Route path="register" element={<UserRegister />} />
                <Route path="list" element={<UserList />} />
              </Route>
            </Route>
          </Route>
        </Route>

        {/* teacher panel */}
        <Route element={<PrivateRoute allowedRoles={['teacher']} />}>
          <Route path="/teacher" element={
            <RequireSubscription allowDashboardAccess={true}>
              <Layout />
            </RequireSubscription>
          }>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="my-classes" element={<MyClasses />} />
            <Route path="class-details/:classId" element={<ClassDetails />} />
            <Route path="my-profile" element={<TeacherProfile />} />
            <Route path="edit-profile" element={<EditTeacherProfile />} />
            <Route path="change-password" element={<ChangePassword />} />
            <Route path="syllabus-completion" element={<SyllabusCompletion />} />
            <Route path="reports" element={<TeacherReports />} />
            <Route path="assignments" element={<TeacherAssignments />} />
            <Route path="communication" element={<TeacherCommunication />} />
            <Route path="exam">
              <Route path="marks-entry" element={<MarkEntry />} />
              <Route path="schedule" element={<ExamSchedule />} />
            </Route>
            
            {/* Legacy Student Attendance - Removed, use Analytics instead */}
            
                {/* Professional Attendance System */}
                <Route path="attendance">
                  <Route index element={<TeacherMarkAttendance />} />
                  <Route path="mark" element={<TeacherMarkAttendance />} />
                  <Route path="records" element={<AttendanceRecords />} />
                </Route>
          </Route>
        </Route>

        {/* student panel */}
        <Route element={<PrivateRoute allowedRoles={['student']} />}>
          <Route path="/student" element={
            <RequireSubscription allowDashboardAccess={true}>
              <Layout />
            </RequireSubscription>
          }>
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="attendance" element={<StudentAttendance />} />
            <Route path="messages" element={<StudentMessages />} />
            <Route path="library" element={<StudentLibrary />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="exams/result" element={<StudentExams />} />
            <Route path="exams/reports-cards" element={<ReportCard />} />
            <Route path="fees/due" element={<StudentFeesDue />} />
            <Route
              path="fees/payments-history"
              element={<StudentPaymentHistory />}
            />
          </Route>
        </Route>

        {/* parent panel  */}
        <Route element={<PrivateRoute allowedRoles={['parent']} />}>
          <Route path="/parent" element={
            <RequireSubscription allowDashboardAccess={true}>
              <Layout />
            </RequireSubscription>
          }>
            <Route path="attendance" element={<StudentAttendance />} />
            <Route path="dashboard" element={<ParentDashboard />} />
            <Route path="notices" element={<ParentNotices />} />
            <Route path="exams/results" element={<StudentExams />} />
            <Route path="exams/reports-cards" element={<ReportCard />} />
            <Route path="fees/dues" element={<ParentFeesDue />} />
            <Route
              path="fees/payments-receipts"
              element={<ParentPaymentReceipts />}
            />
            <Route path="children/academic" element={<StudentAcademic />} />
            <Route path="children-personal-info" element={<StudentPersonal />} />
          </Route>
        </Route>

        {/* accountant panel */}
        <Route element={<PrivateRoute allowedRoles={['accountant']} />}>
          <Route path="/accountant" element={
            <RequireSubscription allowDashboardAccess={true}>
              <Layout />
            </RequireSubscription>
          }>
            <Route path="dashboard" element={<AccountantDashboard />} />
            <Route path="fees" element={<AccountantFees />} />
            <Route path="payments" element={<AccountantPayments />} />
            <Route path="extra-services" element={<AccountantExtraServices />} />
            <Route path="monthly-dues" element={<AccountantMonthlyDue />} />
            <Route path="fees-structure" element={<AccountantFeeStructure />} />
            <Route path="annual-payments" element={<AnnualPayments />} />
            <Route path="service-charges" element={<ServiceCharges />} />
            <Route path="report/dues-pending" element={<AccountantDues />} />
            <Route path="report/transactions" element={<Transactions />} />
            <Route path="report/fee" element={<AccountantFeeReports />} />

          </Route>
        </Route>

        {/* librarian panel */}
        <Route element={<PrivateRoute allowedRoles={['librarian']} />}>
          <Route path="/librarian" element={
            <RequireSubscription allowDashboardAccess={true}>
              <Layout />
            </RequireSubscription>
          }>
            <Route path="dashboard" element={<LibrarianDashboard />} />
            <Route path="profile-settings" element={<ProfileSettings />} />
            <Route element={<PrincipalSubscriptionCheck />}>
              <Route path="library" element={<LibrarianLibrary />} />
            </Route>
          </Route>
        </Route>

        {/* administrator panel */}
        <Route element={<PrivateRoute allowedRoles={['administrator']} />}>
          <Route path="/administrator" element={<Layout />}>
            <Route path="dashboard" element={<AdministratorDashboard />} />
            <Route path="schools" element={<Schools />} />
            <Route path="principals" element={<Principals />} />
            <Route path="subscriptions" element={<AdministratorSubscriptions />} />
            <Route path="payments" element={<SubscriptionPayments />} />
            <Route path="profile-settings" element={<ProfileSettings />} />
          </Route>
        </Route>

        {/* Warden Routes */}
        <Route element={<PrivateRoute allowedRoles={['warden']} />}>
          <Route path="/warden" element={<Layout />}>
            <Route path="dashboard" element={<WardenDashboard />} />
            <Route path="hostel" element={<WardenHostel />} />
            <Route path="mess" element={<WardenMess />} />
          </Route>
        </Route>

        {/* Catch-all route - must be last */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useStudentDashboard } from '@/hooks/useStudentDashboard';
import { StatsOverview } from '@/components/student/StatsOverview';
import { StudentProfileCard } from '@/components/student/StudentProfileCard';
import { TodayClassesCard } from '@/components/student/TodayClassesCard';
import { SyllabusProgressCard } from '@/components/student/SyllabusProgressCard';
import { ExamDetailsCard } from '@/components/student/ExamDetailsCard';
import { useAuthStore } from '@/store/useAuthStore';
import { useEffect, useState } from 'react';

export default function StudentDashboard() {
  const [studentId, setStudentId] = useState<number | null>(null);
  const [schoolId, setSchoolId] = useState<number | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const { authUser } = useAuthStore();

  // Get student and school ID from auth store or localStorage
  useEffect(() => {
    const debugLog: string[] = [];
    debugLog.push('=== Student Dashboard Initialization ===');
    debugLog.push(`AuthUser: ${JSON.stringify(authUser)}`);
    
    // Try to get from auth store first
    if (authUser?.id && authUser?.school_id) {
      debugLog.push('✅ Using auth store data');
      debugLog.push(`  Student ID: ${authUser.id}`);
      debugLog.push(`  School ID: ${authUser.school_id}`);
      setStudentId(parseInt(authUser.id));
      setSchoolId(parseInt(authUser.school_id));
      setIsInitializing(false);
      setDebugInfo(debugLog.join('\n'));
      return;
    }

    // Fallback to localStorage (for direct storage)
    const storedUserId = localStorage.getItem('user_id');
    const storedSchoolId = localStorage.getItem('school_id');
    const storedRole = localStorage.getItem('role');
    const storedToken = localStorage.getItem('token');
    
    debugLog.push('LocalStorage data:');
    debugLog.push(`  user_id: ${storedUserId}`);
    debugLog.push(`  school_id: ${storedSchoolId}`);
    debugLog.push(`  role: ${storedRole}`);
    debugLog.push(`  token: ${storedToken ? 'Present' : 'Missing'}`);
    
    if (storedUserId && storedSchoolId) {
      debugLog.push('✅ Using localStorage data');
      setStudentId(parseInt(storedUserId));
      setSchoolId(parseInt(storedSchoolId));
    } else {
      debugLog.push('❌ Missing user_id or school_id in localStorage');
    }
    
    setIsInitializing(false);
    setDebugInfo(debugLog.join('\n'));
    console.log(debugLog.join('\n'));
  }, [authUser]);

  const { data, isLoading, isError, error, refetch } = useStudentDashboard(studentId, schoolId);

  useEffect(() => {
    console.log('=== Dashboard Query State ===');
    console.log('Student ID:', studentId);
    console.log('School ID:', schoolId);
    console.log('Is Loading:', isLoading);
    console.log('Is Error:', isError);
    console.log('Error:', error);
    console.log('Data:', data);
  }, [studentId, schoolId, isLoading, isError, error, data]);

  // Show initialization loading
  if (isInitializing) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  // Show error if no student/school ID found
  if (!studentId || !schoolId) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Unable to load student information. Missing student ID or school ID.
          </AlertDescription>
        </Alert>
        <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-900 rounded-md">
          <h3 className="font-bold mb-2">Debug Information:</h3>
          <pre className="text-xs whitespace-pre-wrap">{debugInfo}</pre>
        </div>
        <Button onClick={() => window.location.href = '/login'}>
          Go to Login
        </Button>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  // Error state
  if (isError || !data) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error?.message || 'Failed to load dashboard data. Please try again.'}
          </AlertDescription>
        </Alert>
        <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-900 rounded-md">
          <h3 className="font-bold mb-2">Debug Information:</h3>
          <pre className="text-xs whitespace-pre-wrap">
{`Student ID: ${studentId}
School ID: ${schoolId}
Error: ${JSON.stringify(error, null, 2)}
`}
          </pre>
        </div>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">Dashboard</h1>
          <p className="text-gray-500 text-xs">
            Welcome back, {data.student_info.name}! Here's your academic overview
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <StatsOverview stats={data.stats} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Profile - 1 column */}
        <div className="lg:col-span-1">
          <StudentProfileCard 
            studentInfo={data.student_info} 
            classDetails={data.class_details}
          />
        </div>

        {/* Today's Classes - 2 columns */}
        <div className="lg:col-span-2">
          <TodayClassesCard classes={data.todays_classes} />
        </div>
      </div>

      {/* Syllabus Progress - Full Width */}
      <SyllabusProgressCard syllabusData={data.syllabus_completion} />

      {/* Examination Details - Full Width */}
      <ExamDetailsCard studentClassId={data.class_details?.class_id} />
    </div>
  );
}

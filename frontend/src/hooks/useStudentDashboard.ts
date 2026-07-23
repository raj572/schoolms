import { useQuery } from '@tanstack/react-query';
import { getStudentDashboard } from '@/services/studentDashboardService';
import { StudentDashboardData } from '@/types/student';

interface UseStudentDashboardReturn {
  data: StudentDashboardData | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Custom hook to fetch student dashboard data
 */
export const useStudentDashboard = (
  studentId: number | null,
  schoolId: number | null
): UseStudentDashboardReturn => {
  const {
    data: responseData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['studentDashboard', studentId, schoolId],
    queryFn: () => {
      if (!studentId || !schoolId) {
        throw new Error('Student ID and School ID are required');
      }
      return getStudentDashboard(studentId, schoolId);
    },
    enabled: !!studentId && !!schoolId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });

  return {
    data: responseData?.data,
    isLoading,
    isError,
    error,
    refetch,
  };
};


import { useAuthStore } from '@/store/useAuthStore';

const API_BASE_URL = 'http://localhost:8000/api/principal';

export interface ReportData {
  summary: {
    totalStudents: number;
    totalTeachers: number;
    classCount: number;
    avgAttendance: number;
    feeCollectionRate: number;
  };
  attendance: {
    studentAttendance: {
      data: Array<{ month: string; attendance: number; present: number; absent: number }>;
      average: number;
    };
    teacherAttendance: {
      data: Array<{ month: string; attendance: number }>;
      average: number;
    };
  };
  feeCollection: {
    total: number;
    paid: number;
    due: number;
    collectionRate: number;
    pieChartData: Array<{ name: string; value: number }>;
    monthlyData: Array<{ month: string; paid: number; due: number }>;
  };
  performance: {
    totalStudents: number;
    averagePerformance: number;
    passRate: number;
    subjectWiseData: Array<{ name: string; average: number; students: number }>;
  };
  dateRange: {
    start: string;
    end: string;
  };
}

export const reportService = {
  /**
   * Fetch comprehensive report data
   */
  async fetchReportData(startDate: string, endDate: string): Promise<ReportData | null> {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching report data:', { startDate, endDate });
      
      const response = await fetch(`${API_BASE_URL}/reports/data`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ start_date: startDate, end_date: endDate }),
      });

      if (!response.ok) {
        console.error('API Error:', response.status, response.statusText);
        throw new Error('Failed to fetch report data');
      }

      const result = await response.json();
      console.log('Report data received:', result);
      return result.status ? result.data : null;
    } catch (error) {
      console.error('Error fetching report data:', error);
      return null;
    }
  },

  /**
   * Export report in various formats
   */
  async exportReport(
    reportType: 'attendance' | 'financial' | 'performance',
    format: 'pdf' | 'excel' | 'csv',
    startDate: string,
    endDate: string
  ): Promise<boolean> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/reports/export`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          report_type: reportType,
          format: format,
          start_date: startDate,
          end_date: endDate,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to export report');
      }

      // Handle file download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Extract filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition 
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
        : `${reportType}_report.${format}`;
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      return true;
    } catch (error) {
      console.error('Error exporting report:', error);
      return false;
    }
  },

  /**
   * Fetch attendance trends
   */
  async fetchAttendanceTrends(schoolId: number, startDate?: string, endDate?: string) {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      const response = await fetch(
        `${API_BASE_URL}/reports/attendance-trends/${schoolId}?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch attendance trends');
      }

      const result = await response.json();
      return result.status ? result.data : null;
    } catch (error) {
      console.error('Error fetching attendance trends:', error);
      return null;
    }
  },

  /**
   * Fetch fee collection statistics
   */
  async fetchFeeCollectionStats(schoolId: number, startDate?: string, endDate?: string) {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      const response = await fetch(
        `${API_BASE_URL}/reports/fee-collection/${schoolId}?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch fee collection stats');
      }

      const result = await response.json();
      return result.status ? result.data : null;
    } catch (error) {
      console.error('Error fetching fee collection stats:', error);
      return null;
    }
  },

  /**
   * Fetch performance metrics
   */
  async fetchPerformanceMetrics(schoolId: number, startDate?: string, endDate?: string) {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      const response = await fetch(
        `${API_BASE_URL}/reports/performance-metrics/${schoolId}?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch performance metrics');
      }

      const result = await response.json();
      return result.status ? result.data : null;
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      return null;
    }
  },
};

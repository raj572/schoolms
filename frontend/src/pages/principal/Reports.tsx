import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from "recharts";
import { FileText, Download, TrendingUp, Users, DollarSign, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { reportService, ReportData } from "@/services/reportService";
import { DateRangeFilter } from "@/components/reports/DateRangeFilter";
import { ExportButton } from "@/components/reports/ExportButton";

const Reports = () => {
  const authUser = useAuthStore((state) => state.authUser);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date>(new Date(new Date().setMonth(new Date().getMonth() - 6)));
  const [endDate, setEndDate] = useState<Date>(new Date());

  // Fetch report data when date range changes
  useEffect(() => {
    if (!authUser?.school_id) {
      console.log('No school_id found in authUser:', authUser);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('Fetching data for school:', authUser.school_id);
        const data = await reportService.fetchReportData(
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0]
        );
        console.log('Report data set:', data);
        setReportData(data);
      } catch (err) {
        console.error('Error fetching report data:', err);
        setError('Failed to load report data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate, authUser]);

  const handleDateRangeChange = (start: Date, end: Date) => {
    setStartDate(start);
    setEndDate(end);
  };

  if (!authUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading user data...</p>
      </div>
    );
  }

  const COLORS = ['#0088FE', '#FF8042'];

  // Prepare data for charts
  const attendanceData = reportData?.attendance?.studentAttendance?.data || [];
  const feeCollectionData = reportData?.feeCollection?.pieChartData || [];
  const performanceData = reportData?.performance?.subjectWiseData || [];
  const summary = {
    totalStudents: reportData?.summary?.totalStudents || 0,
    avgAttendance: reportData?.summary?.avgAttendance || 0,
    feeCollectionRate: reportData?.summary?.feeCollectionRate || 0,
    classCount: reportData?.summary?.classCount || 0,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-600 mt-2">View comprehensive reports and analytics</p>
          </div>
          <Link to="/principal/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>

        {/* Date Range Filter */}
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <DateRangeFilter
              startDate={startDate}
              endDate={endDate}
              onDateRangeChange={handleDateRangeChange}
            />
          </CardContent>
        </Card>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading report data...</p>
            </div>
          </div>
        ) : reportData ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Students</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    <div className="text-2xl font-bold text-gray-900">{summary.totalStudents}</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Average Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <div className="text-2xl font-bold text-gray-900">{summary.avgAttendance}%</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Fee Collection Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-orange-600" />
                    <div className="text-2xl font-bold text-gray-900">{summary.feeCollectionRate}%</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Classes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-purple-600" />
                    <div className="text-2xl font-bold text-gray-900">{summary.classCount}</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Monthly Attendance Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={attendanceData}>
                      <defs>
                        <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                      <XAxis dataKey="month" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px'
                        }} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="attendance" 
                        stroke="#8884d8" 
                        fillOpacity={1} 
                        fill="url(#colorAttendance)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Fee Collection Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={feeCollectionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={90}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {feeCollectionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 text-center text-sm text-gray-600">
                    {reportData?.feeCollection && (
                      <>
                        Collected: ₹{reportData.feeCollection.paid.toLocaleString()} | 
                        Pending: ₹{reportData.feeCollection.due.toLocaleString()}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                      <XAxis dataKey="name" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px'
                        }}
                      />
                      <Bar dataKey="average" fill="#8884d8" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  {reportData?.performance && (
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-gray-600 text-sm mb-1">Average Performance</p>
                        <p className="text-2xl font-bold text-green-700">{reportData.performance.averagePerformance}%</p>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-gray-600 text-sm mb-1">Pass Rate</p>
                        <p className="text-2xl font-bold text-blue-700">{reportData.performance.passRate}%</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Monthly Fee Collection Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={reportData?.feeCollection?.monthlyData || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                      <XAxis dataKey="month" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px'
                        }}
                      />
                      <Bar dataKey="paid" stackId="a" fill="#0088FE" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="due" stackId="a" fill="#FF8042" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="shadow-sm hover:shadow-md transition-all cursor-pointer border-l-4 border-l-blue-500">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <FileText className="h-6 w-6 text-blue-600" />
                    <span>Student Report</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">Complete student performance and attendance report</p>
                  <ExportButton
                    reportType="attendance"
                    startDate={startDate.toISOString().split('T')[0]}
                    endDate={endDate.toISOString().split('T')[0]}
                  />
                </CardContent>
              </Card>

              <Card className="shadow-sm hover:shadow-md transition-all cursor-pointer border-l-4 border-l-green-500">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <DollarSign className="h-6 w-6 text-green-600" />
                    <span>Financial Report</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">Fee collection and financial analysis report</p>
                  <ExportButton
                    reportType="financial"
                    startDate={startDate.toISOString().split('T')[0]}
                    endDate={endDate.toISOString().split('T')[0]}
                  />
                </CardContent>
              </Card>

              <Card className="shadow-sm hover:shadow-md transition-all cursor-pointer border-l-4 border-l-purple-500">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                    <span>Performance Report</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">Overall school performance and analytics</p>
                  <ExportButton
                    reportType="performance"
                    startDate={startDate.toISOString().split('T')[0]}
                    endDate={endDate.toISOString().split('T')[0]}
                  />
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <p className="text-yellow-800 text-center">No data available for the selected date range.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Reports;
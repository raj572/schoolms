import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Heading from '@/components/common/Heading';
import { API_BASE_URL } from '@/lib/axios';
import { Search, Download, Eye, Filter, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { exportToCsv } from '@/lib/exportUtils';
import { toast } from 'sonner';

interface Student {
  id: string;
  name: string;
  rollNo: string;
  class: string;
  section: string;
  totalMarks: number;
  percentage: number;
  grade: string;
  status: 'pass' | 'fail';
  parentContact: string;
}

const StudentReports = () => {
  const authUser = useAuthStore((state) => state.authUser);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSection, setSelectedSection] = useState('all');
  
  // Get unique classes and sections from loaded data
  const availableClasses = [...new Set(students.map(s => s.class))].sort();
  const availableSections = [...new Set(students.map(s => s.section))].sort();

  // Fetch students data from API
  useEffect(() => {
    const fetchStudents = async () => {
      if (!authUser?.school_id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // Fetch students from your existing API endpoint
        const response = await fetch(`${API_BASE_URL}/principal/getstudents/${authUser.school_id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const result = await response.json();
          // Transform API data to match our interface
          const studentsData = result.data?.map((student: any, index: number) => ({
            id: student.id?.toString() || index.toString(),
            name: student.candidate_name || student.name || 'Unknown',
            rollNo: student.roll_no || `STU${index + 1}`,
            class: student.class || '-',
            section: student.section || '-',
            totalMarks: 0, // Calculate from exam marks if available
            percentage: 0,
            grade: '-',
            status: 'pass' as const,
            parentContact: student.parent_contact || '+91 0000000000'
          })) || [];
          
          setStudents(studentsData);
        } else {
          setError('Failed to fetch student data');
        }
      } catch (err) {
        console.error('Error fetching students:', err);
        setError('Failed to load student data');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [authUser]);

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.rollNo.includes(searchTerm);
    const matchesClass = selectedClass === 'all' || student.class === selectedClass;
    const matchesSection = selectedSection === 'all' || student.section === selectedSection;
    
    return matchesSearch && matchesClass && matchesSection;
  });

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+': return 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300';
      case 'A': return 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300';
      case 'B+': return 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300';
      case 'B': return 'bg-yellow-100 dark:bg-yellow-950/60 text-yellow-800 dark:text-yellow-300';
      case 'C': return 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const generateReport = (student: Student) => {
    const headers = ["ID", "Name", "Roll No", "Class", "Section", "Total Marks", "Percentage", "Grade", "Status", "Parent Contact"];
    const rows = [[student.id, student.name, student.rollNo, student.class, student.section, `${student.totalMarks}/500`, `${student.percentage}%`, student.grade, student.status, student.parentContact]];
    exportToCsv(`student_report_${student.rollNo || student.id}.csv`, headers, rows);
    toast.success(`Report downloaded for ${student.name}`);
  };

  const downloadAllReports = () => {
    if (filteredStudents.length === 0) {
      toast.error("No student records to export");
      return;
    }
    const headers = ["ID", "Name", "Roll No", "Class", "Section", "Total Marks", "Percentage", "Grade", "Status", "Parent Contact"];
    const rows = filteredStudents.map((student) => [
      student.id, student.name, student.rollNo, student.class, student.section, `${student.totalMarks}/500`, `${student.percentage}%`, student.grade, student.status, student.parentContact
    ]);
    exportToCsv(`all_student_reports_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
    toast.success(`Exported ${filteredStudents.length} student report(s)`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading student data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="border-rose-200 bg-rose-50 dark:bg-rose-950/20">
          <CardContent className="pt-6">
            <p className="text-rose-600 dark:text-rose-400">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold">Student Reports</h2>
          <p className="text-muted-foreground text-xs mt-1">View and manage student academic reports</p>
        </div>
        <Button onClick={downloadAllReports} disabled={filteredStudents.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Download All Reports
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{students.length}</div>
            <p className="text-xs text-gray-500">Enrolled students</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Percentage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {Math.round(students.reduce((sum, s) => sum + s.percentage, 0) / students.length)}%
            </div>
            <p className="text-xs text-gray-500">Class average</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {Math.round((students.filter(s => s.status === 'pass').length / students.length) * 100)}%
            </div>
            <p className="text-xs text-gray-500">Success rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top Performers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {students.filter(s => s.percentage >= 85).length}
            </div>
            <p className="text-xs text-gray-500">Above 85%</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search" className='text-xs'>Search Student</Label>
              <div className="relative text-xs">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  id="search"
                  placeholder="Name or Roll No."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9  text-xs"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="class">Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {availableClasses.map(cls => (
                    <SelectItem key={cls} value={cls}>Class {cls}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="section">Section</Label>
              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger>
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sections</SelectItem>
                  {availableSections.map(section => (
                    <SelectItem key={section} value={section}>Section {section}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>Student Performance Reports</CardTitle>
          <CardDescription className='text-xs text-gray-500'>
            Academic performance of all students ({filteredStudents.length} results)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Roll No.</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Total Marks</TableHead>
                <TableHead>Percentage</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Parent Contact</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium text-xs">{student.rollNo}</TableCell>
                  <TableCell className="font-medium text-xs">{student.name}</TableCell>
                  <TableCell className="font-medium text-xs">{student.class}</TableCell>
                  <TableCell className="font-medium text-xs">{student.section}</TableCell>
                  <TableCell className="font-medium text-xs">{student.totalMarks}/500</TableCell>
                  <TableCell className="font-medium text-xs">{student.percentage}%</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(student.grade)}`}>
                      {student.grade}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={student.status === 'pass' ? 'default' : 'destructive'}>
                      {student.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell  className="font-medium text-xs">{student.parentContact}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => generateReport(student)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentReports;
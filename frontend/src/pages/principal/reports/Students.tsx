import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Download, Eye, Filter, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

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
        const response = await fetch(`http://localhost:8000/api/principal/getstudents/${authUser.school_id}`, {
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
      case 'A+': return 'bg-green-100 text-green-800';
      case 'A': return 'bg-blue-100 text-blue-800';
      case 'B+': return 'bg-yellow-100 text-yellow-800';
      case 'B': return 'bg-orange-100 text-orange-800';
      case 'C': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const generateReport = (student: Student) => {
    // Mock report generation
    console.log(`Generating report for ${student.name}`);
  };

  const downloadAllReports = () => {
    // Mock download functionality
    console.log('Downloading all reports...');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading student data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 ">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold ">Student Reports</h2>
          <p className="text-gray-500 text-xs">View and manage student academic reports</p>
        </div>
        <Button onClick={downloadAllReports}>
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
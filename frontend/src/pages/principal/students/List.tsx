import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Plus, Eye, Edit, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link, useNavigate } from "react-router-dom";
import Heading from "@/components/common/Heading";
import { StudentForm, useUsersStore } from "@/store/useUsersStore";
import { useAuthStore } from "@/store/useAuthStore";


const StudentList = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<StudentForm[]>([]);
  const {getStudentDetails} = useUsersStore()
  const {authUser} = useAuthStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true); 


  const fetchStudents = async()=>{
    const schoolId = authUser?.school_id;
    if(!schoolId) return;
    const data = await getStudentDetails(schoolId);
    if(data) setStudents(data);
    console.log(data);
  }

  useEffect(()=>{
    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  const handleDelete = (id: number) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    setStudents((prev) => prev.filter((s) => s.id !== id));
  };

  const filteredStudents = students.filter(
    (student) =>
      student.candidate_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.roll_no.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-0 md:justify-between md:items-center mb-8">
          <Heading title="Students Management" description="Manage all student records and information" />

          <div className="flex gap-2">
            <Link to="/principal/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
            <Link to="/principal/students/register">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Student
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        
            <>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{students.length}</div>
                  <div className="text-sm text-muted-foreground">Total Students</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {students.filter((s) => s.status === "active").length}
                  </div>
                  <div className="text-sm text-muted-foreground">Active Students</div>
                </CardContent>
              </Card>
            </>
        </div>

        {/* Table */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-lg">All Students</CardTitle>
            <div className="relative w-full sm:w-64">
              <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 " />
              </span>
              <Input
                placeholder="Search students..."
                className="pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {filteredStudents.length === 0 ? (
              <p className="text-sm text-center">No students found.</p>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden sm:block">
                  <Table className="min-w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Roll No.</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Father's Name</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.map((student) => (
                        <TableRow key={student.id} className="font-medium text-xs">
                          <TableCell>{student.roll_no}</TableCell>
                          <TableCell>{student.candidate_name}</TableCell>
                          <TableCell>{`${student.class} - ${student.section}`}</TableCell>
                          <TableCell>{student.email}</TableCell>
                          <TableCell>{student.phone}</TableCell>
                          <TableCell>{student.father_name}</TableCell>
                          <TableCell className="text-center">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                student.status === "active"
                                  ? "bg-accent text-primary"
                                  : "bg-accent text-accent-foreground"
                              }`}
                            >
                              {student.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => navigate(`/principal/students/details/${student.id}`)}
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(student.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Cards */}
                <div className="sm:hidden space-y-4">
                  {filteredStudents.map((student) => (
                    <div key={student.id} className="border-b border-border py-4">
                      <div className="flex justify-between items-center mb-2">
                        <p className="font-medium">{student.candidate_name}</p>
                        <div className="flex items-center gap-2">
                          <span
                            className="px-2 py-1 rounded-full text-xs bg-accent text-accent-foreground" 
                          >
                            {student.status}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>
                          <span className="font-medium">Roll No.:</span> {student.roll_no}
                        </p>
                        <p>
                          <span className="font-medium">Class:</span> {`${student.class} - ${student.section}`}
                        </p>
                        <p>
                          <span className="font-medium">Email:</span> {student.email}
                        </p>
                        <p>
                          <span className="font-medium">Phone:</span> {student.phone}
                        </p>
                        <p>
                          <span className="font-medium">Father's Name:</span> {student.father_name}
                        </p>
                      </div>
                      <div className="flex justify-end  mt-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => navigate(`/principal/students/details/${student.id}`)}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(student.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default StudentList;

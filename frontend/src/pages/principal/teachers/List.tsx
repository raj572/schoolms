import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Eye, Edit, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useUsersStore, TeacherForm } from "@/store/useUsersStore";
import { Head } from "react-day-picker";
import Heading from "@/components/common/Heading";

const List = () => {
  const school_id = useAuthStore((state) => state.authUser.school_id);
const {getAllTeachers, deleteTeacher} = useUsersStore();

  const [teachers, setTeachers] = useState<TeacherForm[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

const handleDelete = async (index: number, id: string) => {
  
  const success = await deleteTeacher(id); 
  if (success) {
    setTeachers((prev) => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
  }
};


  useEffect(() => {
    const fetchTeachers = async () => {
      setLoading(true);
      try {
        const data = await getAllTeachers(school_id);
        if (data) {
          setTeachers(Array.isArray(data) ? data : [data]);
        } else {
          setTeachers([]);
        }
      } catch (error: any) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, [getAllTeachers, school_id]);




  const filteredTeachers = teachers.filter(
    u =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.id
  );

  return (
    <div className="min-h-screen   ">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-0 md:justify-between md:items-center mb-8">
          <Heading title="Teachers Management" description="Manage all teacher records and information"/>
          
          <div className="flex gap-2 ">
            <Link to="/principal/dashboard">
              <Button variant="outline" className="">Back to Dashboard</Button>
            </Link>
            <Link to ="/principal/teachers/register">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Teacher
            </Button>
            
            </Link>
          </div>
        </div>

         {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{teachers.length}</div>
              <div className="text-sm text-muted-foreground">Total Teachers</div>
            </CardContent>
          </Card>
          <Card className="">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {teachers.filter(u => u.status === "active").length}
              </div>
              <div className="text-sm text-muted-foreground">Active Teachers</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-lg">All Teachers</CardTitle>
            <div className="relative w-full sm:w-64">
              <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 " />
              </span>
              <Input
                placeholder="Search teachers..."
                className="pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {loading ? (
              <p className="text-sm text-center">Loading...</p>
            ) : filteredTeachers.length === 0 ? (
              <p className="text-sm text-center">No teachers found.</p>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden sm:block">
                  <Table className="min-w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead>EmpID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Gender</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTeachers.map((teacher, index) => (
                        <TableRow key={teacher.id} className="text-xs font-medium">
                          <TableCell>EMP00{teacher.id}</TableCell>
                          <TableCell>{teacher.name}</TableCell>
                          <TableCell>{teacher.gender}</TableCell>
                          <TableCell>{teacher.email}</TableCell>
                          <TableCell>{teacher.phone}</TableCell>
                          <TableCell className="text-center">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                teacher.status === "active"
                                  ? "bg-accent text-accent-foreground"
                                  : "bg-muted text-gray-600"
                              }`}
                            >
                              {teacher.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-center gap-2">
                              <Button asChild variant="ghost" size="sm">
                                <Link to={`/principal/teachers/list/details/${teacher.id}`}>
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                              {/* <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button> */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(index, teacher.id)}
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
                  {filteredTeachers.map((teacher, index) => (
                    <div key={teacher.id} className="border-b border-border py-4">
                      <div className="flex justify-between items-center mb-2">
                        <p className="font-medium">{teacher.name}</p>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            teacher.status === "active"
                              ? "bg-accent text-primary"
                              : "bg-muted text-gray-600"
                          }`}
                        >
                          {teacher.status}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-slate-400">
                        <p>
                          <span className="font-medium">EmpID:</span> EMP00{teacher.id}
                        </p>
                        <p>
                          <span className="font-medium">Gender:</span> {teacher.gender}
                        </p>
                        <p>
                          <span className="font-medium">Email:</span> {teacher.email}
                        </p>
                        <p>
                          <span className="font-medium">Phone:</span> {teacher.phone}
                        </p>
                      </div>
                      <div className="flex justify-end mt-2 gap-2">
                        <Button asChild variant="ghost" size="sm">
                          <Link to={`/principal/teachers/list/details/${teacher.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(index, teacher.id)}
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

export default List;
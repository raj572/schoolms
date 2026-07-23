import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Users, 
  BookOpen,
  Clock,
  MapPin,
  Search,
  Filter,
  Edit
} from "lucide-react";
import Heading from "@/components/common/Heading";
import { Link } from "react-router-dom";

export const Subjects= () => {
  const [searchTerm, setSearchTerm] = useState("");

  const classes = [
    {
      id: "CL001",
      name: "Grade 10-A",
      subject: "Mathematics",
      teacher: "Dr. Sarah Johnson",
      students: 28,
      room: "Room 101",
      schedule: "Mon, Wed, Fri - 9:00 AM",
      status: "Active"
    },
    {
      id: "CL002", 
      name: "Grade 9-B",
      subject: "English Literature",
      teacher: "Prof. Michael Brown",
      students: 32,
      room: "Room 205",
      schedule: "Tue, Thu - 11:00 AM",
      status: "Active"
    },
    {
      id: "CL003",
      name: "Grade 11-A",
      subject: "Physics",
      teacher: "Dr. Emily Davis",
      students: 25,
      room: "Lab 301",
      schedule: "Mon, Wed, Fri - 2:00 PM",
      status: "Active"
    },
    {
      id: "CL004",
      name: "Grade 8-C",
      subject: "History",
      teacher: "Mr. Robert Wilson",
      students: 30,
      room: "Room 102",
      schedule: "Tue, Thu - 10:00 AM",
      status: "Inactive"
    }
  ];

  const filteredClasses = classes.filter(cls =>
    cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.teacher.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 ">
     
       {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Heading title="Classes Management" description="Organize and manage class schedules and assignments"/>

          <div className="flex gap-2">
            <Link to="/principal/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
            <Link to="/principal/classes/list">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Class
              </Button>
            </Link>
          </div>
        </div>

      {/* Search */}
      <Card className="bg-gradient-card shadow-soft w-[1030px] overflow-hidden">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 ">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search classes by name, subject, or teacher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-96"
              />
            </div>
            <Button variant="outline">
              <Filter className=" h-4 w-4" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClasses.map((cls) => (
          <Card key={cls.id} className="bg-gradient-card shadow-soft hover:shadow-medium transition-all duration-300">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-sm">{cls.name}</CardTitle>
                  <CardDescription className="text-xs font-medium text-primary">
                    {cls.subject}
                  </CardDescription>
                </div>
                <Badge 
                  variant={cls.status === "Active" ? "default" : "secondary"}
                >
                  {cls.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center text-xs text-muted-foreground">
                  <BookOpen className="mr-2 h-4 w-4" />
                  {cls.teacher}
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Users className="mr-2 h-4 w-4" />
                  {cls.students} students
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <MapPin className="mr-2 h-4 w-4" />
                  {cls.room}
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="mr-2 h-4 w-4" />
                  {cls.schedule}
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  View Details
                </Button>
                <Button  size="sm" className="flex-1">
                  Edit Class
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
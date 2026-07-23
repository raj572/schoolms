import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Mail, Phone, MapPin, Calendar, BookOpen, User, Loader2, Briefcase, Edit, Lock } from "lucide-react";
import { useAuthStore } from '@/store/useAuthStore';
import { getTeacherProfile, TeacherProfile as TeacherProfileType } from '@/services/teacherApiService';
import { useToast } from '@/hooks/use-toast';

const TeacherProfile = () => {
  const { authUser } = useAuthStore();
  const { toast } = useToast();
  const [teacher, setTeacher] = useState<TeacherProfileType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTeacherProfile = async () => {
      if (!authUser?.id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const teacherId = parseInt(authUser.id);
        
        if (isNaN(teacherId)) {
          throw new Error('Invalid teacher ID');
        }

        const response = await getTeacherProfile(teacherId);
        console.log('Teacher profile response:', response);
        
        if (response.status && response.data) {
          setTeacher(response.data);
        } else {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: response.message || 'Failed to load profile data',
          });
        }
      } catch (error) {
        console.error('Error fetching teacher profile:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load profile data. Please refresh the page.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeacherProfile();
  }, [authUser?.id, toast]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const calculateExperience = (joinDate: string) => {
    if (!joinDate) return 'N/A';
    const start = new Date(joinDate);
    const now = new Date();
    const years = now.getFullYear() - start.getFullYear();
    const months = now.getMonth() - start.getMonth();
    
    if (years === 0) {
      return `${months} month${months !== 1 ? 's' : ''}`;
    }
    return `${years} year${years !== 1 ? 's' : ''}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-lg text-muted-foreground mb-4">Profile not found</p>
        <Link to="/teacher/dashboard">
          <Button>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  // Get unique subjects
  const uniqueSubjects = teacher.subjects && Array.isArray(teacher.subjects) 
    ? Array.from(
        new Map(teacher.subjects.map(item => [item.subject?.subject_name, item.subject])).values()
      ).filter(s => s && s.subject_name)
    : [];

  // Get assigned classes with subjects
  interface AssignedClass {
    class_id: number;
    class_name: string;
    subjects: string[];
  }

  const assignedClasses = teacher.subjects && Array.isArray(teacher.subjects)
    ? teacher.subjects.reduce((acc: AssignedClass[], curr) => {
        if (!curr.class || !curr.subject) return acc;
        
        const existingClass = acc.find(
          c => c.class_id === curr.class_id
        );
        
        if (existingClass) {
          existingClass.subjects.push(curr.subject.subject_name);
        } else {
          acc.push({
            class_id: curr.class_id,
            class_name: `Class ${curr.class.class}${curr.class.section ? `-${curr.class.section}` : ''}`,
            subjects: [curr.subject.subject_name],
          });
        }
        return acc;
      }, [])
    : [];

  return (
    <div className="space-y-6 my-12 ml-12 mr-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold ">My Profile</h1>
          <p className="text-gray-500 text-xs">View and manage your profile information</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/teacher/dashboard">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <Link to="/teacher/change-password">
            <Button variant="outline">
              <Lock className="w-4 h-4 mr-2" />
              Change Password
            </Button>
          </Link>
          <Link to="/teacher/edit-profile">
            <Button>
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Teacher Basic Info */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Teacher Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center">
              <User className="w-24 h-24 bg-primary text-accent rounded-full object-cover border-4 border-border p-4"/>
             
              <h3 className="mt-4 text-lg font-semibold">{teacher.name}</h3>
              <Badge variant={teacher.status === "active" ? "default" : "secondary"}>
                {teacher.status}
              </Badge>
              {teacher.employee_code && (
                <p className="text-sm text-muted-foreground mt-1">ID: {teacher.employee_code}</p>
              )}
            </div>

            <div className="space-y-3 text-gray-600">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 " />
                <span className="text-xs break-all">{teacher.email}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 " />
                <span className="text-xs">{teacher.phone || 'N/A'}</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 " />
                <span className="text-xs">
                  {teacher.address ? `${teacher.address}, ${teacher.city}, ${teacher.state}` : 'Address not provided'}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="w-4 h-4 " />
                <span className="text-xs">Born: {formatDate(teacher.dob)}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Briefcase className="w-4 h-4 " />
                <span className="text-xs">Gender: {teacher.gender || 'N/A'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Professional Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Professional Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-md font-medium ">Employee Code</label>
                <p className="text-sm font-semibold text-gray-500">{teacher.employee_code || 'N/A'}</p>
              </div>
              <div>
                <label className="text-md font-medium ">Experience</label>
                <p className="text-sm text-gray-500 font-semibold">{calculateExperience(teacher.created_at)}</p>
              </div>
              <div>
                <label className="text-md font-medium text-muted-foreground">Join Date</label>
                <p className="text-sm text-gray-500 font-semibold">{formatDate(teacher.created_at)}</p>
              </div>
              <div>
                <label className="text-md font-medium text-muted-foreground">Qualification</label>
                <p className="text-sm text-gray-500 font-semibold">{teacher.qualification || 'N/A'}</p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <h4 className="text-md font-semibold mb-4 flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                Subjects Teaching
              </h4>
              {uniqueSubjects.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {uniqueSubjects.map((subject, index) => (
                    <Badge key={index} variant="secondary">
                      {subject.subject_name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No subjects assigned yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Classes & Assignments */}
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Assigned Classes</CardTitle>
          </CardHeader>
          <CardContent>
            {assignedClasses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {assignedClasses.map((classItem, index) => (
                  <div key={index} className="p-4 bg-secondary/20 rounded-lg border border-border">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-sm">{classItem.class_name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {classItem.subjects.length} subject{classItem.subjects.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {classItem.subjects.map((subject: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">No classes assigned yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg ">Summary</CardTitle>
          </CardHeader>
          <CardContent> 
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-primary/10 rounded-lg text-center">
                <p className="text-2xl font-bold text-primary">{assignedClasses.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Classes</p>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-600">{uniqueSubjects.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Subjects</p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-600">{teacher.status === 'active' ? 'Active' : 'Inactive'}</p>
                <p className="text-xs text-muted-foreground mt-1">Status</p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg text-center">
                <p className="text-2xl font-bold text-purple-600">{calculateExperience(teacher.created_at)}</p>
                <p className="text-xs text-muted-foreground mt-1">Experience</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeacherProfile;
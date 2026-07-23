import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  User, Mail, Phone, MapPin, Calendar, BookOpen, Shield, 
  Key, UserCircle, School, Hash, Users, Clock 
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getStudentProfile, 
  updateStudentPassword,
  type StudentProfile 
} from "@/services/studentProfileService";

export default function StudentProfile() {
  const { authUser } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [studentId, setStudentId] = useState<number | null>(null);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  // Get student ID from auth
  useEffect(() => {
    if (authUser?.id) {
      setStudentId(parseInt(authUser.id));
    } else {
      const storedUserId = localStorage.getItem('user_id');
      if (storedUserId) {
        setStudentId(parseInt(storedUserId));
      }
    }
  }, [authUser]);

  // Fetch profile data
  const { data: profileResponse, isLoading, isError } = useQuery({
    queryKey: ['studentProfile', studentId],
    queryFn: () => {
      if (!studentId) throw new Error('Student ID not available');
      return getStudentProfile(studentId);
    },
    enabled: !!studentId,
  });

  const profile: StudentProfile | undefined = profileResponse?.data;

  // Update password mutation
  const passwordMutation = useMutation({
    mutationFn: (data: typeof passwordData) => {
      if (!studentId) throw new Error('Student ID not available');
      return updateStudentPassword(studentId, data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Password updated successfully",
      });
      setPasswordDialogOpen(false);
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
    },
    onError: (error: { message?: string }) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive",
      });
    },
  });

  const handlePasswordUpdate = () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast({
        title: "Error",
        description: "New password and confirm password do not match",
        variant: "destructive",
      });
      return;
    }
    passwordMutation.mutate(passwordData);
  };

  // Get initials for avatar
  const getInitials = (name: string | null) => {
    if (!name) return "ST";
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Loading state
  if (isLoading || !studentId) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96 lg:col-span-2" />
        </div>
      </div>
    );
  }

  // Error state
  if (isError || !profile) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load profile. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-lg font-bold">My Profile</h1>
        <p className="text-gray-500 text-xs">View and manage your profile information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center pb-2">
            <Avatar className="w-24 h-24 mx-auto">
              <AvatarFallback className="text-2xl">
                {getInitials(profile.candidate_name)}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="mt-4 text-lg">
              {profile.candidate_name || profile.username}
            </CardTitle>
            <p className="text-xs text-gray-500">Roll No: {profile.roll_no || 'N/A'}</p>
            <Badge variant={profile.status === 'active' ? 'secondary' : 'destructive'} className="w-fit mx-auto mt-2">
              {profile.status}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <School className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                <p className="text-xs font-semibold">{profile.class || 'N/A'}</p>
                <p className="text-xs text-gray-500">Class</p>
              </div>
              <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <Users className="h-5 w-5 mx-auto mb-1 text-green-600" />
                <p className="text-xs font-semibold">{profile.section || 'N/A'}</p>
                <p className="text-xs text-gray-500">Section</p>
              </div>
            </div>

            {/* Action Buttons */}
            <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full" variant="outline" size="sm">
                  <Key className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                  <DialogDescription>
                    Update your password to keep your account secure
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="current">Current Password</Label>
                    <Input
                      id="current"
                      type="password"
                      value={passwordData.current_password}
                      onChange={(e) => setPasswordData({
                        ...passwordData,
                        current_password: e.target.value
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="new">New Password</Label>
                    <Input
                      id="new"
                      type="password"
                      value={passwordData.new_password}
                      onChange={(e) => setPasswordData({
                        ...passwordData,
                        new_password: e.target.value
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirm">Confirm New Password</Label>
                    <Input
                      id="confirm"
                      type="password"
                      value={passwordData.confirm_password}
                      onChange={(e) => setPasswordData({
                        ...passwordData,
                        confirm_password: e.target.value
                      })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    onClick={handlePasswordUpdate}
                    disabled={passwordMutation.isPending}
                  >
                    {passwordMutation.isPending ? 'Updating...' : 'Update Password'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex text-lg items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <UserCircle className="h-4 w-4 text-gray-500 mt-1" />
                <div>
                  <p className="text-xs font-medium text-gray-500">Full Name</p>
                  <p className="text-sm font-semibold">{profile.candidate_name || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-gray-500 mt-1" />
                <div>
                  <p className="text-xs font-medium text-gray-500">Email</p>
                  <p className="text-sm">{profile.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-gray-500 mt-1" />
                <div>
                  <p className="text-xs font-medium text-gray-500">Phone</p>
                  <p className="text-sm">{profile.phone || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-gray-500 mt-1" />
                <div>
                  <p className="text-xs font-medium text-gray-500">Date of Birth</p>
                  <p className="text-sm">{profile.dob ? new Date(profile.dob).toLocaleDateString() : 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="h-4 w-4 text-gray-500 mt-1" />
                <div>
                  <p className="text-xs font-medium text-gray-500">Gender</p>
                  <p className="text-sm">{profile.gender || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Hash className="h-4 w-4 text-gray-500 mt-1" />
                <div>
                  <p className="text-xs font-medium text-gray-500">Aadhar Number</p>
                  <p className="text-sm">{profile.addhar || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 md:col-span-2">
                <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                <div>
                  <p className="text-xs font-medium text-gray-500">Address</p>
                  <p className="text-sm">{profile.address || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Academic Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex text-lg items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Academic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-500">Class</p>
                <p className="text-sm font-semibold">{profile.class || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Section</p>
                <p className="text-sm font-semibold">{profile.section || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Roll Number</p>
                <p className="text-sm font-semibold">{profile.roll_no || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Admission Date</p>
                <p className="text-sm">{profile.admission_date ? new Date(profile.admission_date).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Status</p>
                <Badge variant={profile.status === 'active' ? 'secondary' : 'destructive'}>
                  {profile.status}
                </Badge>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Joined On</p>
                <p className="text-sm flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(profile.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Parent/Guardian Information */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex text-lg items-center gap-2">
              <Users className="h-5 w-5" />
              Parent/Guardian Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs font-medium text-gray-500">Father's Name</p>
              <p className="text-sm font-semibold">{profile.father_name || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Mother's Name</p>
              <p className="text-sm font-semibold">{profile.mother_name || 'Not provided'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

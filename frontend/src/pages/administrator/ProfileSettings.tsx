import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { API_BASE_URL } from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/useAuthStore';
import Heading from '@/components/common/Heading';
import { User, Mail, Phone, Lock, Save, Loader2 } from 'lucide-react';

interface ProfileFormData {
  full_name: string;
  username: string;
  email: string;
  phone: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface PersonalInfoFormData {
  full_name: string;
  username: string;
  email: string;
  phone: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ProfileSettings() {
  const { toast } = useToast();
  const { authUser } = useAuthStore();
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);
  
  // Form for personal information
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm<PersonalInfoFormData>({
    defaultValues: {
      full_name: '',
      username: '',
      email: '',
      phone: '',
    },
  });

  // Form for password change
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordFormData>({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Update profile form values when authUser data is available or changes
  useEffect(() => {
    if (authUser) {
      resetProfile({
        full_name: authUser?.full_name || '',
        username: authUser?.username || '',
        email: authUser?.email || '',
        phone: authUser?.phone || '',
      });
    }
  }, [authUser, resetProfile]);

  // Helper function to get API base path based on role
  const getApiBasePath = () => {
    const role = authUser?.role;
    const roleMap: Record<string, string> = {
      'administrator': 'administrator',
      'librarian': 'librarian',
      // Add more roles as needed
    };
    
    return roleMap[role || ''] || 'administrator'; // Default to administrator
  };

  // Handler for personal information update
  const onSubmitProfile = async (data: PersonalInfoFormData) => {
    try {
      setIsLoadingProfile(true);

      const updateData = {
        full_name: data.full_name,
        username: data.username,
        email: data.email,
        phone: data.phone,
      };

      const token = localStorage.getItem('token');
      const apiBasePath = getApiBasePath();

      const response = await fetch(`${API_BASE_URL}/${apiBasePath}/profile/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (response.ok && result.status) {
        toast({
          title: 'Success',
          description: 'Profile updated successfully',
        });
        
        // Update auth store with the updated user data from response
        if (result.data) {
          const responseData = result.data;
          const updatedUser = {
            ...authUser,
            full_name: responseData.full_name || data.full_name || authUser?.full_name,
            username: responseData.username || data.username || authUser?.username,
            email: responseData.email || data.email || authUser?.email,
            phone: responseData.phone || data.phone || authUser?.phone,
          };
          useAuthStore.setState({ authUser: updatedUser });
          
          // Reset form with updated values
          resetProfile({
            full_name: updatedUser.full_name || '',
            username: updatedUser.username || '',
            email: updatedUser.email || '',
            phone: updatedUser.phone || '',
          });
        } else {
          // Fallback: refresh auth user from API
          const { getUser } = useAuthStore.getState();
          if (getUser) {
            await getUser();
          }
        }
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.message || 'Failed to update profile',
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update profile',
      });
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // Handler for password change
  const onSubmitPassword = async (data: PasswordFormData) => {
    try {
      setIsLoadingPassword(true);

      // Validate passwords match
      if (data.newPassword !== data.confirmPassword) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'New passwords do not match',
        });
        setIsLoadingPassword(false);
        return;
      }

      const passwordData = {
        current_password: data.currentPassword,
        new_password: data.newPassword,
        new_password_confirmation: data.confirmPassword,
      };

      const token = localStorage.getItem('token');
      const apiBasePath = getApiBasePath();
      
      const passwordResponse = await fetch(`${API_BASE_URL}/${apiBasePath}/profile/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(passwordData),
      });

      const passwordResult = await passwordResponse.json();

      if (passwordResponse.ok && passwordResult.status) {
        toast({
          title: 'Success',
          description: 'Password updated successfully',
        });
        resetPassword({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: passwordResult.message || 'Failed to update password',
        });
      }
    } catch (error) {
      console.error('Error updating password:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update password',
      });
    } finally {
      setIsLoadingPassword(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in w-full min-w-0">
      <Heading
        title="Profile Settings"
        description="Manage your personal information and account settings"
      />

      {/* Current Profile Information - Read Only */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <User className="w-5 h-5 text-primary" />
            Your Profile Information
          </CardTitle>
          <CardDescription>
            Current profile details - displayed to all users who want to contact you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-sm font-semibold text-foreground">Full Name</Label>
              <div className="flex items-center gap-2 text-foreground">
                <User className="w-4 h-4 text-muted-foreground" />
                <p className="text-base">{authUser?.full_name || 'Not set'}</p>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold text-foreground">Username</Label>
              <div className="flex items-center gap-2 text-foreground">
                <User className="w-4 h-4 text-muted-foreground" />
                <p className="text-base">{authUser?.username || 'Not set'}</p>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </Label>
              <p className="text-base text-foreground">{authUser?.email || 'Not set'}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone Number
              </Label>
              <p className="text-base text-foreground">{authUser?.phone || 'Not set'}</p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
            <p className="text-sm text-foreground">
              <strong>Note:</strong> Update your contact information below to ensure principals and other users can reach you easily. 
              This information will be visible to users who need to contact you.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Update Personal Information
            </CardTitle>
            <CardDescription>
              Update your profile information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name
                </Label>
                <Input
                  id="full_name"
                  {...registerProfile('full_name', {
                    required: 'Full name is required',
                  })}
                  placeholder="Enter your full name"
                />
                {profileErrors.full_name && (
                  <p className="text-sm text-destructive">{profileErrors.full_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  {...registerProfile('username', {
                    required: 'Username is required',
                  })}
                  placeholder="Enter username"
                />
                {profileErrors.username && (
                  <p className="text-sm text-destructive">{profileErrors.username.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...registerProfile('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  placeholder="Enter email"
                />
                {profileErrors.email && (
                  <p className="text-sm text-destructive">{profileErrors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone
                </Label>
                <Input
                  id="phone"
                  {...registerProfile('phone')}
                  placeholder="Enter phone number"
                />
                {profileErrors.phone && (
                  <p className="text-sm text-destructive">{profileErrors.phone.message}</p>
                )}
              </div>

              <Button type="submit" disabled={isLoadingProfile} className="w-full">
                {isLoadingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Change Password
            </CardTitle>
            <CardDescription>
              Update your account password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  {...registerPassword('currentPassword', {
                    required: 'Current password is required',
                  })}
                  placeholder="Enter current password"
                />
                {passwordErrors.currentPassword && (
                  <p className="text-sm text-destructive">{passwordErrors.currentPassword.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  {...registerPassword('newPassword', {
                    required: 'New password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters',
                    },
                  })}
                  placeholder="Enter new password"
                />
                {passwordErrors.newPassword && (
                  <p className="text-sm text-destructive">{passwordErrors.newPassword.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...registerPassword('confirmPassword', {
                    required: 'Please confirm your new password',
                  })}
                  placeholder="Confirm new password"
                />
                {passwordErrors.confirmPassword && (
                  <p className="text-sm text-destructive">{passwordErrors.confirmPassword.message}</p>
                )}
              </div>

              <div className="bg-muted border border-border rounded-lg p-3">
                <p className="text-sm text-foreground">
                  <strong>Note:</strong> All password fields are required to change your password.
                </p>
              </div>

              <Button type="submit" disabled={isLoadingPassword} className="w-full">
                {isLoadingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Lock className="mr-2 h-4 w-4" />
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


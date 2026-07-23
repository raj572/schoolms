import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Lock, Eye, EyeOff } from "lucide-react";
import { useAuthStore } from '@/store/useAuthStore';
import { updateTeacherPassword } from '@/services/teacherApiService';
import { useToast } from '@/hooks/use-toast';

const ChangePassword = () => {
  const { authUser } = useAuthStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });
  const [errors, setErrors] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    setErrors(prev => ({
      ...prev,
      [field]: ''
    }));
  };

  const validateForm = () => {
    const newErrors = {
      current_password: '',
      new_password: '',
      new_password_confirmation: '',
    };
    let isValid = true;

    if (!formData.current_password) {
      newErrors.current_password = 'Current password is required';
      isValid = false;
    }

    if (!formData.new_password) {
      newErrors.new_password = 'New password is required';
      isValid = false;
    } else if (formData.new_password.length < 8) {
      newErrors.new_password = 'Password must be at least 8 characters';
      isValid = false;
    }

    if (!formData.new_password_confirmation) {
      newErrors.new_password_confirmation = 'Please confirm your password';
      isValid = false;
    } else if (formData.new_password !== formData.new_password_confirmation) {
      newErrors.new_password_confirmation = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (!authUser?.id) return;

    try {
      setIsSaving(true);
      const teacherId = parseInt(authUser.id);
      
      const response = await updateTeacherPassword(teacherId, formData);
      
      if (response.status) {
        toast({
          title: 'Success',
          description: 'Password changed successfully',
        });
        navigate('/teacher/my-profile');
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: response.message || 'Failed to change password',
        });
      }
    } catch (error: any) {
      console.error('Error changing password:', error);
      const errorMessage = error.response?.data?.message || 'Failed to change password. Please try again.';
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 my-12 ml-12 mr-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">Change Password</h1>
          <p className="text-gray-500 text-xs mt-1">Update your account password</p>
        </div>
        <Link to="/teacher/my-profile">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Button>
        </Link>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Password Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="current_password">Current Password *</Label>
                <div className="relative">
                  <Input
                    id="current_password"
                    type={showCurrentPassword ? "text" : "password"}
                    value={formData.current_password}
                    onChange={(e) => handleChange('current_password', e.target.value)}
                    placeholder="Enter current password"
                    className={errors.current_password ? 'border-red-500' : ''}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {errors.current_password && (
                  <p className="text-sm text-red-500">{errors.current_password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="new_password">New Password *</Label>
                <div className="relative">
                  <Input
                    id="new_password"
                    type={showNewPassword ? "text" : "password"}
                    value={formData.new_password}
                    onChange={(e) => handleChange('new_password', e.target.value)}
                    placeholder="Enter new password (min 8 characters)"
                    className={errors.new_password ? 'border-red-500' : ''}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {errors.new_password && (
                  <p className="text-sm text-red-500">{errors.new_password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="new_password_confirmation">Confirm New Password *</Label>
                <div className="relative">
                  <Input
                    id="new_password_confirmation"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.new_password_confirmation}
                    onChange={(e) => handleChange('new_password_confirmation', e.target.value)}
                    placeholder="Re-enter new password"
                    className={errors.new_password_confirmation ? 'border-red-500' : ''}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {errors.new_password_confirmation && (
                  <p className="text-sm text-red-500">{errors.new_password_confirmation}</p>
                )}
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">Password Requirements:</h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Minimum 8 characters long</li>
                  <li>• Use a combination of letters, numbers, and symbols</li>
                  <li>• Don't use easily guessable passwords</li>
                </ul>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <Link to="/teacher/my-profile">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Changing...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Change Password
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;


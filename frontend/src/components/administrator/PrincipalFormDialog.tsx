import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Principal,
  PrincipalFormData,
  createPrincipal,
  updatePrincipal,
  getAllSchools,
  School,
} from '@/services/administratorApiService';

interface PrincipalFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  principal: Principal | null;
  onSuccess: () => void;
}

export default function PrincipalFormDialog({
  open,
  onOpenChange,
  principal,
  onSuccess,
}: PrincipalFormDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);
  const [formData, setFormData] = useState<PrincipalFormData>({
    full_name: '',
    email: '',
    phone: '',
    username: '',
    school_id: null,
    status: 'active',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof PrincipalFormData, string>>>({});

  useEffect(() => {
    if (open) {
      fetchSchools();
      if (principal) {
        // Editing existing principal
        setFormData({
          full_name: principal.full_name,
          email: principal.email,
          phone: principal.phone,
          username: principal.username,
          school_id: principal.school_id || null,
          status: principal.status,
        });
      } else {
        // Creating new principal
        resetForm();
      }
    }
  }, [open, principal]);

  const fetchSchools = async () => {
    try {
      console.log('Fetching schools...');
      const response = await getAllSchools({});
      console.log('Schools API Response:', response);
      console.log('Response status:', response?.status);
      console.log('Response data:', response?.data);
      console.log('Response data type:', typeof response?.data);
      console.log('Is response.data an array?', Array.isArray(response?.data));
      
      // Handle backend response format: { status: true, data: [...], message: '...', error: null }
      if (response && response.status && response.data) {
        const schoolsList = Array.isArray(response.data) ? response.data : [];
        console.log('Parsed Schools List:', schoolsList);
        console.log('Number of schools:', schoolsList.length);
        console.log('First school (if any):', schoolsList[0]);
        setSchools(schoolsList);
        
        if (schoolsList.length === 0) {
          console.warn('No schools found for this administrator');
          toast({
            title: 'No Schools Found',
            description: 'You have not registered any schools yet. Please add schools first from the Schools page.',
          });
        }
      } else {
        console.warn('Invalid response format:', response);
        console.warn('Expected: { status: true, data: [...] }');
        setSchools([]);
        toast({
          variant: 'destructive',
          title: 'Warning',
          description: 'Could not load schools. Please try again or contact support.',
        });
      }
    } catch (error: any) {
      console.error('Error fetching schools:', error);
      console.error('Error response:', error.response);
      console.error('Error details:', error.response?.data);
      toast({
        variant: 'destructive',
        title: 'Error Loading Schools',
        description: error.response?.data?.message || 'Failed to fetch schools. Please check your connection and try again.',
      });
      setSchools([]);
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      username: '',
      school_id: null,
      status: 'active',
    });
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof PrincipalFormData, string>> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      let response;
      
      if (principal) {
        // Update existing principal
        response = await updatePrincipal(principal.id, formData);
      } else {
        // Create new principal
        response = await createPrincipal(formData);
      }

      // Check if response is successful
      if (response.status === true || response.success === true || response.status === 'success') {
        toast({
          title: 'Success',
          description: principal 
            ? 'Principal updated successfully' 
            : 'Principal created successfully and credentials sent to email',
        });
        onSuccess();
        onOpenChange(false);
        resetForm();
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: response.message || `Failed to ${principal ? 'update' : 'create'} principal`,
        });
      }
    } catch (error: any) {
      console.error('Error submitting principal form:', error);
      
      // Handle validation errors from backend
      if (error.response?.data?.errors) {
        const backendErrors: Partial<Record<keyof PrincipalFormData, string>> = {};
        Object.keys(error.response.data.errors).forEach((key) => {
          backendErrors[key as keyof PrincipalFormData] = error.response.data.errors[key][0];
        });
        setErrors(backendErrors);
      }
      
      // Only show error toast if it's an actual error (status >= 400)
      if (error.response?.status >= 400) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.response?.data?.message || `Failed to ${principal ? 'update' : 'create'} principal`,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof PrincipalFormData, value: string | number | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {principal ? 'Edit Principal' : 'Add New Principal'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="full_name">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => handleChange('full_name', e.target.value)}
              placeholder="Enter principal's full name"
              className={errors.full_name ? 'border-destructive' : ''}
            />
            {errors.full_name && (
              <p className="text-sm text-destructive">{errors.full_name}</p>
            )}
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username">
              Username <span className="text-destructive">*</span>
            </Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => handleChange('username', e.target.value)}
              placeholder="Enter username"
              className={errors.username ? 'border-destructive' : ''}
            />
            {errors.username && (
              <p className="text-sm text-destructive">{errors.username}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Username will be used for login
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="principal@school.com"
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
              {!principal && (
                <p className="text-xs text-muted-foreground">
                  Credentials will be sent to this email
                </p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">
                Phone <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+1234567890"
                className={errors.phone ? 'border-destructive' : ''}
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* School Assignment */}
            <div className="space-y-2">
              <Label htmlFor="school_id">Assign to School</Label>
              <Select
                value={formData.school_id?.toString() || 'none'}
                onValueChange={(value) => 
                  handleChange('school_id', value === 'none' ? null : parseInt(value))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a school (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not Assigned</SelectItem>
                  {schools.length === 0 ? (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      No schools available
                    </div>
                  ) : (
                    schools
                      .filter(school => school.status === 'active')
                      .map((school) => (
                        <SelectItem key={school.id} value={school.id.toString()}>
                          {school.name} ({school.school_code})
                        </SelectItem>
                      ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {schools.length === 0 
                  ? 'Loading schools...' 
                  : `${schools.filter(s => s.status === 'active').length} active school(s) available`
                }
              </p>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Info Message */}
          {!principal && (
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>Note:</strong> A secure password will be automatically generated and sent to the principal's email address along with their login credentials.
              </p>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                resetForm();
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {principal ? 'Update Principal' : 'Create Principal'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { School, SchoolFormData } from '@/services/administratorApiService';
import { Loader2 } from 'lucide-react';

interface SchoolFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  school?: School | null;
  onSuccess: () => void;
}

export default function SchoolFormDialog({
  open,
  onOpenChange,
  school,
  onSuccess,
}: SchoolFormDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SchoolFormData>({
    defaultValues: {
      status: 'active',
      country: 'India',
    },
  });

  const statusValue = watch('status');

  useEffect(() => {
    if (school) {
      // Populate form with school data for editing
      const formData: Partial<SchoolFormData> = {
        name: school.name,
        email: school.email,
        phone: school.phone,
        address: school.address,
        city: school.city,
        state: school.state,
        country: school.country,
        pincode: school.pincode,
        principal_name: school.principal_name || '',
        principal_phone: school.principal_phone || '',
        principal_email: school.principal_email || '',
        affiliation_number: school.affiliation_number || '',
        board: school.board || '',
        website: school.website || '',
        description: school.description || '',
        established_date: school.established_date || '',
        school_code: school.school_code || '',
        status: school.status,
      };
      
      Object.keys(formData).forEach((key) => {
        const value = formData[key as keyof SchoolFormData];
        if (value !== undefined) {
          setValue(key as keyof SchoolFormData, value);
        }
      });
    } else {
      // Reset form for new school
      reset({
        status: 'active',
        country: 'India',
      });
    }
  }, [school, reset, setValue]);

  const onSubmit = async (data: SchoolFormData) => {
    setIsLoading(true);
    try {
      const { createSchool, updateSchool } = await import('@/services/administratorApiService');
      
      let response;
      if (school) {
        response = await updateSchool(school.id, data);
      } else {
        response = await createSchool(data);
      }

      if (response.status) {
        toast({
          title: 'Success',
          description: school
            ? 'School updated successfully'
            : 'School created successfully',
        });
        onSuccess();
        onOpenChange(false);
        reset();
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: response.message || 'Failed to save school',
        });
      }
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err?.response?.data?.message || 'Failed to save school',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{school ? 'Edit School' : 'Add New School'}</DialogTitle>
          <DialogDescription>
            {school
              ? 'Update school information below'
              : 'Fill in the details to register a new school'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  School Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  {...register('name', { required: 'School name is required' })}
                  placeholder="Enter school name"
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="school_code">School Code</Label>
                <Input
                  id="school_code"
                  {...register('school_code')}
                  placeholder="Auto-generated if left empty"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  placeholder="school@example.com"
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  Phone <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  {...register('phone', { required: 'Phone is required' })}
                  placeholder="+91 98765 43210"
                />
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="board">Board</Label>
                <Input
                  id="board"
                  {...register('board')}
                  placeholder="CBSE, ICSE, State Board, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="affiliation_number">Affiliation Number</Label>
                <Input
                  id="affiliation_number"
                  {...register('affiliation_number')}
                  placeholder="School affiliation number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="established_date">Established Date</Label>
                <Input
                  id="established_date"
                  type="date"
                  {...register('established_date')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={statusValue}
                  onValueChange={(value) => setValue('status', value as 'active' | 'inactive')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                {...register('website')}
                placeholder="https://www.school.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Brief description about the school"
                rows={3}
              />
            </div>
          </div>

          {/* Principal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Principal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="principal_name">Principal Name</Label>
                <Input
                  id="principal_name"
                  {...register('principal_name')}
                  placeholder="Dr. John Doe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="principal_phone">Principal Phone</Label>
                <Input
                  id="principal_phone"
                  {...register('principal_phone')}
                  placeholder="+91 98765 43210"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="principal_email">Principal Email</Label>
                <Input
                  id="principal_email"
                  type="email"
                  {...register('principal_email')}
                  placeholder="principal@school.com"
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Address Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="address">
                Address <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="address"
                {...register('address', { required: 'Address is required' })}
                placeholder="Street address"
                rows={2}
              />
              {errors.address && (
                <p className="text-sm text-red-500">{errors.address.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">
                  City <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="city"
                  {...register('city', { required: 'City is required' })}
                  placeholder="Mumbai"
                />
                {errors.city && (
                  <p className="text-sm text-red-500">{errors.city.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">
                  State <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="state"
                  {...register('state', { required: 'State is required' })}
                  placeholder="Maharashtra"
                />
                {errors.state && (
                  <p className="text-sm text-red-500">{errors.state.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="pincode">
                  Pincode <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="pincode"
                  {...register('pincode', { required: 'Pincode is required' })}
                  placeholder="400001"
                />
                {errors.pincode && (
                  <p className="text-sm text-red-500">{errors.pincode.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">
                  Country <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="country"
                  {...register('country', { required: 'Country is required' })}
                  placeholder="India"
                />
                {errors.country && (
                  <p className="text-sm text-red-500">{errors.country.message}</p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {school ? 'Update School' : 'Create School'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


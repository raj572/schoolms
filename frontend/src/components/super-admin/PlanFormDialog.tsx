import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
  createSubscriptionPlan,
  updateSubscriptionPlan,
} from '@/services/superAdminApiService';
import { Loader2 } from 'lucide-react';

interface Plan {
  id: number;
  name: string;
  description: string;
  price: number;
  monthly_price?: number;
  annual_price?: number;
  duration_days: number;
  features: string[];
  is_active: boolean;
  max_users: number | null;
  max_students: number | null;
  is_trial: boolean;
  trial_days?: number;
}

interface PlanFormData {
  name: string;
  code: string;
  description: string;
  price: number;
  monthly_price: number;
  annual_price: number;
  duration_days: number;
  currency: string;
  features: string;
  is_active: boolean;
  max_users: number | null;
  max_students: number | null;
  max_teachers: number | null;
  max_staff: number | null;
  max_classes: number | null;
  max_trial_days: number | null;
  is_trial: boolean;
  trial_days: number;
  is_popular: boolean;
  sort_order: number;
}

interface PlanFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: Plan | null;
  onSuccess: () => void;
}

export default function PlanFormDialog({
  open,
  onOpenChange,
  plan,
  onSuccess,
}: PlanFormDialogProps) {
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PlanFormData>({
    defaultValues: {
      name: '',
      code: '',
      description: '',
      price: 0,
      monthly_price: 0,
      annual_price: 0,
      duration_days: 365,
      currency: 'INR',
      features: '',
      is_active: true,
      max_users: null,
      max_students: null,
      max_teachers: null,
      max_staff: null,
      max_classes: null,
      max_trial_days: null,
      is_trial: false,
      trial_days: 0,
      is_popular: false,
      sort_order: 0,
    },
  });

  const isActive = watch('is_active');
  const isTrial = watch('is_trial');
  const trialDays = watch('trial_days');
  const isPopular = watch('is_popular');
  const sortOrder = watch('sort_order');

  useEffect(() => {
    if (plan) {
      reset({
        name: plan.name || '',
        code: (plan as any).code || '',
        description: plan.description || '',
        price: plan.price || 0,
        monthly_price: plan.monthly_price || plan.price || 0,
        annual_price: (plan as any).annual_price || plan.price * 12 || 0,
        duration_days: plan.duration_days || 365,
        currency: (plan as any).currency || 'INR',
        features: Array.isArray(plan.features) ? plan.features.join('\n') : '',
        is_active: plan.is_active !== undefined ? plan.is_active : true,
        max_users: plan.max_users || null,
        max_students: plan.max_students || null,
        max_teachers: (plan as any).max_teachers || null,
        max_staff: (plan as any).max_staff || null,
        max_classes: (plan as any).max_classes || null,
        max_trial_days: (plan as any).max_trial_days || null,
        is_trial: plan.is_trial !== undefined ? plan.is_trial : false,
        trial_days: plan.trial_days || 0,
        is_popular: (plan as any).is_popular || false,
        sort_order: (plan as any).sort_order || 0,
      });
    } else {
      reset({
        name: '',
        code: '',
        description: '',
        price: 0,
        monthly_price: 0,
        annual_price: 0,
        duration_days: 365,
        currency: 'INR',
        features: '',
        is_active: true,
        max_users: null,
        max_students: null,
        max_teachers: null,
        max_staff: null,
        max_classes: null,
        max_trial_days: null,
        is_trial: false,
        trial_days: 0,
        is_popular: false,
        sort_order: 0,
      });
    }
  }, [plan, reset, open]);

  const onSubmit = async (data: PlanFormData) => {
    console.log('Form submitted with data:', data);
    
    try {
      // Convert features string to array
      const featuresArray = data.features
        .split('\n')
        .map((f) => f.trim())
        .filter((f) => f.length > 0);

      // Ensure price is set to monthly_price (backend requirement)
      const monthlyPrice = data.monthly_price || 1;

      // Build payload - only include non-empty values
      const payload: any = {
        name: data.name,
        description: data.description,
        monthly_price: monthlyPrice,
        duration_days: data.duration_days,
        currency: data.currency || 'INR',
        features: featuresArray,
        is_active: data.is_active,
        is_trial: data.is_trial,
        is_popular: data.is_popular,
        sort_order: data.sort_order || 0,
      };

      // Only include code if it's not empty
      if (data.code && data.code.trim() !== '') {
        payload.code = data.code.trim();
      }

      // Only include annual_price if provided
      if (data.annual_price && data.annual_price > 0) {
        payload.annual_price = data.annual_price;
      }

      // Only include trial_days if is_trial is true
      if (data.is_trial && data.trial_days) {
        payload.trial_days = data.trial_days;
      }

      // Include optional limit fields only if they have values
      if (data.max_users) payload.max_users = data.max_users;
      if (data.max_students) payload.max_students = data.max_students;
      if (data.max_teachers) payload.max_teachers = data.max_teachers;
      if (data.max_staff) payload.max_staff = data.max_staff;
      if (data.max_classes) payload.max_classes = data.max_classes;
      if (data.max_trial_days) payload.max_trial_days = data.max_trial_days;

      console.log('Payload being sent:', payload);

      const response = plan
        ? await updateSubscriptionPlan(plan.id, payload)
        : await createSubscriptionPlan(payload);

      console.log('Response received:', response);

      if (response.status) {
        toast({
          title: 'Success',
          description: plan
            ? 'Plan updated successfully'
            : 'Plan created successfully',
        });
        onSuccess();
      } else {
        throw new Error(response.message || 'Failed to save plan');
      }
    } catch (error) {
      console.error('Error saving plan:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save plan',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {plan ? 'Edit Subscription Plan' : 'Create New Subscription Plan'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">
                Plan Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                {...register('name', { required: 'Plan name is required' })}
                placeholder="e.g., Professional Plan"
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="code">
                Plan Code (Optional)
              </Label>
              <Input
                id="code"
                {...register('code', { 
                  pattern: {
                    value: /^[A-Z0-9_]+$/,
                    message: 'Code must be uppercase letters, numbers, and underscores only'
                  }
                })}
                placeholder="e.g., STANDARD"
                style={{ textTransform: 'uppercase' }}
              />
              <p className="text-xs text-gray-500 mt-1">Unique identifier (UPPERCASE only)</p>
              {errors.code && (
                <p className="text-sm text-red-600 mt-1">{errors.code.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                {...register('description', { required: 'Description is required' })}
                placeholder="Describe what this plan offers..."
                rows={3}
              />
              {errors.description && (
                <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="currency">
                Currency
              </Label>
              <Input
                id="currency"
                {...register('currency')}
                placeholder="INR"
              />
              <p className="text-xs text-gray-500 mt-1">Default: INR</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="monthly_price">
                  Monthly Price (₹) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="monthly_price"
                  type="number"
                  step="0.01"
                  {...register('monthly_price', {
                    required: 'Monthly price is required',
                    min: { value: 1, message: 'Price must be at least ₹1' },
                  })}
                  placeholder="0.00"
                />
                <p className="text-xs text-gray-500 mt-1">Price per month</p>
                {errors.monthly_price && (
                  <p className="text-sm text-red-600 mt-1">{errors.monthly_price.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="annual_price">
                  Annual Price (₹) 
                </Label>
                <Input
                  id="annual_price"
                  type="number"
                  step="0.01"
                  {...register('annual_price', {
                    min: { value: 1, message: 'Price must be at least ₹1' },
                  })}
                  placeholder="0.00"
                />
                <p className="text-xs text-gray-500 mt-1">Optional: Price per year (discounted)</p>
                {errors.annual_price && (
                  <p className="text-sm text-red-600 mt-1">{errors.annual_price.message}</p>
                )}
              </div>
            </div>

            {/* Legacy price field - hidden but required - Set to monthly_price */}
            <input
              type="hidden"
              {...register('price')}
              value={watch('monthly_price') || watch('price') || 1}
            />

            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="duration_days">
                  Duration (days) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="duration_days"
                  type="number"
                  {...register('duration_days', {
                    required: 'Duration is required',
                    min: { value: 1, message: 'Duration must be at least 1 day' },
                  })}
                  placeholder="365"
                />
                {errors.duration_days && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.duration_days.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="max_students">Max Students</Label>
                <Input
                  id="max_students"
                  type="number"
                  {...register('max_students', {
                    setValueAs: (v) => (v === '' || v === null ? null : parseInt(v)),
                  })}
                  placeholder="Leave blank for unlimited"
                />
              </div>

              <div>
                <Label htmlFor="max_teachers">Max Teachers</Label>
                <Input
                  id="max_teachers"
                  type="number"
                  {...register('max_teachers', {
                    setValueAs: (v) => (v === '' || v === null ? null : parseInt(v)),
                  })}
                  placeholder="Leave blank for unlimited"
                />
              </div>

              <div>
                <Label htmlFor="max_users">Max Users</Label>
                <Input
                  id="max_users"
                  type="number"
                  {...register('max_users', {
                    setValueAs: (v) => (v === '' || v === null ? null : parseInt(v)),
                  })}
                  placeholder="Leave blank for unlimited"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="max_staff">Max Staff</Label>
                <Input
                  id="max_staff"
                  type="number"
                  {...register('max_staff', {
                    setValueAs: (v) => (v === '' || v === null ? null : parseInt(v)),
                  })}
                  placeholder="Leave blank for unlimited"
                />
              </div>

              <div>
                <Label htmlFor="max_classes">Max Classes</Label>
                <Input
                  id="max_classes"
                  type="number"
                  {...register('max_classes', {
                    setValueAs: (v) => (v === '' || v === null ? null : parseInt(v)),
                  })}
                  placeholder="Leave blank for unlimited"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="max_trial_days">Max Trial Days</Label>
              <Input
                id="max_trial_days"
                type="number"
                {...register('max_trial_days', {
                  setValueAs: (v) => (v === '' || v === null ? null : parseInt(v)),
                  min: { value: 1, message: 'Must be at least 1' },
                  max: { value: 365, message: 'Cannot exceed 365 days' },
                })}
                placeholder="Maximum trial period allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Maximum number of trial days this plan supports</p>
              {errors.max_trial_days && (
                <p className="text-sm text-red-600 mt-1">{errors.max_trial_days.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="features">
                Features <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="features"
                {...register('features', { required: 'At least one feature is required' })}
                placeholder="Enter one feature per line&#10;e.g., Student Management&#10;Attendance Tracking&#10;Grade Management"
                rows={6}
              />
              <p className="text-xs text-gray-500 mt-1">Enter one feature per line</p>
              {errors.features && (
                <p className="text-sm text-red-600 mt-1">{errors.features.message}</p>
              )}
            </div>

            <div className="space-y-4 pt-4 border-t">
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={isActive}
                    onCheckedChange={(checked) => setValue('is_active', checked)}
                  />
                  <Label htmlFor="is_active" className="cursor-pointer">
                    Active Plan
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_trial"
                    checked={isTrial}
                    onCheckedChange={(checked) => setValue('is_trial', checked)}
                  />
                  <Label htmlFor="is_trial" className="cursor-pointer">
                    Trial Plan
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_popular"
                    checked={isPopular}
                    onCheckedChange={(checked) => setValue('is_popular', checked)}
                  />
                  <Label htmlFor="is_popular" className="cursor-pointer">
                    Popular Plan
                  </Label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sort_order">Sort Order</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    {...register('sort_order', {
                      setValueAs: (v) => (v === '' || v === null || v === undefined ? 0 : parseInt(v)),
                      min: { value: 0, message: 'Must be 0 or greater' },
                    })}
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">Lower numbers appear first (0 = top)</p>
                  {errors.sort_order && (
                    <p className="text-sm text-red-600 mt-1">{errors.sort_order.message}</p>
                  )}
                </div>
              </div>

              {/* Trial Days - Only show if is_trial is enabled */}
              {isTrial && (
                <div>
                  <Label htmlFor="trial_days">
                    Trial Period (Days) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="trial_days"
                    type="number"
                    {...register('trial_days', {
                      required: isTrial ? 'Trial days are required for trial plans' : false,
                      min: { value: 1, message: 'Trial days must be at least 1' },
                      max: { value: 30, message: 'Trial days cannot exceed 30' },
                    })}
                    placeholder="Enter trial days (1-30)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Number of days schools can use this plan for free during trial period
                  </p>
                  {errors.trial_days && (
                    <p className="text-sm text-red-600 mt-1">{errors.trial_days.message}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => console.log('Submit button clicked', { errors, isSubmitting })}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {plan ? 'Update Plan' : 'Create Plan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


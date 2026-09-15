import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/lib/axios';
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
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  assignSubscription,
  getSubscriptionPlans,
  SubscriptionAssignment,
} from '@/services/administratorApiService';
import { Loader2, CreditCard, Calendar, Package, TrendingUp, Check, Users } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import SubscriptionPaymentButton from './SubscriptionPaymentButton';

interface SubscriptionAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schoolId: number;
  schoolName: string;
  onSuccess: () => void;
}

interface SubscriptionPlan {
  id: number;
  name: string;
  code: string;
  description: string;
  price: string | number;  // Base/default price
  monthly_price?: string | number;  // Monthly subscription price
  annual_price?: string | number;  // Annual subscription price
  duration_days: number;
  currency: string;
  features: string[] | string;
  is_active: boolean;
  max_students: number | null;
  max_users: number | null;
  is_trial: boolean;
  trial_days?: number;  // Number of trial days for the plan
}

interface ActiveSubscription {
  id: number;
  status: string;
  end_date: string;
  plan: SubscriptionPlan;
}

export default function SubscriptionAssignmentDialog({
  open,
  onOpenChange,
  schoolId,
  schoolName,
  onSuccess,
}: SubscriptionAssignmentDialogProps) {
  const { toast } = useToast();
  const { authUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const [activeSubscription, setActiveSubscription] = useState<ActiveSubscription | null>(null);
  const [showRenewalWarning, setShowRenewalWarning] = useState(false);
  const [paymentMode, setPaymentMode] = useState<'online' | 'manual'>('online');
  const [manualMethod, setManualMethod] = useState<string>('cash');
  const [manualReference, setManualReference] = useState<string>('');

  const handleManualActivation = async () => {
    if (!selectedPlan) return;
    setIsLoading(true);
    try {
      const userId = authUser?.id || Number(localStorage.getItem('userId')) || 1;
      const planCode = selectedPlan.code || `PLAN_${selectedPlan.id}`;
      const payload = {
        school_id: schoolId,
        plan_code: planCode,
        subscription_plan_id: selectedPlan.id,
        billing_cycle: billingCycle,
        trial_days: 0,
        user_id: userId,
        payment_method: manualMethod,
        reference: manualReference || 'Manual Entry',
        is_manual: true,
      };
      const response = await assignSubscription(payload as any);
      if (response.status) {
        toast({
          title: 'Subscription Activated',
          description: response.message || 'Manual payment recorded and subscription activated successfully!',
        });
        onSuccess();
        onOpenChange(false);
      } else {
        toast({
          variant: 'destructive',
          title: 'Activation Failed',
          description: response.message || 'Failed to activate manual subscription',
        });
      }
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err?.message || 'Manual subscription activation failed',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<SubscriptionAssignment>({
    mode: 'onChange',
    defaultValues: {
      plan_code: '',
      billing_cycle: 'monthly',
      trial_days: 14,
      school_id: schoolId,
      user_id: 0, // will be set from localStorage
    }
  });

  const billingCycle = watch('billing_cycle');
  const trialDays = watch('trial_days');
  const planCode = watch('plan_code');

  useEffect(() => {
    if (open) {
      console.log('=== Dialog opened ===');
      console.log('School ID:', schoolId);
      console.log('School Name:', schoolName);
      console.log('Auth User:', authUser);
      
      // Get user_id from authUser or localStorage (for super_admin)
      let userId = 0;
      if (authUser?.id) {
        userId = parseInt(authUser.id);
        console.log('User ID from authUser:', userId);
      } else {
        // Fallback to localStorage for super_admin
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            userId = parseInt(user.id);
            console.log('User ID from localStorage:', userId);
          } catch (e) {
            console.error('Error parsing user from localStorage:', e);
          }
        }
      }
      
      if (userId === 0) {
        console.error('WARNING: No valid user_id found');
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'User not found. Please login again.',
        });
        return;
      }
      
      // Reset form with all default values including user_id and school_id
      // Default trial_days = 0 means payment is required (no trial)
      reset({
        plan_code: '',
        billing_cycle: 'monthly',
        trial_days: 0,
        school_id: schoolId,
        user_id: userId,
      });
      console.log('Form reset with values:', { 
        school_id: schoolId, 
        user_id: userId,
        billing_cycle: 'monthly',
        trial_days: 0
      });
      
      fetchPlans();
      checkActiveSubscription();
    } else {
      // Clear selected plan when dialog closes
      setSelectedPlan(null);
      setActiveSubscription(null);
      setShowRenewalWarning(false);
    }
  }, [open, schoolId, schoolName, authUser, reset, toast]);

  const fetchPlans = async () => {
    try {
      console.log('Fetching subscription plans...');
      const response = await getSubscriptionPlans();
      console.log('Plans response:', response);
      
      if (response.status && response.data && response.data.plans) {
        const plansArray = response.data.plans;
        console.log('Plans fetched:', plansArray);
        console.log('Number of plans:', plansArray.length);
        
        if (plansArray.length === 0) {
          toast({
            variant: 'destructive',
            title: 'No Plans Available',
            description: 'No subscription plans found. Please create plans in Super Admin panel first.',
          });
        }
        
        setPlans(plansArray);
      } else {
        console.error('Invalid response format:', response);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Invalid response format from server',
        });
        setPlans([]);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch subscription plans',
      });
      setPlans([]);
    }
  };

  const checkActiveSubscription = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/administrator/subscriptions/school/${schoolId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (data.status && data.data && ['active', 'trial'].includes(data.data.status)) {
        setActiveSubscription(data.data);
        setShowRenewalWarning(true);
      }
    } catch (error) {
      console.error('Error checking active subscription:', error);
    }
  };

  const onSubmit = async (data: SubscriptionAssignment) => {
    console.log('=== onSubmit called ===');
    console.log('Form data:', data);
    console.log('Selected plan:', selectedPlan);
    
    // Additional validation
    if (!data.plan_code) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please select a subscription plan',
      });
      setIsLoading(false);
      return;
    }
    
    if (!data.user_id || data.user_id === 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'User not found. Please login again.',
      });
      setIsLoading(false);
      return;
    }

    // For trial subscriptions (trial_days > 0), assign immediately
    const requiresPayment = (data.trial_days || 0) === 0;
    
    if (!requiresPayment) {
      // Trial subscription - create it now
      console.log('Creating trial subscription...');
      setIsLoading(true);
      try {
        const response = await assignSubscription(data);

        if (response.status) {
          toast({
            title: 'Success',
            description: response.message || 'Trial subscription activated successfully',
          });
          onSuccess();
          onOpenChange(false);
        } else {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: response.message || 'Failed to create trial subscription',
          });
        }
      } catch (error) {
        console.error('Trial subscription error:', error);
        const err = error as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
        const errorMessage = err?.response?.data?.message ||
                            (err?.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(', ') : '') ||
                            'Failed to create trial subscription';

        toast({
          variant: 'destructive',
          title: 'Error',
          description: errorMessage,
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      // Payment required - show payment button (don't close dialog)
      toast({
        title: 'Payment Required',
        description: 'Please complete the payment below to activate subscription',
      });
      // Form is valid, payment button will be shown
      setIsLoading(false);
    }
  };

  const handlePlanChange = (value: string) => {
    console.log('=== Plan changed ===');
    console.log('Selected value:', value);
    
    // Find plan by code OR by id (as fallback)
    const plan = plans.find((p) => p.code === value || p.id.toString() === value);
    console.log('Found plan:', plan);
    
    if (!plan) {
      console.error('Plan not found for value:', value);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Selected plan not found',
      });
      return;
    }
    
    setSelectedPlan(plan);
    
    // Use the actual code from the plan object
    const planCode = plan.code || `PLAN_${plan.id}`;
    setValue('plan_code', planCode, { 
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true
    });
    
    // Automatically set trial_days based on the plan
    if (plan.is_trial && plan.trial_days) {
      setValue('trial_days', plan.trial_days);
      console.log('Trial days automatically set to:', plan.trial_days);
    } else if (plan.is_trial && !plan.trial_days) {
      // Default to 14 days if trial is enabled but no specific days set
      setValue('trial_days', 14);
      console.log('Trial days set to default: 14');
    } else {
      // No trial, set to 0
      setValue('trial_days', 0);
      console.log('Plan is not trial, setting trial days to 0');
    }
    
    console.log('Plan code set in form:', planCode);
  };
  
  const handleBillingCycleChange = (value: string) => {
    setValue('billing_cycle', value as 'monthly' | 'annual', { shouldValidate: true });
  };

  const calculateAmount = () => {
    if (!selectedPlan) return 0;
    // Use monthly_price or annual_price if available, otherwise fall back to price
    if (billingCycle === 'annual') {
      if (selectedPlan.annual_price) {
        return typeof selectedPlan.annual_price === 'string' ? parseFloat(selectedPlan.annual_price) : selectedPlan.annual_price;
      }
      // Calculate annual as monthly * 12 with 10% discount
      const monthlyPrice = typeof selectedPlan.monthly_price === 'string' ? parseFloat(selectedPlan.monthly_price) : selectedPlan.monthly_price;
      const basePrice = monthlyPrice || (typeof selectedPlan.price === 'string' ? parseFloat(selectedPlan.price) : selectedPlan.price);
      return basePrice * 12 * 0.9;
    } else {
      // Monthly billing
      if (selectedPlan.monthly_price) {
        return typeof selectedPlan.monthly_price === 'string' ? parseFloat(selectedPlan.monthly_price) : selectedPlan.monthly_price;
      }
      return typeof selectedPlan.price === 'string' ? parseFloat(selectedPlan.price) : selectedPlan.price;
    }
  };

  const calculateSavings = () => {
    if (!selectedPlan || billingCycle !== 'annual') return 0;
    
    const monthlyPrice = typeof selectedPlan.monthly_price === 'string' ? parseFloat(selectedPlan.monthly_price) : selectedPlan.monthly_price;
    const basePrice = monthlyPrice || (typeof selectedPlan.price === 'string' ? parseFloat(selectedPlan.price) : selectedPlan.price);
    const monthlyTotal = basePrice * 12;
    
    if (selectedPlan.annual_price) {
      const annualPrice = typeof selectedPlan.annual_price === 'string' ? parseFloat(selectedPlan.annual_price) : selectedPlan.annual_price;
      return monthlyTotal - annualPrice;
    }
    
    // Calculate annual with 10% discount
    const annualPrice = monthlyTotal * 0.9;
    return monthlyTotal - annualPrice;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Package className="w-6 h-6 text-primary" />
            Assign Subscription Plan
          </DialogTitle>
          <DialogDescription className="text-base mt-2">
            Select and assign a subscription plan to{' '}
            <span className="font-semibold text-primary">{schoolName}</span>
          </DialogDescription>
        </DialogHeader>

      <form
        onSubmit={(e) => {
          console.log('Form submit event triggered');
          console.log('Form errors:', errors);
          handleSubmit(
            onSubmit,
            (errors) => {
              console.log('Form validation failed:', errors);
              toast({
                variant: 'destructive',
                title: 'Validation Error',
                description: 'Please fill all required fields correctly',
              });
            }
          )(e);
        }}
        className="space-y-6 overflow-y-auto flex-1 py-4"
      >
              {/* Select Plan */}
          <div className="space-y-2">
            <Label htmlFor="plan" className="text-sm font-medium">
              Select Plan <span className="text-red-500">*</span>
            </Label>
            <Select 
              onValueChange={handlePlanChange} 
              value={planCode || undefined}
              required
            >
              <SelectTrigger className={`w-full ${errors.plan_code ? 'border-red-500' : ''}`}>
                <SelectValue placeholder="Choose a subscription plan" />
              </SelectTrigger>
              <SelectContent>
                {plans.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No plans available. Create plans in Super Admin panel.
                  </div>
                ) : (
                  plans.filter(p => p.is_active).map((plan) => (
                    <SelectItem key={plan.id} value={plan.code || plan.id.toString()}>
                      <div className="flex items-center justify-between w-full">
                        <span className="font-medium">{plan.name}</span>
                        <span className="text-sm text-muted-foreground ml-4">
                          ₹{plan.monthly_price ? (typeof plan.monthly_price === 'string' ? parseFloat(plan.monthly_price) : plan.monthly_price) : (typeof plan.price === 'string' ? parseFloat(plan.price) : plan.price)}/mo
                        </span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.plan_code && (
              <p className="text-sm text-red-500">{errors.plan_code.message || 'Please select a plan'}</p>
            )}
          </div>

          {/* Plan Details */}
          {selectedPlan && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 shadow-sm text-foreground">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-bold text-lg text-foreground mb-1">
                    {selectedPlan.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">{selectedPlan.description}</p>
                </div>
                {selectedPlan.is_trial && (
                  <Badge className="bg-primary text-primary-foreground">Trial</Badge>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-foreground/90">{selectedPlan.duration_days} days</span>
                </div>
                {selectedPlan.max_students && (
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="text-foreground/90">Up to {selectedPlan.max_students} students</span>
                  </div>
                )}
                {selectedPlan.max_users && (
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="text-foreground/90">Up to {selectedPlan.max_users} users</span>
                  </div>
                )}
              </div>

              {/* Features */}
              {selectedPlan.features && (
                <div>
                  <h5 className="font-semibold text-sm text-foreground mb-2">Key Features</h5>
                  <ul className="space-y-2 max-h-32 overflow-y-auto">
                    {(() => {
                      // Normalize features to array
                      let featuresArray: string[] = [];
                      if (typeof selectedPlan.features === 'string') {
                        // Try to parse as JSON first, otherwise split by comma
                        try {
                          const parsed = JSON.parse(selectedPlan.features);
                          featuresArray = Array.isArray(parsed) ? parsed : [selectedPlan.features];
                        } catch {
                          featuresArray = selectedPlan.features.split(',').map(f => f.trim());
                        }
                      } else if (Array.isArray(selectedPlan.features)) {
                        featuresArray = selectedPlan.features;
                      } else {
                        featuresArray = [];
                      }

                      return featuresArray.slice(0, 3).map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span>{typeof feature === 'string' ? feature : String(feature)}</span>
                        </li>
                      ));
                    })()}
                  </ul>
                  {(() => {
                    let featuresArray: string[] = [];
                    if (typeof selectedPlan.features === 'string') {
                      try {
                        const parsed = JSON.parse(selectedPlan.features);
                        featuresArray = Array.isArray(parsed) ? parsed : [selectedPlan.features];
                      } catch {
                        featuresArray = selectedPlan.features.split(',').map(f => f.trim());
                      }
                    } else if (Array.isArray(selectedPlan.features)) {
                      featuresArray = selectedPlan.features;
                    }
                    return featuresArray.length > 3;
                  })() && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-100 mt-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowAllFeatures(true);
                      }}
                    >
                      <span className="font-medium">
                        +{(() => {
                          let featuresArray: string[] = [];
                          if (typeof selectedPlan.features === 'string') {
                            try {
                              const parsed = JSON.parse(selectedPlan.features);
                              featuresArray = Array.isArray(parsed) ? parsed : [selectedPlan.features];
                            } catch {
                              featuresArray = selectedPlan.features.split(',').map(f => f.trim());
                            }
                          } else if (Array.isArray(selectedPlan.features)) {
                            featuresArray = selectedPlan.features;
                          }
                          return featuresArray.length - 3;
                        })()} more features
                      </span>
                      <span className="ml-2">→</span>
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Billing Cycle */}
          <div className="space-y-2">
            <Label htmlFor="billing_cycle" className="text-sm font-medium">
              Billing Cycle <span className="text-red-500">*</span>
            </Label>
            <Select
              value={billingCycle}
              onValueChange={handleBillingCycleChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Monthly</span>
                  </div>
                </SelectItem>
                <SelectItem value="annual">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span className="truncate">Annual {selectedPlan && `(Save ₹${calculateSavings().toLocaleString()})`}</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.billing_cycle && (
              <p className="text-xs sm:text-sm text-red-500">{errors.billing_cycle.message}</p>
            )}
          </div>


          {/* Pricing Summary */}
          {selectedPlan && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 shadow-sm text-foreground">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-base">Total Amount</span>
                <span className="text-3xl font-bold text-emerald-500">
                  ₹{calculateAmount().toLocaleString()}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Billing Period</span>
                  <span className="capitalize font-medium text-foreground">{billingCycle}</span>
                </div>
                {billingCycle === 'annual' && calculateSavings() > 0 && (
                  <div className="flex justify-between text-sm text-emerald-500">
                    <span>You save</span>
                    <span className="font-semibold">₹{calculateSavings().toLocaleString()}</span>
                  </div>
                )}
              </div>
              {trialDays && trialDays > 0 ? (
                <div className="mt-3 pt-3 border-t border-emerald-500/20">
                  <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-3 py-2 rounded-lg">
                    <Calendar className="w-5 h-5 text-primary flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-foreground font-semibold">
                        {trialDays} days free trial
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Payment required after trial ends
                      </p>
                    </div>
                  </div>
                </div>
              ) : selectedPlan && !selectedPlan.is_trial ? (
                <div className="mt-3 pt-3 border-t border-emerald-500/20">
                  <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-lg">
                    <CreditCard className="w-5 h-5 text-amber-500 flex-shrink-0" />
                    <span className="text-sm text-amber-400 font-medium">Payment required immediately</span>
                  </div>
                </div>
              ) : null}
            </div>
          )}
          {/* Payment Mode Selector for Non-Trial Subscriptions */}
          {trialDays === 0 && selectedPlan && (
            <div className="space-y-3 pt-3 border-t border-border">
              <Label className="text-sm font-semibold">Payment Option</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMode('online')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-sm font-medium transition-all ${
                    paymentMode === 'online'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500 shadow-sm'
                      : 'border-border bg-background hover:bg-muted/50 text-muted-foreground'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Razorpay Online</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMode('manual')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-sm font-medium transition-all ${
                    paymentMode === 'manual'
                      ? 'border-blue-500 bg-blue-500/10 text-blue-500 shadow-sm'
                      : 'border-border bg-background hover:bg-muted/50 text-muted-foreground'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span>Manual Payment</span>
                </button>
              </div>

              {paymentMode === 'manual' && (
                <div className="p-3 bg-muted/40 rounded-lg border border-border space-y-3 mt-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Payment Method</Label>
                    <Select value={manualMethod} onValueChange={setManualMethod}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash Payment</SelectItem>
                        <SelectItem value="bank_transfer">Bank Transfer / NEFT / RTGS</SelectItem>
                        <SelectItem value="cheque">Cheque</SelectItem>
                        <SelectItem value="upi_offline">Offline UPI / QR</SelectItem>
                        <SelectItem value="admin_override">Admin Manual Override</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Reference / Receipt / Txn ID (Optional)</Label>
                    <Input
                      className="h-9 text-xs"
                      placeholder="e.g. UTR-987654 or CHQ-00123"
                      value={manualReference}
                      onChange={(e) => setManualReference(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Renewal Warning */}
          {activeSubscription && showRenewalWarning && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 shadow-sm text-foreground">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center mt-0.5">
                  <Calendar className="w-5 h-5 text-amber-500" />
                </div>
                <div className="flex-1">
                  <h5 className="font-bold text-base text-amber-400 mb-1">
                    Active Subscription Detected
                  </h5>
                  <p className="text-sm text-muted-foreground mb-2">
                    This school already has an active subscription.
                  </p>
                  <div className="bg-background/60 rounded-md p-3 space-y-1 text-sm border border-border/50">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Current Plan:</span>
                      <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">{activeSubscription.plan?.name || 'Active Plan'}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Current Status:</span>
                      <Badge variant="secondary" className="capitalize">{activeSubscription.status}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Ends On:</span>
                      <span className="font-medium text-foreground">
                        {new Date(activeSubscription.end_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                    <p className="text-sm font-semibold text-amber-400">
                      ⚠️ Important:
                    </p>
                    <p className="text-sm text-amber-800 mt-1">
                      If you subscribe now, it will be added as a renewal and will start after your current subscription ends on <strong>{new Date(activeSubscription.end_date).toLocaleDateString()}</strong>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </form>

        {/* Features Dialog */}
        {selectedPlan && selectedPlan.features && (
          <Dialog open={showAllFeatures} onOpenChange={setShowAllFeatures}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
              <DialogHeader className="border-b pb-4">
                <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                  <Package className="w-6 h-6 text-primary" />
                  All Features
                </DialogTitle>
                <DialogDescription className="text-base mt-2">
                  Complete feature list for{' '}
                  <span className="font-semibold text-primary">{selectedPlan.name}</span>
                </DialogDescription>
              </DialogHeader>
              
              <div className="overflow-y-auto flex-1 py-4">
                <div className="grid grid-cols-1 gap-3">
                  {(() => {
                    // Normalize features to array
                    let featuresArray: string[] = [];
                    if (typeof selectedPlan.features === 'string') {
                      try {
                        const parsed = JSON.parse(selectedPlan.features);
                        featuresArray = Array.isArray(parsed) ? parsed : [selectedPlan.features];
                      } catch {
                        featuresArray = selectedPlan.features.split(',').map(f => f.trim());
                      }
                    } else if (Array.isArray(selectedPlan.features)) {
                      featuresArray = selectedPlan.features;
                    }

                    return featuresArray.map((feature, index) => (
                      <div 
                        key={index} 
                        className="flex items-start gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-lg hover:from-green-100 hover:to-emerald-100 hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                          <TrendingUp className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 leading-relaxed">
                          {typeof feature === 'string' ? feature : String(feature)}
                        </span>
                      </div>
                    ));
                  })()}
                </div>
              </div>
              
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>Total: <strong className="text-primary">
                    {(() => {
                      let featuresArray: string[] = [];
                      if (typeof selectedPlan.features === 'string') {
                        try {
                          const parsed = JSON.parse(selectedPlan.features);
                          featuresArray = Array.isArray(parsed) ? parsed : [selectedPlan.features];
                        } catch {
                          featuresArray = selectedPlan.features.split(',').map(f => f.trim());
                        }
                      } else if (Array.isArray(selectedPlan.features)) {
                        featuresArray = selectedPlan.features;
                      }
                      return featuresArray.length;
                    })()}
                  </strong> features</span>
                  <Button
                    variant="outline"
                    onClick={() => setShowAllFeatures(false)}
                    className="text-sm"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0 border-t pt-4 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                console.log('Cancel clicked');
                onOpenChange(false);
              }}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            
            {trialDays === 0 && selectedPlan && planCode ? (
              paymentMode === 'manual' ? (
                <Button
                  type="button"
                  onClick={handleManualActivation}
                  disabled={isLoading}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Activate Manual Subscription
                </Button>
              ) : (
                // Show payment button for paid subscriptions (Razorpay)
                <SubscriptionPaymentButton
                  schoolId={schoolId}
                  schoolName={schoolName}
                  planCode={planCode}
                  billingCycle={billingCycle as 'monthly' | 'annual'}
                  amount={calculateAmount()}
                  trialDays={selectedPlan.trial_days || 0}
                  onStartPayment={() => {
                    // Temporarily close dialog so Radix modal overlay does not trap clicks or pointer events
                    onOpenChange(false);
                  }}
                  onSuccess={() => {
                    onSuccess();
                    onOpenChange(false);
                  }}
                  disabled={isLoading}
                />
              )
            ) : (
              // Show assign button for trial subscriptions
              <Button 
                type="submit" 
                disabled={isLoading || !selectedPlan}
                onClick={() => console.log('Submit button clicked, isLoading:', isLoading, 'selectedPlan:', selectedPlan)}
                className="w-full sm:w-auto"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Assign Trial Subscription
              </Button>
            )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


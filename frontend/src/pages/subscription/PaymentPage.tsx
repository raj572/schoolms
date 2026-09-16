import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { subscriptionApi, SubscriptionPlan } from '@/services/subscriptionApiService';
import { createSubscriptionOrder, verifySubscriptionPayment } from '@/services/subscriptionPaymentApiService';
import { Loader2, CreditCard, Shield, CheckCircle2, ArrowLeft, Banknote, Building2 } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { API_BASE_URL } from '@/lib/axios';

// Razorpay types
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      open: () => void;
      on: (event: string, handler: (response: any) => void) => void;
    };
  }
}

interface PaymentPageLocationState {
  planId?: number;
  billingCycle?: 'monthly' | 'annual';
  plan?: SubscriptionPlan;
}

const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { planId, billingCycle: initialBillingCycle, plan: initialPlan } = (location.state || {}) as PaymentPageLocationState;

  const [plan, setPlan] = useState<SubscriptionPlan | null>(initialPlan || null);
  const [loading, setLoading] = useState(!initialPlan);
  const [processing, setProcessing] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>(initialBillingCycle || 'monthly');
  const [transactionId, setTransactionId] = useState<number | null>(null);
  const [paymentOption, setPaymentOption] = useState<'online' | 'manual'>('online');
  const [manualMethod, setManualMethod] = useState<string>('bank_transfer');
  const [manualReference, setManualReference] = useState<string>('');
  const { authUser, getUser } = useAuthStore();

  const handleManualPayment = async () => {
    if (!plan) return;
    setProcessing(true);

    try {
      const schoolId = authUser?.school_id || Number(localStorage.getItem('school_id')) || 1;
      const userId = authUser?.id || Number(localStorage.getItem('userId')) || 1;
      const planCode = plan.code || `PLAN_${plan.id}`;

      const response = await fetch(`${API_BASE_URL}/subscriptions/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          school_id: schoolId,
          plan_code: planCode,
          subscription_plan_id: plan.id,
          billing_cycle: billingCycle,
          user_id: userId,
          payment_method: manualMethod,
          reference: manualReference || 'Manual Payment Entry',
          is_manual: true,
        }),
      });

      const data = await response.json();
      if (data.status) {
        toast({
          title: 'Subscription Activated!',
          description: data.message || 'Manual payment submitted and subscription activated successfully!',
        });
        getUser();
        navigate('/administrator/dashboard');
      } else {
        throw new Error(data.message || 'Manual payment activation failed');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Payment Failed',
        description: error.message || 'Failed to record manual payment.',
      });
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    if (!planId && !initialPlan) {
      toast({
        title: 'Error',
        description: 'No plan selected. Redirecting to pricing page.',
        variant: 'destructive',
      });
      navigate('/choose-plan');
      return;
    }

    if (!initialPlan && planId) {
      fetchPlanDetails();
    }
    loadRazorpayScript();
  }, [planId, initialPlan]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (document.getElementById('razorpay-checkout-js')) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.id = 'razorpay-checkout-js';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const fetchPlanDetails = async () => {
    try {
      const response = await subscriptionApi.getSubscriptionPlans();
      const selectedPlan = response.data.find((p: SubscriptionPlan) => p.id === planId);
      
      if (!selectedPlan) {
        throw new Error('Plan not found');
      }

      setPlan(selectedPlan);
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to load plan details.',
        variant: 'destructive',
      });
      navigate('/choose-plan');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!plan) return;

    setProcessing(true);

    try {
      const schoolId = localStorage.getItem('school_id') || localStorage.getItem('schoolId') || authUser?.school_id;
      if (!schoolId) {
        toast({
          title: 'Error',
          description: 'School information not found. Please complete school setup first.',
          variant: 'destructive',
        });
        navigate('/school-setup');
        return;
      }

      // Create Razorpay order
      const orderResponse = await createSubscriptionOrder({
        school_id: parseInt(schoolId),
        subscription_plan_id: plan.id,
        billing_cycle: billingCycle,
      });

      if (!orderResponse.status || !orderResponse.data) {
        throw new Error(orderResponse.message || 'Failed to create order');
      }

      const transaction = orderResponse.data;
      setTransactionId(transaction.id);

      // Get user details
      const userEmail = localStorage.getItem('email') || '';
      const userName = localStorage.getItem('full_name') || '';
      const userPhone = localStorage.getItem('phone') || '';

      const razorpayKey = orderResponse.key || transaction?.razorpay_key || import.meta.env.VITE_RAZORPAY_KEY || '';
      
      if (!razorpayKey) {
        toast({
          variant: 'destructive',
          title: 'Configuration Error',
          description: 'Razorpay key is missing. Please set VITE_RAZORPAY_KEY in frontend .env or configure RAZORPAY_KEY in backend .env',
        });
        setProcessing(false);
        return;
      }

      const currentPrice = billingCycle === 'annual' 
        ? (typeof plan.annual_price === 'number' ? plan.annual_price : parseFloat(plan.annual_price || '0'))
        : (typeof plan.monthly_price === 'number' ? plan.monthly_price : parseFloat(plan.monthly_price || '0'));

      const options: RazorpayOptions = {
        key: razorpayKey,
        amount: Math.round(currentPrice * 100), // Convert to paise
        currency: 'INR',
        name: 'School ERP System',
        description: `${plan.name} Plan - ${billingCycle === 'annual' ? 'Annual' : 'Monthly'} Subscription`,
        order_id: transaction.razorpay_order_id,
        handler: async (razorpayResponse: RazorpayResponse) => {
          await verifyPayment(razorpayResponse, transaction.id);
        },
        prefill: {
          name: userName,
          email: userEmail,
          contact: userPhone,
        },
        theme: {
          color: '#3b82f6',
        },
      };

      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', (response: any) => {
        console.error('Payment failed:', response);
        setProcessing(false);
        toast({
          variant: 'destructive',
          title: 'Payment Failed',
          description: response.error?.description || 'Payment declined or cancelled by user.',
        });
      });

      rzp.open();
    } catch (error: any) {
      console.error('Payment initiation error:', error);
      const apiMsg = error?.response?.data?.message || error?.message || 'Failed to initiate payment. Please try again.';
      toast({
        title: 'Payment Initiation Error',
        description: apiMsg,
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const verifyPayment = async (razorpayResponse: RazorpayResponse, transactionId: number) => {
    try {
      const verifyResponse = await verifySubscriptionPayment({
        transaction_id: transactionId,
        razorpay_order_id: razorpayResponse.razorpay_order_id,
        razorpay_payment_id: razorpayResponse.razorpay_payment_id,
        razorpay_signature: razorpayResponse.razorpay_signature,
      });

      if (verifyResponse.status) {
        toast({
          title: 'Payment Successful!',
          description: 'Your subscription is now active. Welcome aboard!',
        });

        // Update user's subscription status
        localStorage.setItem('subscription_active', 'true');
        localStorage.setItem('registration_status', 'active');
        await getUser();

        // Navigate to dashboard
        navigate('/principal/dashboard');
      } else {
        throw new Error(verifyResponse.message || 'Payment verification failed');
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      toast({
        title: 'Verification Failed',
        description: error.message || 'Payment verification failed. Please contact support.',
        variant: 'destructive',
      });
    }
  };

  const getPrice = () => {
    if (!plan) return 0;
    if (billingCycle === 'annual') {
      return typeof plan.annual_price === 'number' ? plan.annual_price : parseFloat(plan.annual_price || '0');
    }
    return typeof plan.monthly_price === 'number' ? plan.monthly_price : parseFloat(plan.monthly_price || '0');
  };

  const calculateSavings = () => {
    if (!plan || billingCycle !== 'annual') return 0;
    const monthlyPrice = typeof plan.monthly_price === 'number' ? plan.monthly_price : parseFloat(plan.monthly_price || '0');
    const annualPrice = typeof plan.annual_price === 'number' ? plan.annual_price : parseFloat(plan.annual_price || '0');
    const monthlyTotal = monthlyPrice * 12;
    if (annualPrice > 0) {
      return monthlyTotal - annualPrice;
    }
    return monthlyTotal * 0.1; // 10% discount
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!plan) {
    return null;
  }

  const price = getPrice();
  const savings = calculateSavings();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-950 dark:to-slate-900 text-slate-800 dark:text-slate-100 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/choose-plan')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Plans
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Plan Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>Review your selected plan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg p-4 mb-4">
                <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-gray-50">{plan.name}</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-gray-900 dark:text-gray-50">₹{price.toLocaleString()}</span>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">/{billingCycle === 'annual' ? 'year' : 'month'}</span>
                </div>
                {billingCycle === 'annual' && savings > 0 && (
                  <Badge className="mt-2 bg-green-600 text-white">
                    Save ₹{savings.toLocaleString()}
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="font-semibold">Billing Cycle</span>
                  <span className="capitalize">{billingCycle}</span>
                </div>
                {plan.max_students && (
                  <div className="flex items-center justify-between py-2 border-b text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Max Students</span>
                    <span className="text-gray-800 dark:text-gray-200">{plan.max_students}</span>
                  </div>
                )}
                {plan.max_teachers && (
                  <div className="flex items-center justify-between py-2 border-b text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Max Teachers</span>
                    <span className="text-gray-800 dark:text-gray-200">{plan.max_teachers}</span>
                  </div>
                )}
                {plan.max_classes && (
                  <div className="flex items-center justify-between py-2 border-b text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Max Classes</span>
                    <span className="text-gray-800 dark:text-gray-200">{plan.max_classes}</span>
                  </div>
                )}
                {plan.trial_days && plan.trial_days > 0 && (
                  <div className="flex items-center justify-between py-2 border-b text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Trial Period</span>
                    <span className="text-gray-800 dark:text-gray-200">{plan.trial_days} Days Free</span>
                  </div>
                )}
              </div>

              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/40 rounded-lg p-4 mt-4">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-900 dark:text-green-400">Secure Payment</p>
                    <p className="text-sm text-green-700 dark:text-green-500 mt-1">
                      Your payment is processed securely through Razorpay. We never store your card details.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Details */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>Choose how you want to pay</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Payment Mode Selector */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentOption('online')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-sm font-medium transition-all ${
                    paymentOption === 'online'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500 font-semibold shadow-sm'
                      : 'border-border bg-background hover:bg-muted/50 text-muted-foreground'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Razorpay Online</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentOption('manual')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-sm font-medium transition-all ${
                    paymentOption === 'manual'
                      ? 'border-blue-500 bg-blue-500/10 text-blue-500 font-semibold shadow-sm'
                      : 'border-border bg-background hover:bg-muted/50 text-muted-foreground'
                  }`}
                >
                  <Banknote className="w-4 h-4" />
                  <span>Manual / Offline</span>
                </button>
              </div>

              {paymentOption === 'online' ? (
                <>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">Accepted Online Methods:</h4>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <li className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        Credit & Debit Cards
                      </li>
                      <li className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        Net Banking & UPI
                      </li>
                      <li className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        Digital Wallets
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-3 pt-4 border-t">
                    <Button
                      className="w-full h-12 text-base font-semibold"
                      size="lg"
                      onClick={handlePayment}
                      disabled={processing}
                    >
                      {processing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4 mr-2" />
                          Proceed with Razorpay
                        </>
                      )}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40 rounded-lg p-3 text-xs text-blue-700 dark:text-blue-400 space-y-1">
                      <p className="font-semibold flex items-center gap-1.5">
                        <Building2 className="w-4 h-4" /> Direct Manual / Bank Transfer
                      </p>
                      <p>Transfer the amount via Bank / Cash / Offline UPI and enter your reference transaction ID below.</p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Payment Mode</Label>
                      <select
                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                        value={manualMethod}
                        onChange={(e) => setManualMethod(e.target.value)}
                      >
                        <option value="bank_transfer">Bank Transfer / NEFT / RTGS</option>
                        <option value="cash">Cash Payment</option>
                        <option value="cheque">Cheque</option>
                        <option value="upi_offline">Offline UPI / QR</option>
                        <option value="admin_override">Direct Manual Activation</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Reference / UTR / Receipt No. (Optional)</Label>
                      <Input
                        placeholder="e.g. UTR12345678 or Receipt #001"
                        value={manualReference}
                        onChange={(e) => setManualReference(e.target.value)}
                      />
                    </div>

                    <Button
                      className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white"
                      size="lg"
                      onClick={handleManualPayment}
                      disabled={processing}
                    >
                      {processing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Banknote className="w-4 h-4 mr-2" />
                          Submit Manual Payment
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}

              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/choose-plan')}
                disabled={processing}
              >
                Change Plan
              </Button>

              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-700 dark:text-blue-500">
                    <p className="font-semibold mb-1">Your data is safe</p>
                    <p className="text-xs">All transactions are encrypted and secure. Your card details are never stored.</p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                By proceeding, you agree to our Terms of Service and Privacy Policy
              </p>
            </CardContent>
          </Card>
        </div>

        {/* What Happens Next */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>What Happens Next?</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  1
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">Complete Payment</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Click "Proceed to Payment" to complete your subscription via Razorpay.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  2
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">Start Your Trial</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {plan.trial_days ? `Enjoy ${plan.trial_days} days of full access to all features at no cost.` : 'Your subscription is now active.'}
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  3
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">Access Dashboard</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Get redirected to your school dashboard and start managing your school.
                  </p>
                </div>
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentPage;

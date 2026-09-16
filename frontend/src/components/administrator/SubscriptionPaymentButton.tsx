import { useState } from 'react';
import { useRazorpay } from 'react-razorpay';
import type { RazorpayOrderOptions } from 'react-razorpay';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { CreditCard, Loader2 } from 'lucide-react';
import {
  createSubscriptionOrder,
  verifySubscriptionPayment,
  type CreateSubscriptionOrderData
} from '@/services/subscriptionPaymentApiService';
import { assignSubscription, getSubscriptionPlans } from '@/services/administratorApiService';

interface SubscriptionPaymentButtonProps {
  schoolId: number;
  schoolName: string;
  planCode: string;
  billingCycle: 'monthly' | 'annual';
  amount: number;
  onSuccess: () => void;
  onStartPayment?: () => void;
  disabled?: boolean;
  trialDays?: number;  // Optional trial days from the plan
}

export default function SubscriptionPaymentButton({
  schoolId,
  schoolName,
  planCode,
  billingCycle,
  amount,
  onSuccess,
  onStartPayment,
  disabled = false,
  trialDays = 0,
}: SubscriptionPaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { Razorpay } = useRazorpay();

  const handlePayment = async () => {
    setIsLoading(true);

    try {
      // Step 1: Get subscription plan ID from plan code
      const plansResponse = await getSubscriptionPlans();
      if (!plansResponse.status || !plansResponse.data?.plans) {
        throw new Error('Failed to fetch subscription plans');
      }

      const plan = plansResponse.data.plans.find((p: any) => p.code === planCode);
      if (!plan) {
        throw new Error('Subscription plan not found');
      }

      // Step 2: Create Razorpay order in subscription_transactions table
      const orderData: CreateSubscriptionOrderData = {
        school_id: schoolId,
        subscription_plan_id: plan.id,
        billing_cycle: billingCycle,
      };

      console.log('Creating Razorpay order:', orderData);
      const orderResponse = await createSubscriptionOrder(orderData);
      console.log('Order created:', orderResponse);

      if (!orderResponse.status) {
        throw new Error(orderResponse.message || 'Failed to create payment order');
      }

      const transaction = orderResponse.data;
      setIsLoading(false);

      // Close the parent Radix Dialog modal so it doesn't intercept pointer events or focus
      if (onStartPayment) {
        onStartPayment();
      }

      // Step 3: Open Razorpay checkout
      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY || '';
      
      if (!razorpayKey) {
        toast({
          variant: 'destructive',
          title: 'Configuration Error',
          description: 'Razorpay Key ID is missing. Please set VITE_RAZORPAY_KEY in your frontend environment file.',
        });
        setIsLoading(false);
        return;
      }

      console.log('CHECKOUT_OPENED', {
        school_id: schoolId,
        transaction_id: transaction.id,
        order_id: transaction.razorpay_order_id,
        amount: transaction.order_amount,
      });

      const options: RazorpayOrderOptions = {
        key: razorpayKey,
        amount: Math.round(transaction.order_amount * 100), // Amount in paise
        currency: (transaction.order_currency || 'INR') as 'INR',
        name: 'School ERP System',
        description: `${plan.name} - ${billingCycle === 'annual' ? 'Annual' : 'Monthly'} Subscription${trialDays > 0 ? ` (${trialDays} days trial)` : ''}`,
        order_id: transaction.razorpay_order_id,
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          // Step 4: Verify payment signature and update database
          try {
            console.log('PAYMENT_SUCCESS_CALLBACK received:', response);
            
            const verifyResponse = await verifySubscriptionPayment({
              transaction_id: transaction.id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            console.log('Verification response:', verifyResponse);

            if (verifyResponse.status) {
              toast({
                title: 'Payment Successful!',
                description: 'Payment verified and subscription activated successfully!',
              });
              onSuccess();
            } else {
              toast({
                variant: 'destructive',
                title: verifyResponse.error_code || 'Verification Failed',
                description: verifyResponse.message || 'Payment signature verification failed. Please contact support.',
              });
            }
          } catch (error: any) {
            console.error('Payment verification error:', error);
            const errMsg = error?.response?.data?.message || error?.message || 'Payment verified on client, but backend verification failed.';
            toast({
              variant: 'destructive',
              title: 'Verification Error',
              description: errMsg,
            });
          }
        },
        prefill: {
          email: localStorage.getItem('email') || '',
          contact: '',
        },
        theme: { 
          color: '#3b82f6',
          backdrop_color: 'rgba(0,0,0,0.7)',
        },
        modal: {
          confirm_close: true,
          ondismiss: () => {
            console.log('Razorpay checkout dismissed');
            setIsLoading(false);
          },
        },
      };

      const rzp = new Razorpay(options);
      
      // Add event listener for payment failures
      rzp.on('payment.failed', (response: any) => {
        console.error('PAYMENT_FAILED callback:', response);
        setIsLoading(false);
        const reason = response.error?.description || response.error?.reason || 'Payment declined by bank or cancelled.';
        toast({
          variant: 'destructive',
          title: 'Payment Failed',
          description: reason,
        });
      });
      
      // Open Razorpay checkout
      rzp.open();
    } catch (error: any) {
      console.error('Payment initiation error:', error);
      setIsLoading(false);
      const apiErrorMsg = error?.response?.data?.message || error?.message || 'Failed to initiate payment.';
      const errorCode = error?.response?.data?.error_code || 'INITIATION_FAILED';
      toast({
        variant: 'destructive',
        title: errorCode === 'INVALID_CREDENTIALS' ? 'Invalid Razorpay Credentials' : 'Payment Initiation Failed',
        description: apiErrorMsg,
      });
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={disabled || isLoading}
      className="w-full"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <CreditCard className="mr-2 h-4 w-4" />
          Pay ₹{amount.toLocaleString('en-IN')}
        </>
      )}
    </Button>
  );
}


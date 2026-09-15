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
      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY || 'rzp_test_SmO1yKCJ2rPjl9';
      
      if (!razorpayKey) {
        throw new Error('Razorpay key is not configured. Please set VITE_RAZORPAY_KEY in your environment variables.');
      }

      const options: RazorpayOrderOptions = {
        key: razorpayKey,
        amount: transaction.order_amount * 100, // Amount in paise
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
            console.log('Payment successful, verifying...', response);
            
            const verifyResponse = await verifySubscriptionPayment({
              transaction_id: transaction.id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            console.log('Verification response:', verifyResponse);

            if (verifyResponse.status) {
              // Payment verified successfully!
              // The backend has already:
              // 1. Verified Razorpay signature
              // 2. Updated transaction status to 'success' in subscription_transactions table
              // 3. Created/updated subscription record
              // 4. Updated school's subscription status
              
              toast({
                title: 'Success!',
                description: 'Payment verified and subscription activated successfully!',
              });
              onSuccess();
            } else {
              toast({
                variant: 'destructive',
                title: 'Verification Failed',
                description: verifyResponse.message || 'Payment verification failed. Please contact support.',
              });
            }
          } catch (error: any) {
            console.error('Payment verification error:', error);
            toast({
              variant: 'destructive',
              title: 'Verification Error',
              description: error.message || 'Payment successful but verification failed. Please contact support.',
            });
          }
        },
        prefill: {
          email: localStorage.getItem('email') || '',
          contact: '',
        },
        // notes: {
        //   school_id: schoolId.toString(),
        //   plan_code: planCode,
        //   billing_cycle: billingCycle,
        //   school_name: schoolName,
        // },
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
        console.error('Payment failed:', response);
        setIsLoading(false);
        toast({
          variant: 'destructive',
          title: 'Payment Failed',
          description: response.error?.description || 'Payment failed. Please try again.',
        });
      });
      
      // Open Razorpay checkout
      rzp.open();
    } catch (error: any) {
      console.error('Payment initiation error:', error);
      setIsLoading(false);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to initiate payment',
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


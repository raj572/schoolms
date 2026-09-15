import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRazorpay, type RazorpayOrderOptions } from 'react-razorpay';
import {
  createSubscriptionOrder,
  verifySubscriptionPayment,
  type CreateSubscriptionOrderData
} from '@/services/subscriptionPaymentApiService';

interface SubscriptionPlan {
  id: number;
  name: string;
  description?: string;
  monthly_price: number;
  annual_price: number;
  features: string[];
  status: string;
}

interface SubscriptionPlanCardProps {
  plan: SubscriptionPlan;
  schoolId: number;
  onSuccess?: () => void;
}

export function SubscriptionPlanCard({ plan, schoolId, onSuccess }: SubscriptionPlanCardProps) {
  const { toast } = useToast();
  const { Razorpay } = useRazorpay();
  const [isLoading, setIsLoading] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const amount = billingCycle === 'annual' ? plan.annual_price : plan.monthly_price;

  const handleSubscribe = async () => {
    setIsLoading(true);
    
    try {
      // Create order data
      const orderData: CreateSubscriptionOrderData = {
        school_id: schoolId,
        subscription_plan_id: plan.id,
        billing_cycle: billingCycle
      };

      // Create Razorpay order
      const orderResponse = await createSubscriptionOrder(orderData);
      
      if (!orderResponse.status) {
        throw new Error(orderResponse.message);
      }

      const transaction = orderResponse.data;

      // Razorpay options
      const options: RazorpayOrderOptions = {
        key: import.meta.env.VITE_RAZORPAY_KEY || 'rzp_test_SmO1yKCJ2rPjl9',
        amount: amount * 100, // Amount in paise
        currency: transaction.order_currency,
        name: 'School Management System',
        description: `${plan.name} - ${billingCycle === 'annual' ? 'Annual' : 'Monthly'} Subscription`,
        order_id: transaction.razorpay_order_id,
        handler: async (response: any) => {
          try {
            // Verify payment
            const verifyResponse = await verifySubscriptionPayment({
              transaction_id: transaction.id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyResponse.status) {
              toast({
                title: 'Success!',
                description: 'Subscription activated successfully',
              });
              
              if (onSuccess) {
                onSuccess();
              }
            } else {
              throw new Error(verifyResponse.message);
            }
          } catch (error: any) {
            toast({
              variant: 'destructive',
              title: 'Verification Failed',
              description: error.message || 'Payment verification failed',
            });
          }
        },
        prefill: {
          email: localStorage.getItem('email') || '',
          contact: '',
        },
        theme: {
          color: '#3b82f6',
        },
      };

      // Open Razorpay checkout
      const rzp = new Razorpay(options);
      
      rzp.on('payment.failed', (response: any) => {
        toast({
          variant: 'destructive',
          title: 'Payment Failed',
          description: response.error.description || 'Payment failed. Please try again.',
        });
      });

      rzp.open();
    } catch (error: any) {
      console.error('Subscription error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to initiate payment',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle className="text-2xl">{plan.name}</CardTitle>
        {plan.description && (
          <CardDescription>{plan.description}</CardDescription>
        )}
        <div className="pt-4">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{formatCurrency(amount)}</span>
            <span className="text-gray-500">/{billingCycle === 'annual' ? 'year' : 'month'}</span>
          </div>
          {billingCycle === 'annual' && (
            <Badge className="mt-2 bg-green-100 text-green-800">
              Save {Math.round((1 - (plan.annual_price / (plan.monthly_price * 12))) * 100)}%
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        {/* Billing Cycle Toggle */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={billingCycle === 'monthly' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setBillingCycle('monthly')}
            className="flex-1"
          >
            Monthly
          </Button>
          <Button
            variant={billingCycle === 'annual' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setBillingCycle('annual')}
            className="flex-1"
          >
            Annual
          </Button>
        </div>

        {/* Features List */}
        <div className="space-y-3">
          <p className="font-semibold text-sm">Features included:</p>
          {plan.features && plan.features.length > 0 ? (
            plan.features.map((feature, index) => (
              <div key={index} className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">{feature}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No features listed</p>
          )}
        </div>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          size="lg"
          onClick={handleSubscribe}
          disabled={isLoading || plan.status !== 'active'}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            'Subscribe Now'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}


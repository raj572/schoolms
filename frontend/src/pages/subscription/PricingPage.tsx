import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { subscriptionApi, SubscriptionPlan } from '@/services/subscriptionApiService';
import { Check, Loader2, Zap, Shield, Crown, Sparkles } from 'lucide-react';

const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await subscriptionApi.getSubscriptionPlans();
      // Ensure we extract the array correctly depending on the response structure
      const plansArray = response.data?.plans || (Array.isArray(response.data) ? response.data : []);
      setPlans(plansArray);
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to load subscription plans.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to select a subscription plan.',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    // Pass both plan and billing cycle to payment page
    navigate('/payment', { 
      state: { 
        planId: plan.id,
        billingCycle: billingCycle,
        plan: plan
      } 
    });
  };

  const getPlanIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('basic')) return <Shield className="w-6 h-6" />;
    if (lowerName.includes('standard')) return <Zap className="w-6 h-6" />;
    if (lowerName.includes('premium')) return <Crown className="w-6 h-6" />;
    if (lowerName.includes('enterprise')) return <Sparkles className="w-6 h-6" />;
    return <Shield className="w-6 h-6" />;
  };

  const getPlanColor = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('basic')) return 'border-blue-200 hover:border-blue-300';
    if (lowerName.includes('standard')) return 'border-purple-200 hover:border-purple-300';
    if (lowerName.includes('premium')) return 'border-yellow-200 hover:border-yellow-300';
    if (lowerName.includes('enterprise')) return 'border-indigo-200 hover:border-indigo-300';
    return 'border-gray-200 hover:border-gray-300';
  };

  const isPopular = (plan: SubscriptionPlan) => {
    return plan.is_popular || plan.is_active;
  };

  const getPrice = (plan: SubscriptionPlan) => {
    if (billingCycle === 'annual') {
      const annualPrice = typeof plan.annual_price === 'number' ? plan.annual_price : parseFloat(plan.annual_price || '0');
      if (annualPrice > 0) return annualPrice;
      // Fallback: calculate annual from monthly
      const monthlyPrice = typeof plan.monthly_price === 'number' ? plan.monthly_price : parseFloat(plan.monthly_price || '0') || plan.price || 0;
      return monthlyPrice * 12;
    }
    const monthlyPrice = typeof plan.monthly_price === 'number' ? plan.monthly_price : parseFloat(plan.monthly_price || '0');
    return monthlyPrice || plan.price || 0;
  };

  const calculateSavings = (plan: SubscriptionPlan) => {
    if (billingCycle !== 'annual') return 0;
    const monthlyPrice = typeof plan.monthly_price === 'number' ? plan.monthly_price : parseFloat(plan.monthly_price || '0') || plan.price || 0;
    const annualPrice = typeof plan.annual_price === 'number' ? plan.annual_price : parseFloat(plan.annual_price || '0');
    const monthlyTotal = monthlyPrice * 12;
    if (annualPrice > 0) {
      return monthlyTotal - annualPrice;
    }
    return monthlyTotal * 0.1; // 10% discount default
  };

  const getFeatures = (plan: SubscriptionPlan) => {
    if (!plan.features) return [];
    
    // If features is already an array, return it
    if (Array.isArray(plan.features)) return plan.features;
    
    // If features is a string, try to parse it
    if (typeof plan.features === 'string') {
      try {
        const parsed = JSON.parse(plan.features);
        // If parsed to object, convert to array of enabled features
        if (typeof parsed === 'object' && !Array.isArray(parsed)) {
          return Object.entries(parsed)
            .filter(([key, value]) => value === true)
            .map(([key]) => key.replace(/_/g, ' '));
        }
        return parsed;
      } catch {
        return (plan.features as any as string).split(',').map(f => f.trim());
      }
    }
    
    // If features is an object with boolean values
    if (typeof plan.features === 'object' && !Array.isArray(plan.features)) {
      return Object.entries(plan.features)
        .filter(([key, value]) => value === true)
        .map(([key]) => key.replace(/_/g, ' '));
    }
    
    return [];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-800 dark:text-slate-100 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-gray-50 mb-4">
            Choose the Perfect Plan
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            Select the ideal subscription plan for your school. Start with a free trial and scale as you grow.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="flex items-center justify-center gap-4 mb-2">
            <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-gray-900 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'annual' : 'monthly')}
              className="relative inline-flex h-10 w-[56px] items-center rounded-full bg-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <span
                className={`inline-block h-8 w-8 transform rounded-full bg-white transition-transform ${
                  billingCycle === 'monthly' ? 'translate-x-1' : 'translate-x-[29px]'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${billingCycle === 'annual' ? 'text-gray-900 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}>
              Annual
            </span>
            {billingCycle === 'annual' && (
              <Badge className="ml-2 bg-green-600 text-white">
                Save up to 10%
              </Badge>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => {
            const price = getPrice(plan);
            const savings = calculateSavings(plan);
            const features = getFeatures(plan);

            return (
              <Card
                key={plan.id}
                className={`relative transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 ${getPlanColor(plan.name)} ${
                  isPopular(plan) ? 'ring-2 ring-primary border-primary' : ''
                }`}
              >
                {isPopular(plan) && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-white px-4 py-1 text-sm font-semibold">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-6">
                  <div className="flex justify-center mb-4 text-primary">
                    {getPlanIcon(plan.name)}
                  </div>
                  <CardTitle className="text-2xl font-bold mb-2">{plan.name}</CardTitle>
                  {plan.description && (
                    <CardDescription className="text-sm">{plan.description}</CardDescription>
                  )}
                  <div className="mt-6">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-5xl font-bold text-gray-900 dark:text-gray-50">
                        ₹{price.toLocaleString()}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 text-sm">/{billingCycle === 'annual' ? 'year' : 'month'}</span>
                    </div>
                    {billingCycle === 'annual' && savings > 0 && (
                      <Badge className="mt-3 bg-green-100 text-green-800">
                        Save ₹{savings.toLocaleString()}
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 min-h-[320px]">
                  {/* Resource Limits */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {plan.max_students && (
                      <div className="text-center p-2 bg-blue-50 dark:bg-blue-950/40 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{plan.max_students}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Students</div>
                      </div>
                    )}
                    {plan.max_teachers && (
                      <div className="text-center p-2 bg-purple-50 dark:bg-purple-950/40 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{plan.max_teachers}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Teachers</div>
                      </div>
                    )}
                    {plan.max_users && (
                      <div className="text-center p-2 bg-green-50 dark:bg-green-950/40 rounded-lg">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">{plan.max_users}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Users</div>
                      </div>
                    )}
                    {plan.max_classes && (
                      <div className="text-center p-2 bg-orange-50 dark:bg-orange-950/40 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{plan.max_classes}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Classes</div>
                      </div>
                    )}
                  </div>

                  {/* Features List */}
                  {features.length > 0 && (
                    <div className="space-y-2 pt-4 border-t">
                      {features.slice(0, 6).map((feature: any, index: number) => {
                        const featureName = typeof feature === 'string' ? feature : feature.name || feature;
                        
                        return (
                          <div key={index} className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                              {featureName}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>

                <CardFooter className="pt-2">
                  <Button
                    className="w-full h-12 text-base font-semibold"
                    variant={isPopular(plan) ? 'default' : 'outline'}
                    onClick={() => handleSelectPlan(plan)}
                    disabled={!plan.is_active}
                  >
                    {plan.is_trial && plan.trial_days ? (
                      <>Start {plan.trial_days}-Day Free Trial</>
                    ) : (
                      <>Choose Plan</>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-gray-50">Why Choose Our Platform?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100">Secure & Reliable</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Enterprise-grade security with regular backups and 99.9% uptime guarantee.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100">Fast & Efficient</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Lightning-fast performance ensures smooth operations for thousands of students.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100">24/7 Support</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Our dedicated support team is always ready to help you succeed.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-gray-50">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <div>
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">What happens after the free trial?</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                After your free trial, your subscription will automatically activate. You can cancel anytime before the trial ends with no charges.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Can I upgrade or downgrade my plan?</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Yes! You can change your plan at any time from your account settings. Upgrades take effect immediately.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">What payment methods do you accept?</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                We accept all major credit/debit cards, net banking, UPI, and wallets through our secure payment gateway.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Is there a setup fee?</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No setup fees! Only transparent monthly or annual subscription charges with no hidden costs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;

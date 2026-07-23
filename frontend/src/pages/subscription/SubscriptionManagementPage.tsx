import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { subscriptionApi } from '@/services/subscriptionApiService';
import {
  Loader2,
  CreditCard,
  Calendar,
  Users,
  GraduationCap,
  BookOpen,
  HardDrive,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from 'lucide-react';

interface Subscription {
  id: number;
  plan_name: string;
  status: string;
  start_date: string;
  end_date: string;
  trial_ends_at: string | null;
  is_trial: boolean;
  auto_renew: boolean;
  billing_cycle: string;
  amount: number;
  max_students: number;
  max_teachers: number;
  max_classes: number;
  storage_limit_gb: number;
}

interface Transaction {
  id: number;
  amount: number;
  status: string;
  payment_method: string;
  transaction_id: string;
  created_at: string;
}

interface FeatureUsage {
  students_count: number;
  teachers_count: number;
  classes_count: number;
  storage_used_gb: number;
}

const SubscriptionManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [usage, setUsage] = useState<FeatureUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchSubscriptionData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      const schoolId = localStorage.getItem('schoolId');
      if (!schoolId) {
        toast({
          title: 'Error',
          description: 'School information not found.',
          variant: 'destructive',
        });
        navigate('/school-setup');
        return;
      }

      // Fetch subscription details
      const subResponse = await subscriptionApi.getCurrentSubscription(parseInt(schoolId));
      setSubscription(subResponse.data);

      // Fetch transactions
      const txnResponse = await subscriptionApi.getTransactions(parseInt(schoolId));
      setTransactions(txnResponse.data);

      // Mock usage data (in real app, fetch from backend)
      setUsage({
        students_count: 450,
        teachers_count: 35,
        classes_count: 18,
        storage_used_gb: 4.2,
      });
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to load subscription data.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription) return;

    if (!confirm('Are you sure you want to cancel your subscription? You will lose access at the end of your current billing period.')) {
      return;
    }

    setCancelling(true);
    try {
      await subscriptionApi.cancelSubscription(subscription.id);

      toast({
        title: 'Subscription Cancelled',
        description: 'Your subscription has been cancelled successfully.',
      });

      fetchSubscriptionData();
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to cancel subscription.',
        variant: 'destructive',
      });
    } finally {
      setCancelling(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'trial':
        return <Badge className="bg-blue-500">Trial</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      case 'expired':
        return <Badge variant="secondary">Expired</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getUsagePercentage = (used: number, limit: number) => {
    return Math.round((used / limit) * 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>No Active Subscription</CardTitle>
            <CardDescription>You don't have an active subscription yet.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => navigate('/pricing')}>
              View Subscription Plans
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Subscription Management</h1>
            <p className="text-gray-600 mt-1">Manage your subscription and billing</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>

        {/* Current Subscription */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{subscription.plan_name} Plan</CardTitle>
                <CardDescription>Current subscription details</CardDescription>
              </div>
              {getStatusBadge(subscription.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-900">Amount</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">₹{subscription.amount.toLocaleString()}</p>
                <p className="text-xs text-blue-700 capitalize">per {subscription.billing_cycle}</p>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-semibold text-green-900">Start Date</span>
                </div>
                <p className="text-lg font-bold text-green-600">
                  {new Date(subscription.start_date).toLocaleDateString()}
                </p>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-semibold text-purple-900">End Date</span>
                </div>
                <p className="text-lg font-bold text-purple-600">
                  {new Date(subscription.end_date).toLocaleDateString()}
                </p>
              </div>

              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <RefreshCw className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm font-semibold text-yellow-900">Auto Renew</span>
                </div>
                <p className="text-lg font-bold text-yellow-600">
                  {subscription.auto_renew ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            </div>

            {subscription.is_trial && subscription.trial_ends_at && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-blue-900">Trial Period Active</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Your trial ends on {new Date(subscription.trial_ends_at).toLocaleDateString()}. 
                      You will be charged ₹{subscription.amount} on that date.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <Button onClick={() => navigate('/pricing')}>
                Upgrade Plan
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancelSubscription}
                disabled={cancelling || subscription.status === 'cancelled'}
              >
                {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Usage Statistics */}
        {usage && (
          <Card>
            <CardHeader>
              <CardTitle>Resource Usage</CardTitle>
              <CardDescription>Current usage vs plan limits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Students */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-gray-600" />
                      <span className="font-semibold">Students</span>
                    </div>
                    <span className={`text-sm font-semibold ${getUsageColor(getUsagePercentage(usage.students_count, subscription.max_students))}`}>
                      {usage.students_count} / {subscription.max_students} ({getUsagePercentage(usage.students_count, subscription.max_students)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2" aria-label="Student usage progress">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${getUsagePercentage(usage.students_count, subscription.max_students)}%` }}
                    />
                  </div>
                </div>

                {/* Teachers */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-gray-600" />
                      <span className="font-semibold">Teachers</span>
                    </div>
                    <span className={`text-sm font-semibold ${getUsageColor(getUsagePercentage(usage.teachers_count, subscription.max_teachers))}`}>
                      {usage.teachers_count} / {subscription.max_teachers} ({getUsagePercentage(usage.teachers_count, subscription.max_teachers)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2" aria-label="Teacher usage progress">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${getUsagePercentage(usage.teachers_count, subscription.max_teachers)}%` }}
                    />
                  </div>
                </div>

                {/* Classes */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-gray-600" />
                      <span className="font-semibold">Classes</span>
                    </div>
                    <span className={`text-sm font-semibold ${getUsageColor(getUsagePercentage(usage.classes_count, subscription.max_classes))}`}>
                      {usage.classes_count} / {subscription.max_classes} ({getUsagePercentage(usage.classes_count, subscription.max_classes)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2" aria-label="Classes usage progress">
                    <div
                      className="bg-purple-500 h-2 rounded-full transition-all"
                      style={{ width: `${getUsagePercentage(usage.classes_count, subscription.max_classes)}%` }}
                    />
                  </div>
                </div>

                {/* Storage */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <HardDrive className="w-5 h-5 text-gray-600" />
                      <span className="font-semibold">Storage</span>
                    </div>
                    <span className={`text-sm font-semibold ${getUsageColor(getUsagePercentage(usage.storage_used_gb, subscription.storage_limit_gb))}`}>
                      {usage.storage_used_gb} GB / {subscription.storage_limit_gb} GB ({getUsagePercentage(usage.storage_used_gb, subscription.storage_limit_gb)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2" aria-label="Storage usage progress">
                    <div
                      className="bg-yellow-500 h-2 rounded-full transition-all"
                      style={{ width: `${getUsagePercentage(usage.storage_used_gb, subscription.storage_limit_gb)}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment History */}
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>Recent transactions and payments</CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No transactions yet</p>
            ) : (
              <div className="space-y-3">
                {transactions.map((txn) => (
                  <div
                    key={txn.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {txn.status === 'completed' ? (
                        <CheckCircle2 className="w-8 h-8 text-green-500" />
                      ) : txn.status === 'failed' ? (
                        <XCircle className="w-8 h-8 text-red-500" />
                      ) : (
                        <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
                      )}
                      <div>
                        <p className="font-semibold">₹{txn.amount.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(txn.created_at).toLocaleDateString()} - {txn.payment_method}
                        </p>
                        <p className="text-xs text-gray-400">ID: {txn.transaction_id}</p>
                      </div>
                    </div>
                    <Badge variant={txn.status === 'completed' ? 'default' : 'destructive'}>
                      {txn.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SubscriptionManagementPage;


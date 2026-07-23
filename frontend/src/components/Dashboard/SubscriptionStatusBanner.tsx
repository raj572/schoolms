import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle2, Clock, RefreshCw } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

interface SubscriptionInfo {
  hasSubscription: boolean;
  status?: string;
  planName?: string;
  expiryDate?: string;
}

export const SubscriptionStatusBanner = () => {
  const { authUser } = useAuthStore();
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptionStatus();
  }, [authUser?.school_id]);

  const fetchSubscriptionStatus = async () => {
    if (!authUser || authUser.role !== 'principal' || !authUser.school_id) {
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/principal/subscription/status`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status && response.data.data) {
        setSubscriptionInfo(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching subscription status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !subscriptionInfo) return null;

  // Don't show banner if subscription is active
  if (subscriptionInfo.hasSubscription && subscriptionInfo.status === 'active') {
    return null;
  }

  // Trial subscription
  if (subscriptionInfo.status === 'trial') {
    return (
      <Card className="border-primary/30 bg-primary/10">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">Trial Period Active</h3>
              <p className="text-sm text-muted-foreground mt-1">
                You're currently on a trial subscription. 
                {subscriptionInfo.expiryDate && (
                  <> Expires on {new Date(subscriptionInfo.expiryDate).toLocaleDateString()}.</>
                )}
              </p>
            </div>
            <Button size="sm" variant="outline" className="border-primary/30 text-primary hover:bg-primary/10">
              Upgrade
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No subscription or expired
  return (
    <Card className="border-destructive/30 bg-destructive/10">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">Subscription Required</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Your school doesn't have an active subscription. Please contact your Administrator 
              to activate a subscription plan for full access to all features.
            </p>
            {authUser?.administrator_id && (
              <p className="text-xs text-muted-foreground mt-2">
                Administrator ID: <strong className="text-foreground">#{authUser.administrator_id}</strong>
              </p>
            )}
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            className="border-destructive/30 hover:bg-destructive/10"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Refresh
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};


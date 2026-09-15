import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { Loader2, AlertTriangle, Phone, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuthStore';
import axios from 'axios';

import { API_BASE_URL } from '@/lib/axios';

interface SubscriptionStatus {
  hasSubscription: boolean;
  status?: string;
  planName?: string;
  expiryDate?: string;
  administratorEmail?: string;
}

const PrincipalSubscriptionCheck: React.FC = () => {
  const location = useLocation();
  const { authUser } = useAuthStore();
  const [checking, setChecking] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkSubscription();
  }, [authUser?.school_id]);

  const checkSubscription = async () => {
    // Support both principal and librarian roles
    if (!authUser || (authUser.role !== 'principal' && authUser.role !== 'librarian')) {
      setChecking(false);
      return;
    }

    if (!authUser.school_id) {
      setSubscriptionStatus({
        hasSubscription: false,
      });
      setChecking(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // Try the subscription status endpoint (now supports both principal and librarian)
      const response = await axios.get(
        `${API_BASE_URL}/principal/subscription/status`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status && response.data.data) {
        const data = response.data.data;
        setSubscriptionStatus({
          hasSubscription: data.hasSubscription,
          status: data.status,
          planName: data.planName,
          expiryDate: data.expiryDate,
        });
      } else {
        setSubscriptionStatus({
          hasSubscription: false,
        });
      }
    } catch (err: any) {
      console.error('Error checking subscription:', err);
      
      // If unauthorized (403), check localStorage as fallback
      if (err.response?.status === 403) {
        const subscriptionActive = localStorage.getItem('subscription_active') === 'true';
        if (subscriptionActive || authUser?.subscription_active) {
          setSubscriptionStatus({
            hasSubscription: true,
            status: 'active',
          });
          setChecking(false);
          return;
        }
      }
      
      // If the response indicates no subscription, it's not an error
      if (err.response?.data?.data?.hasSubscription === false) {
        setSubscriptionStatus({
          hasSubscription: false,
          status: err.response.data.data.status,
        });
      } else {
        // Try fallback: check localStorage
        const subscriptionActive = localStorage.getItem('subscription_active') === 'true';
        if (subscriptionActive || authUser?.subscription_active) {
          setSubscriptionStatus({
            hasSubscription: true,
            status: 'active',
          });
        } else {
          setError('Failed to check subscription status');
        }
      }
    } finally {
      setChecking(false);
    }
  };

  // Loading state
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Checking subscription status...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="w-6 h-6" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} className="bg-primary text-primary-foreground hover:bg-primary/90">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if subscription is active
  if (!subscriptionStatus?.hasSubscription) {
    // Show the subscription required message
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-2xl shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-10 h-10 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Subscription Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-3">
              <p className="text-lg text-foreground">
                Your school's subscription is not active.
              </p>
              <p className="text-muted-foreground">
                To access this feature, your school needs an active subscription plan.
              </p>
            </div>

            <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Phone className="w-5 h-5 text-primary" />
                What should I do?
              </h3>
              <div className="space-y-3 text-foreground">
                <p className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-sm font-semibold text-primary">
                    1
                  </span>
                  <span>
                    Contact your school's <strong>Administrator</strong> who manages the subscription
                  </span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-sm font-semibold text-primary">
                    2
                  </span>
                  <span>
                    Request them to activate or renew the subscription plan
                  </span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-sm font-semibold text-primary">
                    3
                  </span>
                  <span>
                    Once activated, you'll have full access to all features
                  </span>
                </p>
              </div>
            </div>

            {authUser?.administrator_id && (
              <div className="bg-muted border border-border rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  Administrator Contact
                </h4>
                <p className="text-sm text-muted-foreground">
                  Your administrator's ID: <strong className="text-foreground">#{authUser.administrator_id}</strong>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Please reach out to them for subscription assistance.
                </p>
              </div>
            )}

            <div className="flex justify-center gap-4 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  const dashboardPath = authUser?.role === 'librarian' ? '/librarian/dashboard' : '/principal/dashboard';
                  window.location.href = dashboardPath;
                }}
              >
                Go to Dashboard
              </Button>
              <Button
                onClick={() => window.location.reload()}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Refresh Status
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Subscription is active - render children
  return <Outlet />;
};

export default PrincipalSubscriptionCheck;


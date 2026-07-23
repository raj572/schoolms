import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface RequireSubscriptionProps {
  children: React.ReactNode;
  allowDashboardAccess?: boolean; // Allow dashboard even without subscription
}

const RequireSubscription: React.FC<RequireSubscriptionProps> = ({ 
  children, 
  allowDashboardAccess = false 
}) => {
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [schoolSetupCompleted, setSchoolSetupCompleted] = useState(false);
  const [subscriptionActive, setSubscriptionActive] = useState(false);

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = () => {
    const token = localStorage.getItem('token');
    const emailVerifiedStatus = localStorage.getItem('email_verified') === 'true';
    const schoolSetupStatus = localStorage.getItem('school_setup_completed') === 'true';
    const subscriptionStatus = localStorage.getItem('subscription_active') === 'true';

    setIsAuthenticated(!!token);
    setEmailVerified(emailVerifiedStatus);
    setSchoolSetupCompleted(schoolSetupStatus);
    setSubscriptionActive(subscriptionStatus);
    setChecking(false);
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Checking access...</p>
        </div>
      </div>
    );
  }

  // Check authentication
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Email verification removed - all users are auto-verified
  // Removed: if (!emailVerified) redirect to /verify-email

  // If allowDashboardAccess is true, allow access even without full setup
  // (The dashboard will show the SetupProgressBanner)
  if (allowDashboardAccess) {
    return <>{children}</>;
  }

  // For non-dashboard routes, enforce full subscription
  // Check school setup
  if (!schoolSetupCompleted) {
    return <Navigate to="/school-setup" state={{ from: location }} replace />;
  }

  // Check subscription
  if (!subscriptionActive) {
    return <Navigate to="/pricing" state={{ from: location }} replace />;
  }

  // All checks passed, render children
  return <>{children}</>;
};

export default RequireSubscription;


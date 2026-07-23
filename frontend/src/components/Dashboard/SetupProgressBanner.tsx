import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, AlertCircle, ArrowRight, Building2, CreditCard } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { getCompleteSchoolInfo } from '@/services/schoolInfoService';

interface SchoolInfo {
  id: number;
  name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
}

export const SetupProgressBanner = () => {
  const navigate = useNavigate();
  const { authUser } = useAuthStore();
  const [setupStatus, setSetupStatus] = useState({
    emailVerified: false,
    schoolSetup: false,
    schoolFieldsComplete: false,
    subscription: false,
    isComplete: false,
    progress: 0,
    nextStep: '',
    missingFields: [] as string[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authUser) return;

    // Only show for administrator role
    if (authUser.role !== 'administrator') {
      setLoading(false);
      setSetupStatus(prev => ({ ...prev, isComplete: true }));
      return;
    }

    checkSetupStatus();
  }, [authUser]);

  const checkSetupStatus = async () => {
    if (!authUser) return;

    try {
      setLoading(true);

      // Get status from authUser data
      const emailVerified = authUser.email_verified === true;
      const subscription = authUser.subscription_active === true;
      let schoolSetup = authUser.school_setup_completed === true;
      let schoolFieldsComplete = false;
      let missingFields: string[] = [];

      // If school_setup_completed is true and we have a school_id, verify required fields are filled
      if (schoolSetup && authUser.school_id) {
        try {
          const response = await getCompleteSchoolInfo(Number(authUser.school_id));
          
          if (response.status && response.data) {
            const school: SchoolInfo = response.data;
            
            // Check required fields
            const requiredFields = [
              { field: 'name', label: 'School Name' },
              { field: 'email', label: 'School Email' },
              { field: 'phone', label: 'Phone Number' },
              { field: 'address', label: 'Address' },
              { field: 'city', label: 'City' },
              { field: 'state', label: 'State' },
              { field: 'pincode', label: 'Pincode' },
            ];

            missingFields = requiredFields
              .filter(({ field }) => !school[field as keyof SchoolInfo])
              .map(({ label }) => label);

            schoolFieldsComplete = missingFields.length === 0;
            
            // If fields are incomplete, mark schoolSetup as false
            if (!schoolFieldsComplete) {
              schoolSetup = false;
            }
          }
        } catch (error) {
          console.error('Error fetching school info:', error);
          // If we can't fetch school info, assume setup is incomplete
          schoolFieldsComplete = false;
          schoolSetup = false;
        }
      } else if (schoolSetup && !authUser.school_id) {
        // Administrator role: school_id is not on their user record (they own schools via administrator_id).
        // Trust school_setup_completed flag directly — no per-field validation needed.
        schoolFieldsComplete = true;
      }

      // Calculate progress
      let progress = 0;
      if (emailVerified) progress += 33;
      if (schoolSetup && schoolFieldsComplete) progress += 33;
      if (subscription) progress += 34;

      // Determine next step
      let nextStep = '';
      if (!schoolSetup || !schoolFieldsComplete) {
        nextStep = 'school-setup';
      } else if (!subscription) {
        nextStep = 'subscription';
      }

      const isComplete = emailVerified && schoolSetup && schoolFieldsComplete && subscription;

      setSetupStatus({
        emailVerified,
        schoolSetup,
        schoolFieldsComplete,
        subscription,
        isComplete,
        progress,
        nextStep,
        missingFields,
      });
    } catch (error) {
      console.error('Error checking setup status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContinueSetup = () => {
    if (!setupStatus.schoolSetup || !setupStatus.schoolFieldsComplete) {
      navigate('/school-setup');
    } else if (!setupStatus.subscription) {
      navigate('/choose-plan');
    }
  };

  // Don't show banner if setup is complete or still loading
  if (loading || setupStatus.isComplete) {
    return null;
  }

  // Only show for administrators
  if (authUser?.role !== 'administrator') {
    return null;
  }

  return (
    <Card className="mb-6 border-l-4 border-l-orange-500 bg-gradient-to-r from-orange-50 to-white dark:from-slate-900 dark:to-slate-800/50">
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-500" />
              <h3 className="text-lg font-semibold text-foreground">
                Complete Your Setup
              </h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {setupStatus.missingFields.length > 0 
                ? `Please complete the following fields: ${setupStatus.missingFields.join(', ')}`
                : "You're almost there! Complete your setup to unlock all features."}
            </p>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">
                  Setup Progress
                </span>
                <span className="text-sm font-semibold text-orange-600 dark:text-orange-500">
                  {setupStatus.progress}%
                </span>
              </div>
              <Progress value={setupStatus.progress} className="h-2" />
            </div>

            {/* Checklist */}
            <div className="space-y-2 mb-4">
              {/* Email Verification */}
              <div className="flex items-center gap-3">
                {setupStatus.emailVerified ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-500 flex-shrink-0" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 flex-shrink-0" />
                )}
                <span className={setupStatus.emailVerified ? 'text-muted-foreground line-through' : 'text-foreground font-medium'}>
                  Verify Email Address
                </span>
              </div>

              {/* School Setup */}
              <div className="flex items-center gap-3">
                {setupStatus.schoolSetup && setupStatus.schoolFieldsComplete ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-500 flex-shrink-0" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-orange-500 flex-shrink-0" />
                )}
                <span className={setupStatus.schoolSetup && setupStatus.schoolFieldsComplete ? 'text-muted-foreground line-through' : 'text-foreground font-medium'}>
                  Complete School Setup {setupStatus.missingFields.length > 0 && `(${setupStatus.missingFields.length} fields missing)`}
                </span>
                {(!setupStatus.schoolSetup || !setupStatus.schoolFieldsComplete) && (
                  <span 
                    onClick={handleContinueSetup}
                    className="ml-auto text-xs text-orange-600 dark:text-orange-500 font-semibold cursor-pointer hover:underline transition-all"
                  >
                    ← Next Step
                  </span>
                )}
              </div>

              {/* Subscription */}
              <div className="flex items-center gap-3">
                {setupStatus.subscription ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-500 flex-shrink-0" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 flex-shrink-0" />
                )}
                <span className={setupStatus.subscription ? 'text-muted-foreground line-through' : 'text-foreground font-medium'}>
                  Subscribe to a Plan
                </span>
                {setupStatus.schoolSetup && setupStatus.schoolFieldsComplete && !setupStatus.subscription && (
                  <span 
                    onClick={handleContinueSetup}
                    className="ml-auto text-xs text-orange-600 dark:text-orange-500 font-semibold cursor-pointer hover:underline transition-all"
                  >
                    ← Next Step
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex flex-col gap-2">
            <Button
              onClick={handleContinueSetup}
              className="whitespace-nowrap"
              size="lg"
            >
              {setupStatus.nextStep === 'school-setup' ? (
                <>
                  <Building2 className="mr-2 h-4 w-4" />
                  Setup School
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Choose Plan
                </>
              )}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              {(setupStatus.schoolSetup && setupStatus.schoolFieldsComplete) ? '15-day free trial' : 'Takes 2 minutes'}
            </p>
          </div>
        </div>

        {/* Benefits Preview */}
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground mb-2">
            <strong>After completing setup, you'll get:</strong>
          </p>
          <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-green-600 dark:text-green-500" />
              Full Dashboard Access
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-green-600 dark:text-green-500" />
              Student Management
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-green-600 dark:text-green-500" />
              15-Day Free Trial
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SetupProgressBanner;


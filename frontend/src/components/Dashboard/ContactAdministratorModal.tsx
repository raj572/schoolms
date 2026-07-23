import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Phone, Mail, MessageSquare, Loader2, ChevronRight, ChevronLeft, User, Check } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useEffect, useState } from 'react';
import { getAdministratorDetails, requestSubscription } from '@/services/administratorApiService';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface AdministratorInfo {
  full_name: string;
  email: string;
  phone?: string;
}

interface ContactAdministratorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactAdministratorModal = ({ isOpen, onClose }: ContactAdministratorModalProps) => {
  const { authUser } = useAuthStore();
  const [administratorInfo, setAdministratorInfo] = useState<AdministratorInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [notificationSent, setNotificationSent] = useState(false);
  const [sendingNotification, setSendingNotification] = useState(false);

  useEffect(() => {
    if (isOpen && authUser?.administrator_id) {
      fetchAdministratorDetails();
      setCurrentStep(0); // Reset to first step when opening
      setNotificationSent(false); // Reset notification status
    }
  }, [isOpen, authUser?.administrator_id]);

  const fetchAdministratorDetails = async () => {
    if (!authUser?.administrator_id) return;
    
    setLoading(true);
    try {
      const response = await getAdministratorDetails(authUser.administrator_id);
      if (response.status && response.data) {
        setAdministratorInfo({
          full_name: response.data.full_name,
          email: response.data.email,
          phone: response.data.phone,
        });
      }
    } catch (error) {
      console.error('Error fetching administrator details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = async () => {
    if (administratorInfo?.phone) {
      // Send notification to administrator
      await sendSubscriptionRequest('call');
      window.location.href = `tel:${administratorInfo.phone}`;
    } else {
      alert('Phone number not available. Please use email instead.');
    }
  };

  const handleEmail = async () => {
    // Send notification to administrator
    await sendSubscriptionRequest('email');
    
    const email = administratorInfo?.email || authUser?.email || 'admin@school.com';
    const subject = encodeURIComponent('Request for Subscription Activation');
    window.location.href = `mailto:${email}?subject=${subject}`;
  };

  const handleMessage = async () => {
    // Send notification to administrator
    await sendSubscriptionRequest('message');
    alert('Your subscription request has been sent to the administrator.');
  };

  const sendSubscriptionRequest = async (method: string) => {
    try {
      const response = await requestSubscription();
      if (response.status) {
        console.log('Subscription request sent successfully:', method);
        return true;
      } else {
        console.error('Failed to send subscription request');
        return false;
      }
    } catch (error) {
      console.error('Error sending subscription request:', error);
      return false;
    }
  };

  const handleSendNotification = async () => {
    setSendingNotification(true);
    try {
      const success = await sendSubscriptionRequest('notification');
      if (success) {
        setNotificationSent(true);
        toast.success('Subscription request notification sent to your administrator!');
      } else {
        toast.error('Failed to send notification. Please try again.');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Failed to send notification. Please try again.');
    } finally {
      setSendingNotification(false);
    }
  };

  const steps = [
    { number: 1, label: 'Contact Info', icon: User },
    { number: 2, label: 'Contact Method', icon: Phone },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderContactInfo();
      case 1:
        return renderContactMethods();
      default:
        return renderContactInfo();
    }
  };

  const renderContactInfo = () => (
    <div className="space-y-4">
      {/* Info Box */}
      <div className="bg-primary/10 border-l-4 border-primary p-3 rounded">
        <p className="text-xs sm:text-sm text-foreground">
          <strong>Why subscription is needed:</strong> Your school needs an active subscription to access 
          dashboard features, student management, reports, and more.
        </p>
      </div>

      {/* Administrator Info */}
      {loading ? (
        <div className="bg-muted border border-border rounded-lg p-6">
          <div className="flex flex-col items-center justify-center py-4">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Loading administrator details...</p>
          </div>
        </div>
      ) : administratorInfo ? (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/20 rounded-full">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Your Administrator</p>
              <p className="text-base font-semibold text-foreground">{administratorInfo.full_name}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-green-600" />
              <span className="text-foreground">{administratorInfo.email}</span>
            </div>
            {administratorInfo.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-primary" />
                <span className="text-foreground">{administratorInfo.phone}</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
          <p className="text-sm text-destructive">Administrator information not available</p>
        </div>
      )}

      {/* Features Preview */}
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2 text-xs">
          <Check className="w-4 h-4 text-green-600" />
          <span className="text-foreground">Dashboard</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Check className="w-4 h-4 text-green-600" />
          <span className="text-foreground">Reports</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Check className="w-4 h-4 text-green-600" />
          <span className="text-foreground">Students</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Check className="w-4 h-4 text-green-600" />
          <span className="text-foreground">Teachers</span>
        </div>
      </div>

      {/* Send Notification Button */}
      {!notificationSent ? (
        <Button
          onClick={handleSendNotification}
          disabled={sendingNotification}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {sendingNotification ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending Notification...
            </>
          ) : (
            <>
              <AlertTriangle className="mr-2 h-4 w-4" />
              Send Notification to Administrator
            </>
          )}
        </Button>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
          <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-green-900">Notification Sent!</p>
            <p className="text-xs text-green-700">Your administrator has been notified</p>
          </div>
        </div>
      )}
    </div>
  );

  const renderContactMethods = () => (
    <div className="space-y-3">
      <p className="text-sm font-medium text-foreground text-center mb-4">
        Choose how you want to contact your administrator:
      </p>

      <Button
        variant="outline"
        className="w-full justify-start h-auto py-3 px-4 hover:bg-green-50 hover:border-green-300 transition-all"
        onClick={handleEmail}
      >
        <Mail className="mr-3 h-5 w-5 text-green-600 flex-shrink-0" />
        <div className="text-left flex-1 min-w-0">
          <p className="font-semibold text-foreground">Send Email</p>
          <p className="text-xs text-muted-foreground">Compose and send an email</p>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </Button>

      <Button
        variant="outline"
        className="w-full justify-start h-auto py-3 px-4 hover:bg-primary/10 hover:border-primary/30 transition-all"
        onClick={handleCall}
      >
        <Phone className="mr-3 h-5 w-5 text-primary flex-shrink-0" />
        <div className="text-left flex-1 min-w-0">
          <p className="font-semibold text-foreground">Make a Call</p>
          <p className="text-xs text-muted-foreground">Call on phone</p>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </Button>

      <Button
        variant="outline"
        className="w-full justify-start h-auto py-3 px-4 hover:bg-primary/10 hover:border-primary/30 transition-all"
        onClick={handleMessage}
      >
        <MessageSquare className="mr-3 h-5 w-5 text-primary flex-shrink-0" />
        <div className="text-left flex-1 min-w-0">
          <p className="font-semibold text-foreground">Send Message</p>
          <p className="text-xs text-muted-foreground">Internal messaging (Coming soon)</p>
        </div>
        <Badge variant="secondary" className="text-xs">Soon</Badge>
      </Button>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-w-[90vw] w-full mx-4">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-destructive/20 rounded-lg flex-shrink-0">
              <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-destructive" />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-base sm:text-lg text-foreground">Subscription Required</DialogTitle>
              <DialogDescription className="mt-1 text-xs text-muted-foreground">
                Contact administrator to activate features
              </DialogDescription>
            </div>
          </div>

          {/* Step Indicators */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : isCompleted
                          ? 'bg-green-600 text-white'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <StepIcon className="h-4 w-4" />
                      )}
                    </div>
                    <div className="ml-2 hidden sm:block">
                      <p className={`text-xs font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                        {step.label}
                      </p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-3 ${
                      index < currentStep ? 'bg-green-600' : 'bg-muted'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </DialogHeader>

        {/* Step Content */}
        <div className="py-4 max-h-[50vh] overflow-y-auto">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 border-t border-border pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <div className="flex gap-2 w-full sm:w-auto">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={handlePrevious}
                className="flex-1 sm:flex-none"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
            )}
            {currentStep < steps.length - 1 ? (
              <Button
                onClick={handleNext}
                className="flex-1 sm:flex-none bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleEmail}
                className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700"
              >
                <Mail className="mr-2 h-4 w-4" />
                Send Email
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ContactAdministratorModal;

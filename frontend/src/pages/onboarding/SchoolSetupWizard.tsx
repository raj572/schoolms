import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { subscriptionApi } from '@/services/subscriptionApiService';
import { Building2, MapPin, Phone, Mail, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';

interface SchoolFormData {
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  website: string;
  affiliation_number: string;
  school_code: string;
  established_year: string;
  board: string;
  school_type: string;
  description: string;
}

const SchoolSetupWizard: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<SchoolFormData>({
    name: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    email: '',
    website: '',
    affiliation_number: '',
    school_code: '',
    established_year: '',
    board: 'CBSE',
    school_type: 'Private',
    description: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.name || !formData.email || !formData.phone) {
          toast({
            title: 'Validation Error',
            description: 'Please fill in all required fields for basic information.',
            variant: 'destructive',
          });
          return false;
        }
        break;
      case 2:
        if (!formData.address || !formData.city || !formData.state || !formData.pincode) {
          toast({
            title: 'Validation Error',
            description: 'Please fill in all required address fields.',
            variant: 'destructive',
          });
          return false;
        }
        break;
      case 3:
        // No validation needed for this step anymore
        break;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        toast({
          title: 'Error',
          description: 'User ID not found. Please log in again.',
          variant: 'destructive',
        });
        navigate('/login');
        return;
      }

      await subscriptionApi.setupSchool(parseInt(userId), formData);

      toast({
        title: 'Success!',
        description: 'School setup completed successfully.',
      });

      // Navigate to pricing page to select subscription
      navigate('/pricing');
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to setup school. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((step) => (
        <React.Fragment key={step}>
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
              step === currentStep
                ? 'border-primary bg-primary text-white'
                : step < currentStep
                ? 'border-green-500 bg-green-500 text-white'
                : 'border-gray-300 text-gray-400'
            }`}
          >
            {step < currentStep ? <CheckCircle2 className="w-5 h-5" /> : step}
          </div>
          {step < 3 && (
            <div
              className={`w-16 h-1 transition-colors ${
                step < currentStep ? 'bg-green-500' : 'bg-gray-300'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Building2 className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Basic Information</h3>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">School Name *</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Enter school name"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">School Email *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="school@example.com"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="+91 XXXXXXXXXX"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="board">Board</Label>
          <select
            id="board"
            name="board"
            value={formData.board}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Select school board"
          >
            <option value="CBSE">CBSE</option>
            <option value="ICSE">ICSE</option>
            <option value="State Board">State Board</option>
            <option value="IB">IB</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="school_type">School Type</Label>
          <select
            id="school_type"
            name="school_type"
            value={formData.school_type}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Select school type"
          >
            <option value="Private">Private</option>
            <option value="Government">Government</option>
            <option value="Semi-Government">Semi-Government</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="established_year">Established Year</Label>
          <Input
            id="established_year"
            name="established_year"
            type="number"
            value={formData.established_year}
            onChange={handleInputChange}
            placeholder="YYYY"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            name="website"
            type="url"
            value={formData.website}
            onChange={handleInputChange}
            placeholder="https://www.example.com"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Brief description about your school"
          rows={3}
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Address Details</h3>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address *</Label>
        <Textarea
          id="address"
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          placeholder="Enter complete address"
          required
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            placeholder="Enter city"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">State *</Label>
          <Input
            id="state"
            name="state"
            value={formData.state}
            onChange={handleInputChange}
            placeholder="Enter state"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="pincode">Pincode *</Label>
        <Input
          id="pincode"
          name="pincode"
          value={formData.pincode}
          onChange={handleInputChange}
          placeholder="Enter pincode"
          required
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Mail className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Additional Information (Optional)</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="affiliation_number">Affiliation Number</Label>
          <Input
            id="affiliation_number"
            name="affiliation_number"
            value={formData.affiliation_number}
            onChange={handleInputChange}
            placeholder="Enter affiliation number"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="school_code">School Code</Label>
          <Input
            id="school_code"
            name="school_code"
            value={formData.school_code}
            onChange={handleInputChange}
            placeholder="Enter school code"
          />
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <h4 className="font-semibold text-blue-900 mb-2">Review Your Information</h4>
        <p className="text-sm text-blue-700">
          Please review all the information you've entered. You can go back to previous steps to make changes if needed.
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">School Setup Wizard</CardTitle>
            <CardDescription className="text-center">
              Complete the following steps to set up your school profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderStepIndicator()}

            <div className="mt-8">
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
            </div>

            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1 || isSubmitting}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              {currentStep < 3 ? (
                <Button onClick={handleNext} disabled={isSubmitting}>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Complete Setup'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SchoolSetupWizard;


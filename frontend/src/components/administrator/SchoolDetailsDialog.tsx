import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { School, getSchoolById } from '@/services/administratorApiService';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  User,
  Calendar,
  Globe,
  FileText,
  Award,
  Loader2,
  CreditCard,
} from 'lucide-react';

interface SchoolDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schoolId: number | null;
}

export default function SchoolDetailsDialog({
  open,
  onOpenChange,
  schoolId,
}: SchoolDetailsDialogProps) {
  const { toast } = useToast();
  const [school, setSchool] = useState<School | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (schoolId && open) {
      fetchSchoolDetails();
    }
  }, [schoolId, open]);

  const fetchSchoolDetails = async () => {
    if (!schoolId) return;
    
    setIsLoading(true);
    try {
      const response = await getSchoolById(schoolId);
      if (response.status && response.data) {
        setSchool(response.data);
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to fetch school details',
        });
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to fetch school details',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!school) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex gap-4">
              <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-2xl">{school.name}</DialogTitle>
                <DialogDescription className="mt-1">
                  {school.school_code && `Code: ${school.school_code}`}
                </DialogDescription>
              </div>
            </div>
            <Badge
              className={
                school.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }
            >
              {school.status}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {school.board && (
                <div className="flex items-start gap-2">
                  <Award className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Board</p>
                    <p className="font-medium">{school.board}</p>
                  </div>
                </div>
              )}
              
              {school.affiliation_number && (
                <div className="flex items-start gap-2">
                  <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Affiliation Number</p>
                    <p className="font-medium">{school.affiliation_number}</p>
                  </div>
                </div>
              )}

              {school.established_date && (
                <div className="flex items-start gap-2">
                  <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Established</p>
                    <p className="font-medium">
                      {new Date(school.established_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}

              {school.website && (
                <div className="flex items-start gap-2">
                  <Globe className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Website</p>
                    <a
                      href={school.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-primary hover:underline"
                    >
                      {school.website}
                    </a>
                  </div>
                </div>
              )}
            </div>

            {school.description && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-1">Description</p>
                <p className="text-gray-700">{school.description}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-2">
                <Mail className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{school.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Phone className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{school.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-2 md:col-span-2">
                <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">
                    {school.address}, {school.city}, {school.state} - {school.pincode}
                    {school.country && `, ${school.country}`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Principal Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Principal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {school.principal_name && (
                <div className="flex items-start gap-2">
                  <User className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{school.principal_name}</p>
                  </div>
                </div>
              )}

              {school.principal_email && (
                <div className="flex items-start gap-2">
                  <Mail className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{school.principal_email}</p>
                  </div>
                </div>
              )}

              {school.principal_phone && (
                <div className="flex items-start gap-2">
                  <Phone className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{school.principal_phone}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Subscription Information */}
          {(school.subscription_status || school.subscription_start_date || school.subscription_end_date) && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-3">Subscription Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {school.subscription_status && (
                    <div className="flex items-start gap-2">
                      <CreditCard className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <Badge
                          className={
                            school.subscription_status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : school.subscription_status === 'trial'
                              ? 'bg-blue-100 text-blue-800'
                              : school.subscription_status === 'expired'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }
                        >
                          {school.subscription_status}
                        </Badge>
                      </div>
                    </div>
                  )}

                  {school.subscription_start_date && (
                    <div className="flex items-start gap-2">
                      <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Start Date</p>
                        <p className="font-medium">
                          {new Date(school.subscription_start_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {school.subscription_end_date && (
                    <div className="flex items-start gap-2">
                      <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">End Date</p>
                        <p className="font-medium">
                          {new Date(school.subscription_end_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Metadata */}
          {(school.created_at || school.updated_at) && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-3">System Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {school.created_at && (
                    <div>
                      <p className="text-gray-500">Created At</p>
                      <p className="font-medium">
                        {new Date(school.created_at).toLocaleString()}
                      </p>
                    </div>
                  )}
                  {school.updated_at && (
                    <div>
                      <p className="text-gray-500">Last Updated</p>
                      <p className="font-medium">
                        {new Date(school.updated_at).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}


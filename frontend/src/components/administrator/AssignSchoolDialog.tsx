import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Principal,
  School,
  getAllSchools,
  assignPrincipalToSchool,
} from '@/services/administratorApiService';

interface AssignSchoolDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  principal: Principal | null;
  onSuccess: () => void;
}

export default function AssignSchoolDialog({
  open,
  onOpenChange,
  principal,
  onSuccess,
}: AssignSchoolDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('');

  useEffect(() => {
    if (open) {
      fetchSchools();
      setSelectedSchoolId('');
    }
  }, [open]);

  const fetchSchools = async () => {
    try {
      const response = await getAllSchools();
      console.log('Schools API response:', response);
      
      if (response.status && response.data) {
        // Filter only active schools
        const activeSchools = Array.isArray(response.data) 
          ? response.data.filter((school: School) => school.status === 'active')
          : [];
        console.log('Active schools:', activeSchools);
        setSchools(activeSchools);
      } else {
        console.error('Invalid response format:', response);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: response.message || 'Failed to fetch schools',
        });
      }
    } catch (error: any) {
      console.error('Error fetching schools:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to fetch schools',
      });
    }
  };

  const handleAssign = async () => {
    if (!principal || !selectedSchoolId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select a school',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await assignPrincipalToSchool(principal.id, parseInt(selectedSchoolId));
      console.log('Assign principal response:', response);

      if (response.status) {
        toast({
          title: 'Success',
          description: 'Principal assigned to school successfully',
        });
        onSuccess();
        onOpenChange(false);
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: response.message || 'Failed to assign principal to school',
        });
      }
    } catch (error: any) {
      console.error('Error assigning principal:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to assign principal to school',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!principal) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Assign Principal to School
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Principal Info */}
          <div className="bg-muted rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Assigning Principal</p>
            <p className="font-semibold">{principal.full_name}</p>
            <p className="text-sm text-muted-foreground">@{principal.username}</p>
          </div>

          {/* School Selection */}
          <div className="space-y-2">
            <Label htmlFor="school">
              Select School <span className="text-destructive">*</span>
            </Label>
            <Select value={selectedSchoolId} onValueChange={setSelectedSchoolId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a school" />
              </SelectTrigger>
              <SelectContent>
                {schools.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No active schools available
                  </div>
                ) : (
                  schools.map((school) => (
                    <SelectItem key={school.id} value={school.id.toString()}>
                      <div className="flex flex-col">
                        <span>{school.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {school.school_code} - {school.city}, {school.state}
                        </span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Only active schools are shown
            </p>
          </div>

          {/* Warning */}
          <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
            <p className="text-sm text-amber-900 dark:text-amber-100">
              <strong>Note:</strong> If the selected school already has a principal assigned, 
              they will be automatically unassigned.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={isLoading || !selectedSchoolId}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Assign to School
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


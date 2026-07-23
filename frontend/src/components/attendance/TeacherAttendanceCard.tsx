import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, Clock, User, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TeacherAttendanceCardProps {
  teacher: {
    id: number;
    name: string;
    email?: string;
    avatar?: string;
    subject?: string;
    designation?: string;
  };
  status: 'present' | 'absent' | 'late' | 'leave' | null;
  checkInTime?: string;
  checkOutTime?: string;
  onChange: (status: 'present' | 'absent' | 'late' | 'leave') => void;
  onTimeChange?: (field: 'check_in_time' | 'check_out_time', value: string) => void;
  disabled?: boolean;
  showDetails?: boolean;
}

export const TeacherAttendanceCard: React.FC<TeacherAttendanceCardProps> = ({
  teacher,
  status,
  checkInTime,
  checkOutTime,
  onChange,
  onTimeChange,
  disabled = false,
  showDetails = true,
}) => {
  const statusConfig = {
    present: {
      color: 'bg-emerald-500 hover:bg-emerald-600 text-white',
      icon: CheckCircle,
      label: 'Present',
      textColor: 'text-emerald-700',
      bgLight: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
    },
    absent: {
      color: 'bg-rose-500 hover:bg-rose-600 text-white',
      icon: XCircle,
      label: 'Absent',
      textColor: 'text-rose-700',
      bgLight: 'bg-rose-50',
      borderColor: 'border-rose-200',
    },
    late: {
      color: 'bg-amber-500 hover:bg-amber-600 text-white',
      icon: Clock,
      label: 'Late',
      textColor: 'text-amber-700',
      bgLight: 'bg-amber-50',
      borderColor: 'border-amber-200',
    },
    leave: {
      color: 'bg-blue-500 hover:bg-blue-600 text-white',
      icon: Calendar,
      label: 'Leave',
      textColor: 'text-blue-700',
      bgLight: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
  };

  return (
    <Card 
      className={cn(
        'transition-all duration-200 hover:shadow-md border-2',
        status && statusConfig[status].bgLight,
        status && statusConfig[status].borderColor
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            {teacher.avatar ? (
              <img
                src={teacher.avatar}
                alt={teacher.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-6 h-6 text-primary" />
            )}
          </div>

          {/* Teacher Info */}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-foreground truncate">
              {teacher.name}
            </h4>
            {showDetails && (
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {teacher.subject && (
                  <Badge variant="outline" className="text-xs">
                    {teacher.subject}
                  </Badge>
                )}
                {teacher.designation && (
                  <Badge variant="outline" className="text-xs">
                    {teacher.designation}
                  </Badge>
                )}
              </div>
            )}
            {teacher.email && (
              <p className="text-xs text-muted-foreground mt-1 truncate">
                {teacher.email}
              </p>
            )}
          </div>
        </div>

        {/* Attendance Buttons */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {(['present', 'absent', 'late', 'leave'] as const).map((btnStatus) => {
            const config = statusConfig[btnStatus];
            const Icon = config.icon;
            const isActive = status === btnStatus;

            return (
              <Button
                key={btnStatus}
                size="sm"
                variant={isActive ? 'default' : 'outline'}
                disabled={disabled}
                onClick={() => onChange(btnStatus)}
                className={cn(
                  'transition-all duration-200 text-xs',
                  isActive && `${config.color} border-transparent`,
                  !isActive && 'hover:border-muted-foreground/30'
                )}
              >
                <Icon className="w-3 h-3 mr-1" />
                <span className="font-medium">{config.label}</span>
              </Button>
            );
          })}
        </div>

        {/* Time Inputs (shown when Present) */}
        {status === 'present' && onTimeChange && (
          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-border">
            <div className="space-y-1">
              <Label htmlFor={`check-in-${teacher.id}`} className="text-xs text-muted-foreground">
                Check In
              </Label>
              <Input
                id={`check-in-${teacher.id}`}
                type="time"
                value={checkInTime || ''}
                onChange={(e) => onTimeChange('check_in_time', e.target.value)}
                disabled={disabled}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`check-out-${teacher.id}`} className="text-xs text-muted-foreground">
                Check Out
              </Label>
              <Input
                id={`check-out-${teacher.id}`}
                type="time"
                value={checkOutTime || ''}
                onChange={(e) => onTimeChange('check_out_time', e.target.value)}
                disabled={disabled}
                className="h-8 text-sm"
              />
            </div>
          </div>
        )}

        {/* Status Badge */}
        {status && (
          <div className="mt-3 text-center">
            <Badge
              variant="secondary"
              className={cn(
                'text-xs',
                statusConfig[status].textColor,
                statusConfig[status].bgLight
              )}
            >
              Marked as {statusConfig[status].label}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};


import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AttendanceCardProps {
  student: {
    id: number;
    name: string;
    roll_no?: string;
    avatar?: string;
    class?: string;
    section?: string;
  };
  status: 'present' | 'absent' | 'late' | 'half_day' | null;
  onChange: (status: 'present' | 'absent' | 'late') => void;
  disabled?: boolean;
  showDetails?: boolean;
}

export const AttendanceCard: React.FC<AttendanceCardProps> = ({
  student,
  status,
  onChange,
  disabled = false,
  showDetails = true,
}) => {
  const statusConfig = {
    present: {
      color: 'bg-primary hover:bg-primary/90',
      icon: CheckCircle,
      label: 'Present',
      textColor: 'text-primary',
      bgLight: 'bg-primary/5',
      borderColor: 'border-primary/20',
    },
    absent: {
      color: 'bg-destructive hover:bg-destructive/90',
      icon: XCircle,
      label: 'Absent',
      textColor: 'text-destructive',
      bgLight: 'bg-destructive/5',
      borderColor: 'border-destructive/20',
    },
    late: {
      color: 'bg-muted-foreground hover:bg-muted-foreground/90',
      icon: Clock,
      label: 'Late',
      textColor: 'text-muted-foreground',
      bgLight: 'bg-muted/50',
      borderColor: 'border-muted-foreground/20',
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
            {student.avatar ? (
              <img
                src={student.avatar}
                alt={student.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-6 h-6 text-primary" />
            )}
          </div>

          {/* Student Info */}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-foreground truncate">
              {student.name}
            </h4>
            {showDetails && (
              <div className="flex items-center gap-2 mt-1">
                {student.roll_no && (
                  <Badge variant="outline" className="text-xs">
                    Roll: {student.roll_no}
                  </Badge>
                )}
                {student.class && student.section && (
                  <Badge variant="outline" className="text-xs">
                    {student.class}-{student.section}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Attendance Buttons */}
        <div className="grid grid-cols-3 gap-2">
          {(['present', 'absent', 'late'] as const).map((btnStatus) => {
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
                  'transition-all duration-200',
                  isActive && `${config.color} text-white border-transparent`,
                  !isActive && 'hover:border-muted-foreground/30'
                )}
              >
                <Icon className="w-4 h-4 mr-1" />
                <span className="text-xs font-medium">{config.label}</span>
              </Button>
            );
          })}
        </div>

        {/* Status Badge */}
        {status && (
          <div className="mt-2 text-center">
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


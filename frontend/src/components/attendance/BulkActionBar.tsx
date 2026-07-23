import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Save, RotateCcw } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface BulkActionBarProps {
  totalStudents: number;
  markedCount: number;
  onMarkAllPresent: () => void;
  onMarkAllAbsent: () => void;
  onSave: () => void;
  onReset: () => void;
  isSaving?: boolean;
  hasChanges?: boolean;
}

export const BulkActionBar: React.FC<BulkActionBarProps> = ({
  totalStudents,
  markedCount,
  onMarkAllPresent,
  onMarkAllAbsent,
  onSave,
  onReset,
  isSaving = false,
  hasChanges = false,
}) => {
  const completionPercentage = totalStudents > 0
    ? Math.round((markedCount / totalStudents) * 100)
    : 0;

  return (
    <Card className="p-4 sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-border">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Stats */}
        <div className="flex items-center gap-4">
          <div>
            <p className="text-sm font-medium text-foreground">
              {markedCount} / {totalStudents} Marked
            </p>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">
                {completionPercentage}%
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onMarkAllPresent}
            disabled={isSaving}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200"
          >
            <CheckCircle className="w-4 h-4 mr-1" />
            Mark All Present
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={onMarkAllAbsent}
            disabled={isSaving}
            className="bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200"
          >
            <XCircle className="w-4 h-4 mr-1" />
            Mark All Absent
          </Button>

          {hasChanges && (
            <Button
              size="sm"
              variant="outline"
              onClick={onReset}
              disabled={isSaving}
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Reset
            </Button>
          )}

          <Button
            size="sm"
            onClick={onSave}
            disabled={!hasChanges || isSaving}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Save className="w-4 h-4 mr-1" />
            {isSaving ? 'Saving...' : 'Save Attendance'}
          </Button>
        </div>
      </div>
    </Card>
  );
};


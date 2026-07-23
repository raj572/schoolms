import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar, Search, X } from 'lucide-react';
import { format } from 'date-fns';

interface Class {
  id: number;
  class: string;
  section: string;
}

interface Subject {
  id: number;
  subject_name: string;
}

interface AttendanceFilterProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  selectedClass?: number;
  onClassChange: (classId: number | undefined) => void;
  selectedSubject?: number;
  onSubjectChange?: (subjectId: number | undefined) => void;
  selectedPeriod?: number;
  onPeriodChange?: (period: number | undefined) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  classes: Class[];
  subjects?: Subject[];
  showPeriodSelector?: boolean;
  showSubjectSelector?: boolean;
  showSearch?: boolean;
  onReset?: () => void;
}

export const AttendanceFilter: React.FC<AttendanceFilterProps> = ({
  selectedDate,
  onDateChange,
  selectedClass,
  onClassChange,
  selectedSubject,
  onSubjectChange,
  selectedPeriod,
  onPeriodChange,
  searchQuery = '',
  onSearchChange,
  classes,
  subjects = [],
  showPeriodSelector = false,
  showSubjectSelector = false,
  showSearch = true,
  onReset,
}) => {
  const periods = [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Date Picker */}
          <div className="space-y-2">
            <Label htmlFor="attendance-date" className="text-sm font-medium text-foreground">
              Date
            </Label>
            <div className="relative">
              <Input
                id="attendance-date"
                type="date"
                value={format(selectedDate, 'yyyy-MM-dd')}
                onChange={(e) => onDateChange(new Date(e.target.value))}
                className="w-full"
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Class Selector */}
          <div className="space-y-2">
            <Label htmlFor="class-select" className="text-sm font-medium text-foreground">
              Class
            </Label>
              <Select
                value={selectedClass?.toString() || 'all'}
                onValueChange={(value) => onClassChange(value === 'all' ? undefined : Number(value))}
              >
                <SelectTrigger id="class-select">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id.toString()}>
                      {cls.class} - {cls.section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
          </div>

          {/* Subject Selector */}
          {showSubjectSelector && onSubjectChange && (
            <div className="space-y-2">
              <Label htmlFor="subject-select" className="text-sm font-medium text-foreground">
                Subject
              </Label>
              <Select
                value={selectedSubject?.toString() || 'all'}
                onValueChange={(value) => onSubjectChange(value === 'all' ? undefined : Number(value))}
              >
                <SelectTrigger id="subject-select">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id.toString()}>
                      {subject.subject_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Period Selector */}
          {showPeriodSelector && onPeriodChange && (
            <div className="space-y-2">
              <Label htmlFor="period-select" className="text-sm font-medium text-foreground">
                Period
              </Label>
              <Select
                value={selectedPeriod?.toString() || 'all'}
                onValueChange={(value) => onPeriodChange(value === 'all' ? undefined : Number(value))}
              >
                <SelectTrigger id="period-select">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Periods</SelectItem>
                  {periods.map((period) => (
                    <SelectItem key={period} value={period.toString()}>
                      Period {period}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Search */}
          {showSearch && onSearchChange && (
            <div className="space-y-2">
              <Label htmlFor="student-search" className="text-sm font-medium text-foreground">
                Search Student
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="student-search"
                  type="text"
                  placeholder="Name or roll no..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-9 pr-9"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => onSearchChange('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Reset Button */}
        {onReset && (
          <div className="mt-4 flex justify-end">
            <Button variant="outline" size="sm" onClick={onReset}>
              <X className="w-4 h-4 mr-1" />
              Reset Filters
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};


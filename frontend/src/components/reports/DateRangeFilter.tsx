import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CalendarIcon } from 'lucide-react';

interface DateRangeFilterProps {
  startDate: Date;
  endDate: Date;
  onDateRangeChange: (start: Date, end: Date) => void;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  startDate,
  endDate,
  onDateRangeChange,
}) => {
  const setDateRange = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    onDateRangeChange(start, end);
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStart = new Date(e.target.value);
    if (!isNaN(newStart.getTime()) && newStart <= endDate) {
      onDateRangeChange(newStart, endDate);
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEnd = new Date(e.target.value);
    if (!isNaN(newEnd.getTime()) && newEnd >= startDate) {
      onDateRangeChange(startDate, newEnd);
    }
  };

  const presets = [
    { label: 'Last 7 days', days: 7 },
    { label: 'Last 30 days', days: 30 },
    { label: 'Last 3 months', days: 90 },
    { label: 'Last 6 months', days: 180 },
  ];

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
      {/* Quick Presets */}
      <div className="flex gap-2 flex-wrap">
        {presets.map((preset) => (
          <Button
            key={preset.days}
            variant="outline"
            size="sm"
            onClick={() => setDateRange(preset.days)}
          >
            {preset.label}
          </Button>
        ))}
      </div>

      {/* Custom Date Range */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          <Input
            type="date"
            value={startDate.toISOString().split('T')[0]}
            onChange={handleStartDateChange}
            className="w-[140px]"
          />
          <span className="text-muted-foreground">to</span>
          <Input
            type="date"
            value={endDate.toISOString().split('T')[0]}
            onChange={handleEndDateChange}
            className="w-[140px]"
          />
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, QrCode, Grid3x3, Zap } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import QuickMark from './QuickMark';
import PeriodWise from './PeriodWise';
import ClassWise from './ClassWise';
import QRCheckIn from './QRCheckIn';

const MarkAttendance: React.FC = () => {
  const { authUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('quick');

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Mark Attendance</h1>
        <p className="text-muted-foreground mt-1">
          Track student attendance efficiently with multiple marking methods
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto gap-2 bg-transparent">
          <TabsTrigger
            value="quick"
            className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Zap className="w-4 h-4" />
            <span className="hidden sm:inline">Quick Mark</span>
            <span className="sm:hidden">Quick</span>
          </TabsTrigger>
          <TabsTrigger
            value="period"
            className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">Period-wise</span>
            <span className="sm:hidden">Period</span>
          </TabsTrigger>
          <TabsTrigger
            value="class"
            className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Grid3x3 className="w-4 h-4" />
            <span className="hidden sm:inline">Class-wise</span>
            <span className="sm:hidden">Class</span>
          </TabsTrigger>
          <TabsTrigger
            value="qr"
            className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <QrCode className="w-4 h-4" />
            <span className="hidden sm:inline">QR Check-in</span>
            <span className="sm:hidden">QR</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quick" className="mt-6">
          <QuickMark />
        </TabsContent>

        <TabsContent value="period" className="mt-6">
          <PeriodWise />
        </TabsContent>

        <TabsContent value="class" className="mt-6">
          <ClassWise />
        </TabsContent>

        <TabsContent value="qr" className="mt-6">
          <QRCheckIn />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarkAttendance;


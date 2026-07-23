import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Zap, List } from 'lucide-react';
import TeacherQuickMark from './TeacherQuickMark';
import TeacherDetailedView from './TeacherDetailedView';

const TeacherAttendance: React.FC = () => {
  const [activeTab, setActiveTab] = useState('quick');

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Teacher Attendance</h1>
        <p className="text-muted-foreground mt-1">
          Mark daily attendance for teaching staff with multiple marking methods
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-auto gap-2 bg-transparent">
          <TabsTrigger
            value="quick"
            className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Zap className="w-4 h-4" />
            <span className="hidden sm:inline">Quick Mark</span>
            <span className="sm:hidden">Quick</span>
          </TabsTrigger>
          <TabsTrigger
            value="detailed"
            className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">Detailed View</span>
            <span className="sm:hidden">Detailed</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quick" className="mt-6">
          <TeacherQuickMark />
        </TabsContent>

        <TabsContent value="detailed" className="mt-6">
          <TeacherDetailedView />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeacherAttendance;


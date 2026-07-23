import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  BookOpen, 
  FileText, 
  GraduationCap, 
  Calendar,
  User,
  Settings,
  Bell,
  Search,
  ChevronLeft,
  Plus,
  ChevronDown,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  BookOpenCheck,
  ClipboardList,
  Users,
  UserCheck,
  Eye
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from 'react-router-dom';

const MarkAttendance = () => {
  const sidebarItems = [
    { icon: BookOpen, label: 'Dashboard', active: true },
    { icon: FileText, label: 'Assignments' },
    { icon: BookOpenCheck, label: 'Study Materials' },
    { icon: ClipboardList, label: 'Online Exams' },
    { icon: BookOpen, label: 'Manage Subjects' },
    { icon: UserCheck, label: 'Promote Student' },
    { icon: ClipboardList, label: 'Assigned Tasks' },
    { icon: Users, label: 'My Contacts' },
  ];

  const attendanceData = [
    { day: 1, height: 60 },
    { day: 2, height: 45 },
    { day: 3, height: 70 },
    { day: 4, height: 50 },
    { day: 5, height: 80 },
    { day: 6, height: 90 },
    { day: 7, height: 55 },
    { day: 8, height: 40 },
    { day: 9, height: 85 },
    { day: 10, height: 75 },
    { day: 11, height: 95 },
    { day: 12, height: 65 },
  ];

  return (
    <div className="flex h-screen  overflow-hidden ">
     

      <div className="flex-1  w-full  ">
       

        <div className="px-6 py-6">
          <div className="flex items-center gap-2 mb-4">
            <ChevronLeft className="h-5 w-5 text-gray-600" />
            <h1 className="text-xl font-bold text-gray-900">Digital Electronics and Microprocessors</h1>
          </div>
          
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-gray-600 mb-1 text-sm">Class: MCA - I</p>
              <p className="text-xs text-gray-500 ">Next Exam on Feb 29 | 1 Assignment due for Mar 3</p>
            </div>
            <div className="flex items-center gap-3">
              <Button >
                Add
                <Plus className="h-2 w-4 mr-2" />
              </Button>
              <Link to= "/admin/students/attendance">
              <Button >
                Mark Attendance
              </Button>
              
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-8 border-b border-gray-200 mb-8">
            <div className="flex items-center gap-2 px-1 py-3 border-b-2 border-blue-500">
              <BookOpen className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-blue-500">Overview</span>
            </div>
            <div className="flex items-center gap-2 px-1 py-3 text-gray-500">
              <FileText className="h-4 w-4" />
              <span className="text-sm">Exams</span>
            </div>
            <div className="flex items-center gap-2 px-1 py-3 text-gray-500">
              <ClipboardList className="h-4 w-4" />
              <span className="text-sm">Assignments</span>
            </div>
            <div className="flex items-center gap-2 px-1 py-3 text-gray-500">
              <BookOpenCheck className="h-4 w-4" />
              <span className="text-sm">Study Materials</span>
            </div>
            <div className="flex items-center gap-2 px-1 py-3 text-gray-500">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">Quiz</span>
            </div>
            <div className="flex items-center gap-2 px-1 py-3 text-gray-500">
              <BarChart3 className="h-4 w-4" />
              <span className="text-sm">Performance</span>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-md font-semibold text-gray-900 mb-4">UPCOMING</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 text-sm">Online Exam - Module 3 and 4</span>
                  <span className="text-red-500 text-sm">Today 2:30 PM</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 text-sm">Assignment - Name of Assignment</span>
                  <span className="text-green-500 text-sm">Today 3:30 PM</span>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-md font-semibold text-gray-900">STUDENT ATTENDANCE</h2>
                <span className="text-sm text-gray-500">Last 30 days</span>
              </div>
              
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="text-2xl font-bold text-green-500">89%</div>
                    <div className="text-sm text-gray-500">on Jan 20, 2020</div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View list
                  </Button>
                </div>
                
                <div className="flex items-end gap-2 h-32">
                  {attendanceData.map((bar, index) => (
                    <div
                      key={index}
                      className="bg-orange-200 rounded-t flex-1"
                      style={{ height: `${bar.height}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-700">EXAMS</CardTitle>
                    <Plus className="h-4 w-4 text-gray-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6 mb-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold">1</div>
                      <div className="text-xs text-gray-500">Upcoming</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">2</div>
                      <div className="text-xs text-gray-500">Unscheduled</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">3</div>
                      <div className="text-xs text-gray-500">Completed</div>
                    </div>
                  </div>
                  <Button variant="link" className="text-blue-500 p-0 h-auto text-sm">
                    View details
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-700">QUIZ</CardTitle>
                    <Plus className="h-4 w-4 text-gray-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6 mb-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold">2</div>
                      <div className="text-xs text-gray-500">Completed</div>
                    </div>
                  </div>
                  <Button variant="link" className="text-blue-500 p-0 h-auto text-sm">
                    View details
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-700">ASSIGNMENTS</CardTitle>
                    <Plus className="h-4 w-4 text-gray-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6 mb-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold">1</div>
                      <div className="text-xs text-gray-500">Sent</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">2</div>
                      <div className="text-xs text-gray-500">Unsent</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">3</div>
                      <div className="text-xs text-gray-500">Completed</div>
                    </div>
                  </div>
                  <Button variant="link" className="text-blue-500 p-0 h-auto text-sm">
                    View details
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-700">STUDY MATERIALS</CardTitle>
                    <Plus className="h-4 w-4 text-gray-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6 mb-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold">1</div>
                      <div className="text-xs text-gray-500">Sent</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">2</div>
                      <div className="text-xs text-gray-500">Unsent</div>
                    </div>
                  </div>
                  <Button variant="link" className="text-blue-500 p-0 h-auto text-sm">
                    View details
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarkAttendance;
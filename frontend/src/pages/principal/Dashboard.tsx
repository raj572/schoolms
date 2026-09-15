import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Contact, BookOpen, GraduationCap, BookMarked, DollarSign, IndianRupee, Mail, Lock } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { Skeleton } from "@/components/ui/skeleton";
import Heading from '@/components/common/Heading';
import { SubscriptionStatusBanner } from '@/components/Dashboard/SubscriptionStatusBanner';
import { ContactAdministratorModal } from '@/components/Dashboard/ContactAdministratorModal';
import { Button } from '@/components/ui/button';

const AdminDashboard = () => {
  const authUser = useAuthStore((state) => state.authUser);
  const [dashboardData, setDashboardData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [showContactModal, setShowContactModal] = useState(false);
  const [isSubscriptionActive, setIsSubscriptionActive] = useState(true);

  // Check subscription status - fetch from server to get real-time status
  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      if (!authUser?.school_id) return;
      
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8000/api/principal/subscription/status`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const result = await response.json();
          console.log('Subscription status check:', result);
          if (result.status && result.data) {
            // Check for hasSubscription, or status being 'active' or 'trial'
            const isActive = result.data.hasSubscription === true || 
                            result.data.status === 'active' || 
                            result.data.status === 'trial';
            setIsSubscriptionActive(isActive);
            console.log('Subscription is active:', isActive, 'Data:', result.data);
          } else {
            setIsSubscriptionActive(authUser?.subscription_active === true);
          }
        } else {
          // If API fails, use authUser subscription status
          setIsSubscriptionActive(authUser?.subscription_active === true);
        }
      } catch (error) {
        console.error('Error checking subscription status:', error);
        setIsSubscriptionActive(authUser?.subscription_active === true);
      }
    };
    
    checkSubscriptionStatus();
  }, [authUser, authUser?.school_id]);

  //Fetching stats
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Only fetch data if subscription is active
        if (!authUser || !isSubscriptionActive) {
          setLoading(false);
          return;
        }
        
        // Fetch comprehensive dashboard data
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8000/api/principal/dashboard/${authUser.school_id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const result = await response.json();
          if (result.status && result.data) {
            setDashboardData(result.data);
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [authUser, authUser?.school_id, isSubscriptionActive]);

  const statCards = dashboardData ? [
    {
      title: 'Total Users',
      value: dashboardData.stats.totalUsers || 0,
      description: 'Active users',
      icon: Users,
      color: 'text-primary',
    },
    {
      title: 'Total Students',
      value: dashboardData.stats.totalStudents || 0,
      description: 'Active students',
      icon: Contact,
      color: 'text-green-500',
    },
    {
      title: 'Total Teachers',
      value: dashboardData.stats.totalTeachers || 0,
      description: 'Active teachers',
      icon: GraduationCap,
      color: 'text-blue-500',
    },
    {
      title: 'Total Classes',
      value: dashboardData.stats.classCount || 0,
      description: 'Active classes',
      icon: BookOpen,
      color: 'text-yellow-500',
    },
    {
      title: 'Total Subjects',
      value: dashboardData.stats.totalSubjects || 0,
      description: 'Available subjects',
      icon: BookMarked,
      color: 'text-purple-500',
    },
    {
      title: 'Total Parents',
      value: dashboardData.stats.totalParents || 0,
      description: 'Registered parents',
      icon: Users,
      color: 'text-indigo-500',
    },
    {
      title: 'Pending Dues',
      value: `₹${dashboardData.stats.pendingDues || 0}`,
      description: 'Amount pending',
      icon: IndianRupee,
      color: 'text-red-500',
    },
    {
      title: 'Revenue',
      value: `₹${dashboardData.stats.totalRevenue || 0}`,
      description: 'Total collected',
      icon: DollarSign,
      color: 'text-green-600',
    },
  ] : [];

  const recentActivities = dashboardData?.recent_activities || [];

  const quickActions = [
    {
      title: "Create New Notice",
      description: "Send announcement to students",
      icon: BookOpen
    },
    {
      title: "Mark Attendance",
      description: "Record student attendance",
      icon: BookOpen
    },
    {
      title: "Generate Report",
      description: "Create student progress report",
      icon: BookOpen
    },
  ];

  // Safety check
  if (!authUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading user data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 mx-auto max-w-7xl">
      <Heading 
        title="Dashboard" 
        description="Welcome to your school management dashboard" 
      />

      {/* Subscription Status Banner */}
      <SubscriptionStatusBanner />

      {/* Show stats only if subscription is active */}
      {isSubscriptionActive ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {loading ? (
              Array.from({ length: 8 }).map((_, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-4 rounded" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              statCards.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                      <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                      <Icon className={`h-4 w-4 ${stat.color}`} />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <p className="text-xs text-muted-foreground">{stat.description}</p>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </>
      ) : (
        /* Show call-to-action when subscription is not active */
        <Card className="border-2 border-dashed border-destructive/30 bg-destructive/5">
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center text-center space-y-6">
              <div className="p-4 bg-destructive/20 rounded-full">
                <Lock className="h-12 w-12 text-destructive" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-foreground">
                  Subscription Required to View Dashboard
                </h3>
                <p className="text-muted-foreground max-w-md">
                  Your school needs an active subscription to access all dashboard features, 
                  statistics, and management tools. Please contact your administrator to activate 
                  a subscription plan.
                </p>
              </div>

              <Button
                size="lg"
                onClick={() => setShowContactModal(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8"
              >
                <Mail className="mr-2 h-5 w-5" />
                Contact Administrator
              </Button>

              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mt-4 max-w-md">
                <p className="text-sm text-foreground">
                  <strong>What you'll get with an active subscription:</strong>
                </p>
                <ul className="text-sm text-muted-foreground mt-2 space-y-1 text-left">
                  <li>• Full dashboard with real-time statistics</li>
                  <li>• Student and teacher management</li>
                  <li>• Attendance and attendance reports</li>
                  <li>• Fee management and payment tracking</li>
                  <li>• Exam and grade management</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Show Recent Activities and Quick Actions only when subscription is active */}
      {isSubscriptionActive && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activities</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Latest updates from your school
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className={`w-2 h-2 rounded-full ${activity.color}`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Frequently used actions
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="space-y-3">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={index}
                      className="w-full flex items-center gap-3 text-left p-3 border border-border border-dashed rounded-lg hover:bg-muted/80 transition-colors"
                    >
                      <div className="bg-primary text-white p-2 rounded-md flex items-center justify-center">
                        <Icon className="h-4 w-4" />
                      </div>

                      <div>
                        <p className="font-medium text-sm">{action.title}</p>
                        <p className="text-muted-foreground text-xs">{action.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Contact Administrator Modal */}
      <ContactAdministratorModal 
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
      />
    </div>
  );
};

export default AdminDashboard;
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Building2,
  Users,
  CreditCard,
  TrendingUp,
  DollarSign,
  AlertCircle,
  Package,
  Activity,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getDashboardStats } from '@/services/superAdminApiService';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface DashboardStats {
  total_schools: number;
  active_schools: number;
  total_users: number;
  total_subscriptions: number;
  active_subscriptions: number;
  trial_subscriptions: number;
  expired_subscriptions: number;
  total_revenue: number;
  monthly_revenue: number;
  pending_payments: number;
}

export default function SuperAdminDashboard() {
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await getDashboardStats();
      if (response.status && response.data) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch dashboard statistics',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Schools',
      value: stats?.total_schools || 0,
      icon: Building2,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      description: `${stats?.active_schools || 0} active`,
    },
    {
      title: 'Total Users',
      value: stats?.total_users || 0,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'All system users',
    },
    {
      title: 'Active Subscriptions',
      value: stats?.active_subscriptions || 0,
      icon: Package,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      description: `${stats?.trial_subscriptions || 0} in trial`,
    },
    {
      title: 'Total Revenue',
      value: `₹${(stats?.total_revenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
      description: 'All time',
    },
    {
      title: 'Monthly Revenue',
      value: `₹${(stats?.monthly_revenue || 0).toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      description: 'This month',
    },
    {
      title: 'Pending Payments',
      value: stats?.pending_payments || 0,
      icon: AlertCircle,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
      description: 'Requires attention',
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Super Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">System-wide control and management</p>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-green-600 animate-pulse" />
          <span className="text-sm text-muted-foreground">System Active</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={index}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground mb-1">
                  {stat.value}
                </div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-primary font-medium">Total Subscriptions</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {stats?.total_subscriptions || 0}
                </p>
              </div>
              <CreditCard className="w-10 h-10 text-primary opacity-50" />
            </div>
            <div className="mt-4 flex gap-4 text-xs">
              <div>
                <Badge className="bg-green-100 text-green-700">
                  Active: {stats?.active_subscriptions || 0}
                </Badge>
              </div>
              <div>
                <Badge className="bg-amber-100 text-amber-700">
                  Expired: {stats?.expired_subscriptions || 0}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-primary font-medium">School Status</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {stats ? 
                    `${Math.round((stats.active_schools / stats.total_schools) * 100)}%` 
                    : '0%'
                  }
                </p>
              </div>
              <Building2 className="w-10 h-10 text-primary opacity-50" />
            </div>
            <div className="mt-4 text-xs text-muted-foreground">
              {stats?.active_schools || 0} of {stats?.total_schools || 0} schools active
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-600 font-medium">Revenue Growth</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {stats?.monthly_revenue ? 
                    `₹${(stats.monthly_revenue / 1000).toFixed(1)}K` 
                    : '₹0'
                  }
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-emerald-600 opacity-50" />
            </div>
            <div className="mt-4 text-xs text-muted-foreground">
              This month's revenue
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-green-900">Database</span>
              </div>
              <Badge className="bg-green-100 text-green-700">Online</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-green-900">API Server</span>
              </div>
              <Badge className="bg-green-100 text-green-700">Online</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-green-900">Payment Gateway</span>
              </div>
              <Badge className="bg-green-100 text-green-700">Online</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


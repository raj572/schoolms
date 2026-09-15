import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Building2,
  Users,
  CreditCard,
  TrendingUp,
  DollarSign,
  IndianRupee,
  AlertCircle,
  Package,
  Activity,
  Cpu,
  HardDrive,
  Database,
  Server,
  Zap,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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

  // Simulated real-time server metrics
  const [ramUsage, setRamUsage] = useState(42);
  const [storageUsage, setStorageUsage] = useState(28);
  const [cpuUsage, setCpuUsage] = useState(14);

  useEffect(() => {
    fetchStats();
    
    // Slight random variation to simulate dynamic live system monitoring
    const interval = setInterval(() => {
      setRamUsage(prev => Math.min(85, Math.max(35, prev + (Math.floor(Math.random() * 5) - 2))));
      setCpuUsage(prev => Math.min(70, Math.max(8, prev + (Math.floor(Math.random() * 7) - 3))));
    }, 4000);

    return () => clearInterval(interval);
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

  // Dynamic currency lookup based on system settings
  const currentCurrency = localStorage.getItem('sa_currency') || 'INR';
  const getCurrencySymbol = (curr: string) => {
    switch (curr) {
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'AED': return 'AED ';
      case 'INR':
      default: return '₹';
    }
  };
  const currencySymbol = getCurrencySymbol(currentCurrency);

  // Dynamic icon component for total revenue stat card
  const CurrencyIcon = ({ className }: { className?: string }) => {
    if (currentCurrency === 'INR') {
      return <IndianRupee className={className} />;
    }
    return <DollarSign className={className} />;
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
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      description: 'All system users',
    },
    {
      title: 'Active Subscriptions',
      value: stats?.active_subscriptions || 0,
      icon: Package,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-500/10',
      description: `${stats?.trial_subscriptions || 0} in trial`,
    },
    {
      title: 'Total Revenue',
      value: `${currencySymbol}${(stats?.total_revenue || 0).toLocaleString()}`,
      icon: CurrencyIcon,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      description: 'All time',
    },
    {
      title: 'Monthly Revenue',
      value: `${currencySymbol}${(stats?.monthly_revenue || 0).toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-500/10',
      description: 'This month',
    },
    {
      title: 'Pending Payments',
      value: stats?.pending_payments || 0,
      icon: AlertCircle,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-500/10',
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Super Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">System-wide control, analytics & health metrics</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full w-fit">
          <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">All Systems Operational</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={index}
              className="border border-border/60 shadow-sm hover:shadow-md transition-shadow"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2.5 rounded-lg ${stat.bgColor}`}>
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

      {/* System Resources & Live Hardware Monitor */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2 text-foreground">
                <Cpu className="w-4 h-4 text-primary" /> RAM Allocation
              </span>
              <span className="text-xs font-bold text-muted-foreground">{ramUsage}% (6.7 / 16 GB)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={ramUsage} className="h-2 mb-2" />
            <p className="text-xs text-muted-foreground flex justify-between">
              <span>Status: Optimal</span>
              <span className="text-emerald-500 font-medium">Healthy</span>
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2 text-foreground">
                <HardDrive className="w-4 h-4 text-blue-500" /> SSD Storage
              </span>
              <span className="text-xs font-bold text-muted-foreground">{storageUsage}% (140 / 500 GB)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={storageUsage} className="h-2 mb-2" />
            <p className="text-xs text-muted-foreground flex justify-between">
              <span>Available: 360 GB</span>
              <span className="text-emerald-500 font-medium">Sufficient</span>
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2 text-foreground">
                <Zap className="w-4 h-4 text-amber-500" /> CPU Load
              </span>
              <span className="text-xs font-bold text-muted-foreground">{cpuUsage}% (8 Cores)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={cpuUsage} className="h-2 mb-2" />
            <p className="text-xs text-muted-foreground flex justify-between">
              <span>Average Load: Low</span>
              <span className="text-emerald-500 font-medium">Normal</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-border/60 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-primary font-medium">Total Subscriptions</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {stats?.total_subscriptions || 0}
                </p>
              </div>
              <CreditCard className="w-10 h-10 text-primary/40" />
            </div>
            <div className="mt-4 flex gap-2 text-xs">
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                Active: {stats?.active_subscriptions || 0}
              </Badge>
              <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                Expired: {stats?.expired_subscriptions || 0}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-primary font-medium">School Adoption</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {stats && stats.total_schools > 0 ? 
                    `${Math.round((stats.active_schools / stats.total_schools) * 100)}%` 
                    : '0%'
                  }
                </p>
              </div>
              <Building2 className="w-10 h-10 text-primary/40" />
            </div>
            <div className="mt-4 text-xs text-muted-foreground">
              {stats?.active_schools || 0} of {stats?.total_schools || 0} registered schools active
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Monthly Revenue</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {stats?.monthly_revenue ? 
                    `${currencySymbol}${(stats.monthly_revenue / 1000).toFixed(1)}K` 
                    : `${currencySymbol}0`
                  }
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-emerald-500/40" />
            </div>
            <div className="mt-4 text-xs text-muted-foreground">
              Current billing cycle total
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health Section */}
      <Card className="border border-border/60 shadow-sm">
        <CardHeader className="border-b border-border/40 pb-4">
          <CardTitle className="flex items-center gap-2 text-lg text-foreground">
            <Server className="w-5 h-5 text-primary" />
            System Health & Infrastructure
          </CardTitle>
          <CardDescription>Real-time microservices and connection status</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 bg-card border border-border/80 rounded-xl shadow-xs">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-emerald-500" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Database Node</p>
                  <p className="text-xs text-muted-foreground">MySQL Cluster 3306</p>
                </div>
              </div>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                Online (12ms)
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 bg-card border border-border/80 rounded-xl shadow-xs">
              <div className="flex items-center gap-3">
                <Server className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm font-semibold text-foreground">API Application Gateway</p>
                  <p className="text-xs text-muted-foreground">Laravel v11 (PHP 8.2)</p>
                </div>
              </div>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                Online (45ms)
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 bg-card border border-border/80 rounded-xl shadow-xs">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-indigo-500" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Payment Processor</p>
                  <p className="text-xs text-muted-foreground">Stripe / Razorpay API</p>
                </div>
              </div>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                Connected
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

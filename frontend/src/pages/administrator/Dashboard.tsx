import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown,
  Users,
  Building2,
  DollarSign,
  IndianRupee,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import Heading from '@/components/common/Heading';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { getAdministratorDashboard } from '@/services/administratorApiService';
import { useToast } from '@/hooks/use-toast';
import { SetupProgressBanner } from '@/components/Dashboard/SetupProgressBanner';
import { Button } from '@/components/ui/button';

interface DashboardStats {
  total_schools: number;
  active_schools: number;
  total_users: number;
  active_subscriptions: number;
  trial_subscriptions: number;
  expired_subscriptions: number;
  total_revenue: number;
  monthly_revenue: number;
  pending_payments: number;
}

interface RevenueData {
  month: string;
  revenue: number;
  schools: number;
}

interface PlanDistribution {
  name: string;
  value: number;
  color: string;
}

interface SubscriptionTrend {
  month: string;
  active: number;
  trial: number;
  expired: number;
}

interface TopSchool {
  name: string;
  revenue: number;
  plan: string;
  status: string;
}

interface RecentSchool {
  name: string;
  city: string;
  plan: string;
  status: string;
  joined_date: string;
}

export default function AdministratorDashboard() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    total_schools: 0,
    active_schools: 0,
    total_users: 0,
    active_subscriptions: 0,
    trial_subscriptions: 0,
    expired_subscriptions: 0,
    total_revenue: 0,
    monthly_revenue: 0,
    pending_payments: 0,
  });
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [planDistribution, setPlanDistribution] = useState<PlanDistribution[]>([]);
  const [subscriptionTrend, setSubscriptionTrend] = useState<SubscriptionTrend[]>([]);
  const [topSchools, setTopSchools] = useState<TopSchool[]>([]);
  const [recentSchools, setRecentSchools] = useState<RecentSchool[]>([]);

  // Dynamic currency configuration from system settings
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

  const CurrencyIcon = ({ className }: { className?: string }) => {
    if (currentCurrency === 'INR') {
      return <IndianRupee className={className} />;
    }
    return <DollarSign className={className} />;
  };

  useEffect(() => {
    console.log('Administrator dashboard mounted, fetching data...');
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const response = await getAdministratorDashboard();
      if (response.status && response.data) {
        setStats(response.data.stats);
        setRevenueData(response.data.revenue_growth || []);
        setPlanDistribution(response.data.plan_distribution || []);
        setSubscriptionTrend(response.data.subscription_trend || []);
        setTopSchools(response.data.top_schools || []);
        setRecentSchools(response.data.recent_schools || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch dashboard data',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const kpiCards = [
    {
      title: 'Monthly Recurring Revenue',
      value: `${currencySymbol}${(stats.monthly_revenue / 100000).toFixed(2)}L`,
      change: stats.total_revenue > 0 ? `${currencySymbol}${(stats.total_revenue / 100000).toFixed(2)}L total` : 'N/A',
      trend: 'up',
      icon: CurrencyIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950/30',
    },
    {
      title: 'Active Schools',
      value: stats.active_schools.toString(),
      change: `${stats.total_schools} total schools`,
      trend: 'up',
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Users',
      value: stats.total_users.toLocaleString(),
      change: 'Across all schools',
      trend: 'up',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Active Subscriptions',
      value: stats.active_subscriptions.toString(),
      change: `${stats.trial_subscriptions} on trial`,
      trend: 'up',
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'Expired Subscriptions',
      value: stats.expired_subscriptions.toString(),
      change: 'Needs attention',
      trend: 'down',
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Pending Payments',
      value: stats.pending_payments.toString(),
      change: 'Follow up required',
      trend: 'down',
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Heading
        title="Administrator Dashboard"
        description="Business analytics and insights for growth"
      />

      {/* Setup Progress Banner */}
      <SetupProgressBanner />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpiCards.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                    <Icon className={`h-8 w-8 ${kpi.color}`} />
                  </div>
                  <Badge variant={kpi.trend === 'up' ? 'default' : 'destructive'}>
                    {kpi.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  </Badge>
                </div>
                <p className="text-2xl font-bold">{kpi.value}</p>
                <p className="text-sm text-gray-600 mt-1">{kpi.title}</p>
                <p className="text-xs text-gray-500 mt-2">{kpi.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Revenue & Growth Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#8b5cf6" name={`Revenue (${currencySymbol.trim()})`} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>School Acquisition</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="schools" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="New Schools"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Plan Distribution & Subscription Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Plan Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {planDistribution.length > 0 ? (
              <>
                <div className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={planDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {planDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 mt-4">
                  {planDistribution.map((plan, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: plan.color }}
                      />
                      <span className="text-sm text-gray-600">
                        {plan.name}: {plan.value}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                No plan distribution data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription Status Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={subscriptionTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="active" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Active"
                />
                <Line 
                  type="monotone" 
                  dataKey="trial" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Trial"
                />
                <Line 
                  type="monotone" 
                  dataKey="expired" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  name="Expired"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Schools & Recent Schools */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Schools by Revenue */}
        <Card>
          <CardHeader>
            <CardTitle>Top Schools by Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            {topSchools.length > 0 ? (
              <div className="space-y-4">
                {topSchools.map((school, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold">
                        #{index + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold">{school.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{school.plan}</Badge>
                          <Badge variant={school.status === 'active' ? 'default' : 'secondary'}>
                            {school.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-primary">
                        ₹{(school.revenue / 1000).toFixed(0)}K
                      </div>
                      <div className="text-xs text-gray-500">Lifetime value</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-gray-500">
                No revenue data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recently Joined Schools */}
      <Card>
        <CardHeader>
            <CardTitle>Recently Joined Schools</CardTitle>
        </CardHeader>
        <CardContent>
            {recentSchools.length > 0 ? (
          <div className="space-y-4">
            {recentSchools.map((school, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{school.name}</h4>
                    <p className="text-sm text-gray-500">{school.city}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="outline">{school.plan}</Badge>
                  <Badge 
                    variant={school.status === 'active' ? 'default' : 'secondary'}
                  >
                    {school.status}
                  </Badge>
                      <span className="text-sm text-gray-500">{school.joined_date}</span>
                </div>
              </div>
            ))}
          </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-gray-500">
                No schools found
              </div>
            )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}

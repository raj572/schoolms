import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  CheckCircle, 
  AlertCircle,
  Clock,
  XCircle,
  Download,
  Loader2,
  LayoutGrid,
  List
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import Heading from '@/components/common/Heading';
import { getAllSubscriptionsAdmin } from '@/services/administratorApiService';

interface School {
  id: number;
  name: string;
  school_code: string;
}

interface Plan {
  id: number;
  name: string;
  code: string;
}

interface Subscription {
  id: number;
  school_id: number;
  plan_id: number;
  school: School;
  plan: Plan;
  status: 'active' | 'trial' | 'expired' | 'cancelled' | 'past_due' | 'suspended';
  start_date: string;
  end_date: string;
  trial_end_date?: string | null;
  amount: string | number;
  currency: string;
  auto_renew: boolean;
  billing_cycle: 'monthly' | 'annual';
  next_billing_date: string | null;
  computed_next_billing_date?: string | null;
  created_at: string;
}

export default function Subscriptions() {
  const { toast } = useToast();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [stats, setStats] = useState({
    active: 0,
    trial: 0,
    expired: 0,
    cancelled: 0,
    past_due: 0,
    suspended: 0,
  });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setViewMode('card');
      } else {
        setViewMode('table');
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchSubscriptions();
  }, [filterStatus]);

  const fetchSubscriptions = async () => {
    setIsLoading(true);
    try {
      const response = await getAllSubscriptionsAdmin({
        per_page: 1000, // Get all subscriptions
        status: filterStatus !== 'all' ? filterStatus : undefined,
      });

      console.log('Subscriptions API response:', response);

      if (response.status && response.data) {
        const subscriptionData = response.data.data || response.data;
        const subscriptionsList = Array.isArray(subscriptionData) 
          ? subscriptionData 
          : subscriptionData.data || [];
        
        setSubscriptions(subscriptionsList);
        
        // Calculate stats
        const statusCounts = subscriptionsList.reduce((acc: any, sub: Subscription) => {
          acc[sub.status] = (acc[sub.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        setStats({
          active: statusCounts.active || 0,
          trial: statusCounts.trial || 0,
          expired: statusCounts.expired || 0,
          cancelled: statusCounts.cancelled || 0,
          past_due: statusCounts.past_due || 0,
          suspended: statusCounts.suspended || 0,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: response.message || 'Failed to fetch subscriptions',
        });
      }
    } catch (error: any) {
      console.error('Error fetching subscriptions:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to fetch subscriptions',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'trial':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'expired':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-gray-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400 border border-green-200/50 dark:border-green-900/30';
      case 'trial':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-200/50 dark:border-blue-900/30';
      case 'expired':
        return 'bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400 border border-red-200/50 dark:border-red-900/30';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400 border border-gray-200/50 dark:border-gray-700/30';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400';
    }
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    const schoolName = sub.school?.name || '';
    const planName = sub.plan?.name || '';
    const matchesSearch = schoolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         planName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const exportToCSV = () => {
    // TODO: Implement CSV export
    toast({
      title: 'Export Started',
      description: 'Your subscriptions report will be downloaded shortly',
    });
  };

  return (
    <div className="space-y-6 animate-fade-in w-full min-w-0">
      <Heading
        title="Subscriptions Overview"
        description="Monitor and manage all school subscriptions"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-3xl font-bold text-green-600">{stats.active}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Trial</p>
                <p className="text-3xl font-bold text-blue-600">{stats.trial}</p>
              </div>
              <Clock className="h-10 w-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Expired</p>
                <p className="text-3xl font-bold text-red-600">{stats.expired}</p>
              </div>
              <AlertCircle className="h-10 w-10 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cancelled</p>
                <p className="text-3xl font-bold text-gray-600">{stats.cancelled}</p>
              </div>
              <XCircle className="h-10 w-10 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search by school or plan name..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-56">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="past_due">Past Due</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <div className="flex items-center border rounded-md p-1 bg-muted/40">
                <Button
                  variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className="h-8 px-3 hidden md:flex"
                >
                  <List className="h-4 w-4 mr-1.5" />
                  Table
                </Button>
                <Button
                  variant={viewMode === 'card' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('card')}
                  className="h-8 px-3"
                >
                  <LayoutGrid className="h-4 w-4 mr-1.5" />
                  Card
                </Button>
              </div>
              <Button variant="outline" onClick={exportToCSV}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Subscriptions ({filteredSubscriptions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredSubscriptions.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No subscriptions found</h3>
              <p className="text-muted-foreground">
                {searchQuery || filterStatus !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'No subscriptions available for your schools'}
              </p>
            </div>
          ) : viewMode === 'table' ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800 text-muted-foreground">
                    <th className="text-left py-3 px-4 font-semibold text-sm">School</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Plan</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Billing Cycle</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Start Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Trial End</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">End Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Amount</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Auto Renew</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Next Billing</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubscriptions.map((sub) => (
                    <tr 
                      key={sub.id} 
                      className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-slate-800/30 bg-white dark:bg-slate-900/40 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div>
                          <span className="font-medium text-foreground">{sub.school?.name || 'N/A'}</span>
                          {sub.school?.school_code && (
                            <div className="text-xs text-muted-foreground">{sub.school.school_code}</div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="border-gray-200 dark:border-gray-800">{sub.plan?.name || 'N/A'}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary" className="capitalize bg-secondary/50 text-secondary-foreground">
                          {sub.billing_cycle}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(sub.status)}
                          <Badge className={getStatusColor(sub.status)}>
                            {sub.status}
                          </Badge>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {new Date(sub.start_date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-sm text-blue-600 dark:text-blue-400">
                        {sub.trial_end_date 
                          ? new Date(sub.trial_end_date).toLocaleDateString()
                          : sub.status === 'trial' ? '-' : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {new Date(sub.end_date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 font-semibold text-foreground">
                        {sub.currency} {typeof sub.amount === 'number' 
                          ? (sub.amount / 100).toLocaleString()
                          : parseFloat(sub.amount).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={sub.auto_renew ? 'default' : 'secondary'} className="shadow-none">
                          {sub.auto_renew ? 'Yes' : 'No'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {sub.computed_next_billing_date || sub.next_billing_date
                          ? new Date(sub.computed_next_billing_date || sub.next_billing_date || '').toLocaleDateString()
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSubscriptions.map((sub) => (
                <Card key={sub.id} className="border border-border/60 hover:shadow-md transition-all">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-base text-foreground leading-tight">{sub.school?.name || 'N/A'}</h4>
                        {sub.school?.school_code && (
                          <code className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground mt-1 inline-block">Code: {sub.school.school_code}</code>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        {getStatusIcon(sub.status)}
                        <Badge className={getStatusColor(sub.status)}>{sub.status}</Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-muted/30 p-2.5 rounded-lg border">
                      <div>
                        <p className="text-muted-foreground font-medium">Plan</p>
                        <p className="font-semibold text-foreground mt-0.5">{sub.plan?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground font-medium">Billing Cycle</p>
                        <p className="font-semibold text-foreground mt-0.5 capitalize">{sub.billing_cycle}</p>
                      </div>
                      <div className="mt-1.5">
                        <p className="text-muted-foreground font-medium">Amount</p>
                        <p className="font-bold text-foreground mt-0.5">
                          {sub.currency} {typeof sub.amount === 'number' 
                            ? (sub.amount / 100).toLocaleString()
                            : parseFloat(sub.amount).toLocaleString()}
                        </p>
                      </div>
                      <div className="mt-1.5">
                        <p className="text-muted-foreground font-medium">Auto Renew</p>
                        <p className="font-semibold text-foreground mt-0.5">{sub.auto_renew ? 'Yes' : 'No'}</p>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-muted-foreground border-t pt-3">
                      <div className="flex justify-between">
                        <span>Start Date:</span>
                        <span className="font-medium text-foreground">{new Date(sub.start_date).toLocaleDateString()}</span>
                      </div>
                      {sub.trial_end_date && (
                        <div className="flex justify-between text-blue-600 dark:text-blue-400">
                          <span>Trial End:</span>
                          <span className="font-medium">{new Date(sub.trial_end_date).toLocaleDateString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>End Date:</span>
                        <span className="font-medium text-foreground">{new Date(sub.end_date).toLocaleDateString()}</span>
                      </div>
                      {(sub.computed_next_billing_date || sub.next_billing_date) && (
                        <div className="flex justify-between border-t border-dashed pt-1.5 mt-1.5">
                          <span className="font-semibold text-foreground">Next Billing:</span>
                          <span className="font-semibold text-foreground">
                            {new Date(sub.computed_next_billing_date || sub.next_billing_date || '').toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


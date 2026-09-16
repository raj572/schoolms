import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  Eye,
  LayoutGrid,
  List
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Heading from '@/components/common/Heading';
import {
  getAdministratorTransactions,
  getAdministratorStats,
  type SubscriptionTransaction,
  type TransactionStats
} from '@/services/subscriptionPaymentApiService';

export default function SubscriptionPayments() {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<SubscriptionTransaction[]>([]);
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

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
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [transactionsRes, statsRes] = await Promise.all([
        getAdministratorTransactions(),
        getAdministratorStats()
      ]);

      if (transactionsRes.status) {
        setTransactions(transactionsRes.data);
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: transactionsRes.message
        });
      }

      if (statsRes.status) {
        setStats(statsRes.data);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch payment data'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.school?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.plan_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.razorpay_order_id?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      success: { label: 'Success', className: 'bg-green-100 text-green-800' },
      pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
      failed: { label: 'Failed', className: 'bg-red-100 text-red-800' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full min-w-0 animate-fade-in">
      <Heading
        title="Subscription Payments"
        description="View and manage your subscription payment transactions"
      />

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_transactions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Successful</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.successful_transactions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <Download className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.total_revenue)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <Download className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(stats.monthly_revenue)}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search by school, plan, or order ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('all')}
              >
                All
              </Button>
              <Button
                variant={filterStatus === 'success' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('success')}
              >
                Success
              </Button>
              <Button
                variant={filterStatus === 'pending' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('pending')}
              >
                Pending
              </Button>
              <Button
                variant={filterStatus === 'failed' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('failed')}
              >
                Failed
              </Button>
            </div>
            <div className="flex items-center gap-2 border rounded-md p-1 bg-muted/40 self-start md:self-auto">
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
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No transactions found
            </div>
          ) : viewMode === 'table' ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/60">
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Order ID</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">School</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Plan</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Amount</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Cycle</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b border-border/40 hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 text-sm font-mono text-foreground">
                        {transaction.razorpay_order_id.substring(0, 20)}...
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">{transaction.school?.name || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-foreground">{transaction.plan_name}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-foreground">
                        {formatCurrency(transaction.order_amount)}
                      </td>
                      <td className="px-4 py-3 text-sm capitalize text-muted-foreground">{transaction.billing_cycle}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {formatDate(transaction.created_at)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(transaction.status)}
                          {getStatusBadge(transaction.status)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            toast({
                              title: 'Transaction Details',
                              description: `Order ID: ${transaction.razorpay_order_id}`,
                            });
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTransactions.map((transaction) => (
                <Card key={transaction.id} className="border border-border/60 hover:shadow-md transition-all">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0">
                        <h4 className="font-semibold text-base text-foreground leading-tight truncate">{transaction.school?.name || 'N/A'}</h4>
                        <span className="text-xs text-muted-foreground block font-mono mt-1 truncate" title={transaction.razorpay_order_id}>ID: {transaction.razorpay_order_id}</span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {getStatusIcon(transaction.status)}
                        {getStatusBadge(transaction.status)}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-muted/30 p-2.5 rounded-lg border">
                      <div>
                        <p className="text-muted-foreground font-medium">Plan</p>
                        <p className="font-semibold text-foreground mt-0.5">{transaction.plan_name}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground font-medium">Cycle</p>
                        <p className="font-semibold text-foreground mt-0.5 capitalize">{transaction.billing_cycle}</p>
                      </div>
                      <div className="col-span-2 mt-1 border-t pt-1.5 flex justify-between items-center">
                        <span className="text-muted-foreground font-medium">Amount:</span>
                        <span className="font-bold text-foreground text-sm">{formatCurrency(transaction.order_amount)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 border-t pt-3 text-xs text-muted-foreground">
                      <span>Date: {formatDate(transaction.created_at)}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          toast({
                            title: 'Transaction Details',
                            description: `Order ID: ${transaction.razorpay_order_id}`,
                          });
                        }}
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" /> Details
                      </Button>
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


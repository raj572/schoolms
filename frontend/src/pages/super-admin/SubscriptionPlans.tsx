import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Edit, Trash2, Package, TrendingUp, Users, DollarSign, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  getSubscriptionPlans,
  deleteSubscriptionPlan,
} from '@/services/superAdminApiService';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import PlanFormDialog from '@/components/super-admin/PlanFormDialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

interface Plan {
  id: number;
  name: string;
  description: string;
  price: number;
  monthly_price?: number;
  annual_price?: number;
  duration_days: number;
  features: string[];
  is_active: boolean;
  max_users: number | null;
  max_students: number | null;
  max_teachers: number | null;
  max_staff: number | null;
  max_classes: number | null;
  is_trial: boolean;
  trial_days?: number;
  is_popular?: boolean;
  sort_order?: number;
  created_at: string;
}

interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number | null;
  to: number | null;
}

interface ApiPlan extends Omit<Plan, 'price' | 'monthly_price' | 'annual_price' | 'features'> {
  price: string;
  monthly_price?: string;
  annual_price?: string;
  features: string | string[];
}

export default function SubscriptionPlans() {
  const { toast } = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [pagination, setPagination] = useState<PaginationMeta>({
    current_page: 1,
    per_page: 5,
    total: 0,
    last_page: 1,
    from: null,
    to: null,
  });

  useEffect(() => {
    fetchPlans();
  }, [currentPage]);

  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      const response = await getSubscriptionPlans({
        page: currentPage,
        per_page: itemsPerPage,
      });
      
      if (response.status && response.data) {
        const plansData: ApiPlan[] = response.data.plans || [];
        
        // Update pagination meta
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
        
        const normalizedPlans: Plan[] = plansData.map((plan) => {
          const normalizedPlan: Plan = {
            id: plan.id,
            name: plan.name,
            description: plan.description,
            price: parseFloat(plan.price),
            monthly_price: plan.monthly_price ? parseFloat(plan.monthly_price) : undefined,
            annual_price: plan.annual_price ? parseFloat(plan.annual_price) : undefined,
            duration_days: plan.duration_days,
            is_active: plan.is_active,
            max_users: plan.max_users,
            max_students: plan.max_students,
            max_teachers: plan.max_teachers || null,
            max_staff: plan.max_staff || null,
            max_classes: plan.max_classes || null,
            is_trial: plan.is_trial,
            trial_days: (plan as any).trial_days || undefined,
            is_popular: (plan as any).is_popular || false,
            sort_order: (plan as any).sort_order || 0,
            created_at: plan.created_at,
            features: Array.isArray(plan.features) 
              ? plan.features 
              : (typeof plan.features === 'string' ? JSON.parse(plan.features) : [])
          };
          return normalizedPlan;
        });
        setPlans(normalizedPlans);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch subscription plans',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedPlan(null);
    setIsFormOpen(true);
  };

  const handleEdit = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsFormOpen(true);
  };

  const handleDelete = (plan: Plan) => {
    setPlanToDelete(plan);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!planToDelete) return;

    try {
      const response = await deleteSubscriptionPlan(planToDelete.id);
      if (response.status) {
        toast({
          title: 'Success',
          description: 'Plan deleted successfully',
        });
        setDeleteDialogOpen(false);
        fetchPlans();
      }
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete plan',
      });
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    fetchPlans();
  };

  // Calculate statistics - Note: These are for current page only
  const stats = {
    total: pagination.total,
    active: plans.filter(p => p.is_active).length,
    popular: plans.filter(p => p.is_popular).length,
    averagePrice: plans.length > 0 
      ? plans.reduce((sum, p) => sum + (p.monthly_price || p.price), 0) / plans.length 
      : 0
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Subscription Plans</h1>
          <p className="text-muted-foreground mt-1">Manage subscription plans and pricing</p>
        </div>
        <Button
          onClick={handleCreate} 
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Plan
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Plans</p>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              </div>
              <Package className="w-8 h-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Plans</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <Activity className="w-8 h-8 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Popular Plans</p>
                <p className="text-2xl font-bold text-primary">{stats.popular}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Price</p>
                <p className="text-2xl font-bold text-orange-600">₹{Math.round(stats.averagePrice)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-orange-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plans Table */}
      {isLoading ? (
        <Card className="shadow-lg">
          <CardContent className="p-6 space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </CardContent>
        </Card>
      ) : plans.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-foreground">No Subscription Plans</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Get started by creating your first subscription plan. You can set pricing, limits, and features.
            </p>
            <Button 
              onClick={handleCreate}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Plan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[220px] font-semibold">Plan Details</TableHead>
                  <TableHead className="font-semibold">Description</TableHead>
                  <TableHead className="w-[140px] font-semibold">Pricing</TableHead>
                  <TableHead className="w-[140px] font-semibold">Limits</TableHead>
                  <TableHead className="w-[80px] font-semibold">Features</TableHead>
                  <TableHead className="w-[100px] font-semibold">Status</TableHead>
                  <TableHead className="w-[80px] font-semibold text-center">Order</TableHead>
                  <TableHead className="w-[140px] text-right font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
          {plans.map((plan) => (
                  <TableRow 
              key={plan.id}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    {/* Plan Name & Code */}
                    <TableCell className="py-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground">{plan.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {plan.is_popular && (
                            <Badge className="bg-primary text-primary-foreground">
                              Popular
                            </Badge>
                          )}
              {plan.is_trial && (
                            <Badge className="bg-orange-500 text-white">
                              Trial
                            </Badge>
                          )}
                        </div>
                        {plan.sort_order > 0 && (
                          <div className="text-xs text-primary font-medium">
                            Order: {plan.sort_order}
                </div>
              )}
                      </div>
                    </TableCell>

                    {/* Description */}
                    <TableCell>
                      <div className="text-sm text-muted-foreground max-w-xs line-clamp-2" title={plan.description}>
                        {plan.description}
                      </div>
                    </TableCell>

                    {/* Pricing */}
                    <TableCell>
                      <div className="space-y-2">
                        {plan.monthly_price ? (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Monthly:</span>
                            <span className="font-semibold text-foreground"> ₹{plan.monthly_price.toLocaleString()}</span>
                          </div>
                        ) : null}
                        {plan.annual_price ? (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Annual:</span>
                            <span className="font-semibold text-foreground"> ₹{plan.annual_price.toLocaleString()}</span>
                </div>
                        ) : null}
                        {plan.trial_days && plan.trial_days > 0 && (
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
                            🎁 {plan.trial_days} days trial
                          </Badge>
                        )}
                  </div>
                    </TableCell>

                    {/* Limits */}
                    <TableCell>
                      <div className="text-xs space-y-1">
                        {plan.max_students && (
                          <div className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-primary" />
                            <span className="text-muted-foreground">Students: {plan.max_students.toLocaleString()}</span>
                        </div>
                      )}
                        {plan.max_teachers && (
                          <div className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-green-500" />
                            <span className="text-muted-foreground">Teachers: {plan.max_teachers.toLocaleString()}</span>
                        </div>
                      )}
                        {plan.max_classes && (
                          <div className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-primary" />
                            <span className="text-muted-foreground">Classes: {plan.max_classes.toLocaleString()}</span>
                    </div>
                  )}
                        {(!plan.max_students && !plan.max_teachers && !plan.max_classes) && (
                          <span className="text-muted-foreground italic">Unlimited</span>
                        )}
                </div>
                    </TableCell>

                    {/* Features */}
                    <TableCell>
                      <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary">
                        <Package className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium">
                          {Array.isArray(plan.features) ? plan.features.length : 0}
                    </span>
                  </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      {plan.is_active ? (
                        <Badge className="bg-green-500 text-white">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          Inactive
                        </Badge>
                      )}
                    </TableCell>

                    {/* Sort Order */}
                    <TableCell>
                      <div className="flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-muted text-foreground flex items-center justify-center text-sm font-bold">
                          {plan.sort_order || 0}
                    </div>
                </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(plan)}
                          className="text-primary hover:bg-primary/10"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(plan)}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
                  </div>
        </Card>
      )}

      {/* Pagination Controls */}
      {pagination.last_page > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {pagination.from || 0} to {pagination.to || 0} of {pagination.total} plans
              </div>
              <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                  onClick={() => handlePageChange(pagination.current_page - 1)}
                  disabled={pagination.current_page === 1}
                  className="disabled:opacity-50"
                >
                  Previous
                </Button>
                
                {[...Array(pagination.last_page)].map((_, i) => {
                  const page = i + 1;
                  // Show page numbers near current page
                  if (
                    page === 1 ||
                    page === pagination.last_page ||
                    (page >= pagination.current_page - 1 && page <= pagination.current_page + 1)
                  ) {
                    return (
                      <Button
                        key={page}
                        variant={pagination.current_page === page ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                  </Button>
                    );
                  } else if (page === pagination.current_page - 2 || page === pagination.current_page + 2) {
                    return <span key={page} className="text-muted-foreground">...</span>;
                  }
                  return null;
                })}

                  <Button
                    variant="outline"
                    size="sm"
                  onClick={() => handlePageChange(pagination.current_page + 1)}
                  disabled={pagination.current_page === pagination.last_page}
                  className="disabled:opacity-50"
                  >
                  Next
                  </Button>
              </div>
                </div>
              </CardContent>
            </Card>
      )}

      {/* Create/Edit Form Dialog */}
      <PlanFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        plan={selectedPlan}
        onSuccess={handleFormSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the subscription plan <span className="font-semibold">{planToDelete?.name}</span>.
              This action cannot be undone and may affect existing subscriptions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Plan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

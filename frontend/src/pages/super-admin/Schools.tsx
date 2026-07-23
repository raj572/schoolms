import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Search,
  Building2,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Users,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getAllSchools } from '@/services/superAdminApiService';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface School {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  school_code: string;
  board: string;
  affiliation_number: string;
  established_year: number;
  total_students: number;
  total_teachers: number;
  status: 'active' | 'inactive' | 'suspended';
  subscription_status: 'active' | 'trial' | 'expired' | 'none';
  subscription_end_date: string | null;
  created_at: string;
}

export default function SuperAdminSchools() {
  const { toast } = useToast();
  const [schools, setSchools] = useState<School[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSchools();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = schools.filter(
        (school) =>
          school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          school.school_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          school.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
          school.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSchools(filtered);
    } else {
      setFilteredSchools(schools);
    }
  }, [searchTerm, schools]);

  const fetchSchools = async () => {
    setIsLoading(true);
    try {
      const response = await getAllSchools();
      if (response.status && response.data) {
        setSchools(response.data.schools || []);
        setFilteredSchools(response.data.schools || []);
      }
    } catch (error) {
      console.error('Error fetching schools:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch schools',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { variant: 'default', label: 'Active', className: 'bg-green-100 text-green-700' },
      inactive: { variant: 'secondary', label: 'Inactive', className: 'bg-gray-100 text-gray-700' },
      suspended: { variant: 'destructive', label: 'Suspended', className: 'bg-red-100 text-red-700' },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getSubscriptionBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Active', className: 'bg-emerald-100 text-emerald-700' },
      trial: { label: 'Trial', className: 'bg-amber-100 text-amber-700' },
      expired: { label: 'Expired', className: 'bg-red-100 text-red-700' },
      none: { label: 'No Plan', className: 'bg-gray-100 text-gray-700' },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.none;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-10 w-64" />
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Schools Management
          </h1>
          <p className="text-muted-foreground mt-1">Monitor and manage all schools in the system</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Schools</p>
                <p className="text-2xl font-bold text-foreground">{schools.length}</p>
              </div>
              <Building2 className="w-8 h-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Schools</p>
                <p className="text-2xl font-bold text-green-600">
                  {schools.filter((s) => s.status === 'active').length}
                </p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">With Subscription</p>
                <p className="text-2xl font-bold text-primary">
                  {schools.filter((s) => s.subscription_status === 'active').length}
                </p>
              </div>
              <Users className="w-8 h-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Suspended</p>
                <p className="text-2xl font-bold text-red-600">
                  {schools.filter((s) => s.status === 'suspended').length}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>All Schools</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search schools by name, code, city, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Schools Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>School Details</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Stats</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Subscription</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSchools.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">
                        {searchTerm ? 'No schools found matching your search' : 'No schools found'}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSchools.map((school) => (
                    <TableRow key={school.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-semibold text-foreground">{school.name}</div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Badge variant="outline" className="text-xs">
                              {school.school_code}
                            </Badge>
                            <span>{school.board}</span>
                          </div>
                          {school.affiliation_number && (
                            <div className="text-xs text-muted-foreground">
                              Affiliation: {school.affiliation_number}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-muted-foreground" />
                            <span className="text-muted-foreground text-xs">{school.email}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-muted-foreground" />
                            <span className="text-muted-foreground text-xs">{school.phone}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-muted-foreground" />
                            <span className="text-muted-foreground">{school.city}, {school.state}</span>
                          </div>
                          <div className="text-muted-foreground">{school.pincode}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-xs">
                          <div className="text-muted-foreground">
                            Students: <span className="font-semibold text-foreground">{school.total_students || 0}</span>
                          </div>
                          <div className="text-muted-foreground">
                            Teachers: <span className="font-semibold text-foreground">{school.total_teachers || 0}</span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            Est. {school.established_year}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(school.status)}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {getSubscriptionBadge(school.subscription_status)}
                          {school.subscription_end_date && (
                            <div className="text-xs text-gray-500">
                              Until: {new Date(school.subscription_end_date).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Bus, MapPin, Users, Route, RefreshCw, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { getTransportStatistics, getAllBuses, getAssignments } from "@/services/transportApiService";
import { Skeleton } from "@/components/ui/skeleton";
import AddBusDialog from "@/components/transport/AddBusDialog";
import EditBusDialog from "@/components/transport/EditBusDialog";
import AssignStudentDialog from "@/components/transport/AssignStudentDialog";
import { Pencil } from "lucide-react";

interface TransportStatistics {
  totalBuses: number;
  activeRoutes: number;
  studentsUsingTransport: number;
  totalCapacity: number;
  utilizedCapacity: number;
}

interface BusData {
  id: number;
  bus_number: string;
  registration_number: string;
  driver_name: string;
  driver_contact: string;
  route_name: string;
  capacity: number;
  status: string;
  student_count: number;
}

interface TransportAssignment {
  id: number;
  student_details_id: number;
  bus_id: number;
  pickup_point: string;
  pickup_time: string;
  drop_time: string;
  monthly_fee: number;
  status: string;
  start_date: string;
  bus?: BusData;
  studentDetails?: {
    candidate_name: string;
    class: string;
    section: string;
  };
  student_details?: {
    candidate_name: string;
    class: string;
    section: string;
  };
}

const Transport = () => {
  const authUser = useAuthStore((state) => state.authUser);
  const [statistics, setStatistics] = useState<TransportStatistics | null>(null);
  const [buses, setBuses] = useState<BusData[]>([]);
  const [assignments, setAssignments] = useState<TransportAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddBusDialog, setShowAddBusDialog] = useState(false);
  const [showEditBusDialog, setShowEditBusDialog] = useState(false);
  const [editingBus, setEditingBus] = useState<BusData | null>(null);
  const [showAssignStudentDialog, setShowAssignStudentDialog] = useState(false);

  useEffect(() => {
    fetchData();
  }, [authUser?.school_id]);

  const fetchData = async () => {
    if (!authUser?.school_id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const schoolId = Number(authUser.school_id);

      const [statsResponse, busesResponse, assignmentsResponse] = await Promise.all([
        getTransportStatistics(schoolId),
        getAllBuses(schoolId),
        getAssignments(schoolId),
      ]);

      if (statsResponse.status && statsResponse.data) {
        setStatistics(statsResponse.data);
      }

      if (busesResponse.status && busesResponse.data) {
        setBuses(busesResponse.data);
      }

      if (assignmentsResponse.status && assignmentsResponse.data) {
        setAssignments(assignmentsResponse.data);
      }
    } catch (error) {
      console.error("Error fetching transport data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await fetchData();
  };

  const handleEditBus = (bus: BusData) => {
    setEditingBus(bus);
    setShowEditBusDialog(true);
  };

  const handleEditSuccess = () => {
    fetchData();
    setEditingBus(null);
  };

  // Filter buses based on search
  const filteredBuses = buses.filter(bus => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      bus.bus_number.toLowerCase().includes(query) ||
      bus.driver_name.toLowerCase().includes(query) ||
      bus.route_name.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-background ">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-lg font-bold text-foreground">Transport Management</h1>
            <p className="text-muted-foreground text-xs mt-2">Manage school buses and student transportation</p>
          </div>
          <div className="flex gap-2">
            <Link to="/admin/dashboard">
              <Button variant="outline" className="hover:bg-navbar hover:text-white">Back to Dashboard</Button>
            </Link>
            <Button variant="outline" onClick={handleRefresh} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" onClick={() => setShowAddBusDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Bus
            </Button>
            <Button onClick={() => setShowAssignStudentDialog(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Assign Student
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Buses</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center items-center pb-6">
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="flex items-center space-x-2">
                  <Bus className="h-5 w-5 text-blue-500" />
                  <div className="text-2xl font-bold text-foreground">{statistics?.totalBuses || 0}</div>
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Routes</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center items-center pb-6">
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="flex items-center space-x-2">
                  <Route className="h-5 w-5 text-emerald-500" />
                  <div className="text-2xl font-bold text-foreground">{statistics?.activeRoutes || 0}</div>
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Students Using Transport</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center items-center pb-6">
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-purple-500" />
                  <div className="text-2xl font-bold text-foreground">{statistics?.studentsUsingTransport || 0}</div>
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Capacity</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center items-center pb-6">
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-amber-500" />
                  <div className="text-2xl font-bold text-foreground">{statistics?.totalCapacity || 0}</div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="border border-border/60 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <Tabs defaultValue="buses" className="w-full">
              <div className="border-b border-border/60 px-6 pt-4">
                <TabsList className="grid w-full grid-cols-2 bg-muted/60 p-1">
                  <TabsTrigger value="buses">Bus Fleet</TabsTrigger>
                  <TabsTrigger value="assignments">Student Assignments</TabsTrigger>
                </TabsList>
              </div>

              {/* Bus Fleet Tab */}
              <TabsContent value="buses" className="p-6 pt-4">
                <div className="flex justify-between items-center mb-4">
                  <CardTitle className="text-lg">Bus Fleet</CardTitle>
                  <div className="relative w-64">
                    <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                    <Input 
                      placeholder="Search buses..." 
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {loading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Bus No.</TableHead>
                        <TableHead>Registration</TableHead>
                        <TableHead>Route</TableHead>
                        <TableHead>Driver</TableHead>
                        <TableHead>Students/Capacity</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBuses.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                            {searchQuery ? "No buses found" : "No buses in the fleet yet"}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredBuses.map((bus) => (
                          <TableRow key={bus.id}>
                            <TableCell className="font-medium text-xs">{bus.bus_number}</TableCell>
                            <TableCell className="text-xs">{bus.registration_number || '-'}</TableCell>
                            <TableCell className="text-xs">{bus.route_name}</TableCell>
                            <TableCell className="text-xs">{bus.driver_name}</TableCell>
                            <TableCell className="text-xs">
                              {bus.student_count || 0}/{bus.capacity}
                            </TableCell>
                            <TableCell className="text-xs">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                bus.status === 'active' 
                                  ? 'bg-green-100 text-green-800' 
                                  : bus.status === 'maintenance'
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {bus.status.charAt(0).toUpperCase() + bus.status.slice(1)}
                              </span>
                            </TableCell>
                            <TableCell className="text-xs">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditBus(bus)}
                                className="h-8 w-8 p-0"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>

              {/* Student Assignments Tab */}
              <TabsContent value="assignments" className="p-6 pt-4">
                <div className="flex justify-between items-center mb-4">
                  <CardTitle className="text-lg">Student Transport Assignments</CardTitle>
                </div>

                {loading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Bus No.</TableHead>
                        <TableHead>Route</TableHead>
                        <TableHead>Pickup Point</TableHead>
                        <TableHead>Pickup Time</TableHead>
                        <TableHead>Monthly Fee</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assignments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                            No student transport assignments yet
                          </TableCell>
                        </TableRow>
                      ) : (
                        assignments.map((assignment) => {
                          // Handle both camelCase and snake_case from API
                          const studentDetails = assignment.studentDetails || assignment.student_details;
                          const studentName = studentDetails?.candidate_name || 'Unknown Student';
                          const studentClass = studentDetails?.class || '';
                          const studentSection = studentDetails?.section || '';
                          
                          return (
                            <TableRow key={assignment.id}>
                              <TableCell className="font-medium text-xs">
                                {studentName}
                              </TableCell>
                              <TableCell className="text-xs">
                                {studentClass ? `${studentClass} ${studentSection || ''}`.trim() : '-'}
                              </TableCell>
                              <TableCell className="text-xs">{assignment.bus?.bus_number || '-'}</TableCell>
                              <TableCell className="text-xs">{assignment.bus?.route_name || '-'}</TableCell>
                              <TableCell className="text-xs">{assignment.pickup_point}</TableCell>
                              <TableCell className="text-xs">{assignment.pickup_time}</TableCell>
                              <TableCell className="text-xs">₹{assignment.monthly_fee}</TableCell>
                              <TableCell className="text-xs">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  assignment.status === 'active' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                                </span>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Add Bus Dialog */}
        {authUser?.school_id && (
          <AddBusDialog
            open={showAddBusDialog}
            onOpenChange={setShowAddBusDialog}
            onSuccess={handleRefresh}
            schoolId={Number(authUser.school_id)}
          />
        )}

        {/* Assign Student Dialog */}
        {authUser?.school_id && (
          <AssignStudentDialog
            open={showAssignStudentDialog}
            onOpenChange={setShowAssignStudentDialog}
            onSuccess={handleRefresh}
            schoolId={Number(authUser.school_id)}
          />
        )}

        {/* Edit Bus Dialog */}
        {authUser?.school_id && (
          <EditBusDialog
            open={showEditBusDialog}
            onOpenChange={setShowEditBusDialog}
            onSuccess={handleEditSuccess}
            bus={editingBus}
          />
        )}
      </div>
    </div>
  );
};

export default Transport;
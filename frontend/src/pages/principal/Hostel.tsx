import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Plus, Building, Bed, Users, Home, TrendingUp, DollarSign, RefreshCw, Edit, Trash2 } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { getHostelStatistics, getAllRooms, getAllAllocations, getAllBuildings, deleteRoom, deleteBuilding } from "@/services/hostelApiService";
import AddBuildingDialog from "@/components/hostel/AddBuildingDialog";
import AddRoomDialog from "@/components/hostel/AddRoomDialog";
import EditRoomDialog from "@/components/hostel/EditRoomDialog";
import EditBuildingDialog from "@/components/hostel/EditBuildingDialog";
import AllocateRoomDialog from "@/components/hostel/AllocateRoomDialog";

interface HostelStatistics {
  totalRooms: number;
  occupiedRooms: number;
  vacantRooms: number;
  occupancyRate: number;
  totalStudents: number;
  totalRevenue: number;
  totalBuildings?: number;
}

interface HostelRoom {
  id: number;
  room_number: string;
  floor: number | null;
  block_wing: string | null;
  room_type: string | null;
  capacity: number;
  occupied_beds: number;
  monthly_fee: number;
  facilities: string | null;
  status: string;
  hostel_building: {
    building_name: string;
  };
  active_allocations_count: number;
}

interface HostelAllocation {
  id: number;
  room_number?: string;
  floor?: number;
  block_wing?: string;
  building_name?: string;
  student_name: string;
  class: string;
  allocation_date: string;
  monthly_fee: number;
  status: string;
  hostelRoom?: HostelRoom;
  studentDetails?: {
    candidate_name: string;
    class: string;
  };
}

interface HostelBuildingData {
  id: number;
  building_name: string;
  building_type: string | null;
  warden_name: string | null;
  warden_contact: string | null;
  total_rooms: number;
  address: string | null;
  status: string;
  rooms_count: number;
}

const Hostel = () => {
  const authUser = useAuthStore((state) => state.authUser);
  const [statistics, setStatistics] = useState<HostelStatistics | null>(null);
  const [allocations, setAllocations] = useState<HostelAllocation[]>([]);
  const [rooms, setRooms] = useState<HostelRoom[]>([]);
  const [buildings, setBuildings] = useState<HostelBuildingData[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddBuildingDialog, setShowAddBuildingDialog] = useState(false);
  const [showAddRoomDialog, setShowAddRoomDialog] = useState(false);
  const [showEditRoomDialog, setShowEditRoomDialog] = useState(false);
  const [showEditBuildingDialog, setShowEditBuildingDialog] = useState(false);
  const [showAllocateRoomDialog, setShowAllocateRoomDialog] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any>(null);
  const [editingBuilding, setEditingBuilding] = useState<any>(null);
  const [allocationFilter, setAllocationFilter] = useState<"all" | "active" | "vacated">("active");
  const [roomFilter, setRoomFilter] = useState<string>("all");
  const [buildingFilter, setBuildingFilter] = useState<string>("all");

  useEffect(() => {
    if (authUser?.school_id) {
      fetchData();
      fetchStudents();
    }
  }, [authUser?.school_id]);

  const fetchStudents = async () => {
    if (!authUser?.school_id) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/principal/getstudents/${authUser.school_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const result = await response.json();
      
      if (result.status && result.data) {
        // Filter out students who already have active allocations
        // This is a simple filter - in a real app, you'd compare with active allocations
        setStudents(result.data);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const fetchData = async () => {
    if (!authUser?.school_id) return;

    setLoading(true);
    try {
      // Fetch statistics
      const statsResult = await getHostelStatistics(Number(authUser.school_id));
      if (statsResult.status) {
        setStatistics(statsResult.data);
      }

      // Fetch buildings
      const buildingsResult = await getAllBuildings(Number(authUser.school_id));
      if (buildingsResult.status && buildingsResult.data) {
        // Map the response data correctly
        const formattedBuildings = buildingsResult.data.map((building: any) => ({
          id: building.id,
          building_name: building.building_name,
          building_type: building.building_type,
          warden_name: building.warden_name,
          warden_contact: building.warden_contact,
          total_rooms: building.total_rooms || 0,
          address: building.address,
          status: building.status,
          rooms_count: building.rooms_count || 0, // Actual count of rooms in this building
        }));
        
        setBuildings(formattedBuildings);
        
        // Update statistics with building count
        setStatistics(prev => {
          if (prev) {
            return { ...prev, totalBuildings: formattedBuildings.length };
          }
          return prev;
        });
      }

      // Fetch allocations
      const allocationsResult = await getAllAllocations(Number(authUser.school_id), allocationFilter === "active");
      if (allocationsResult.status && allocationsResult.data) {
        const formatted = allocationsResult.data.map((alloc: any) => {
          // Backend now returns snake_case
          const hostelRoom = alloc.hostel_room;
          const studentDetails = alloc.student_details;
          
          return {
            id: alloc.id,
            room_number: hostelRoom?.room_number,
            floor: hostelRoom?.floor,
            block_wing: hostelRoom?.block_wing,
            building_name: hostelRoom?.hostel_building?.building_name,
            student_name: studentDetails?.candidate_name || "Unknown",
            class: studentDetails?.class || "",
            allocation_date: alloc.allocation_date,
            monthly_fee: alloc.monthly_fee,
            status: alloc.status,
            hostelRoom: hostelRoom,
            studentDetails: studentDetails,
          };
        });
        setAllocations(formatted);
      }

      // Fetch rooms
      const roomsResult = await getAllRooms(Number(authUser.school_id), roomFilter !== "all" ? parseInt(roomFilter) : undefined);
      if (roomsResult.status && roomsResult.data) {
        setRooms(roomsResult.data);
      }
    } catch (error) {
      console.error("Error fetching hostel data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [allocationFilter, roomFilter]);

  const handleRefresh = () => {
    fetchData();
  };

  const handleEditRoom = (room: any) => {
    setEditingRoom(room);
    setShowEditRoomDialog(true);
  };

  const handleEditBuilding = (building: any) => {
    setEditingBuilding(building);
    setShowEditBuildingDialog(true);
  };

  const handleDeleteRoom = async (roomId: number) => {
    if (!confirm("Are you sure you want to delete this room?")) return;
    
    try {
      const result = await deleteRoom(roomId);
      if (result.status) {
        handleRefresh();
      } else {
        alert(result.message || "Failed to delete room");
      }
    } catch (error) {
      alert("An error occurred");
    }
  };

  const handleDeleteBuilding = async (buildingId: number) => {
    if (!confirm("Are you sure you want to delete this building? All rooms in this building will also be deleted.")) return;
    
    try {
      const result = await deleteBuilding(buildingId);
      if (result.status) {
        handleRefresh();
      } else {
        alert(result.message || "Failed to delete building");
      }
    } catch (error) {
      alert("An error occurred");
    }
  };

  // Filter allocations based on search query
  const filteredAllocations = allocations.filter((allocation) => {
    const matchesSearch = 
      allocation.room_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      allocation.student_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (allocationFilter === "all") return matchesSearch;
    return matchesSearch && allocation.status === allocationFilter;
  });

  // Filter rooms based on search query
  const filteredRooms = rooms.filter((room) => {
    const matchesSearch = 
      room.room_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.hostel_building?.building_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  // Filter buildings based on search query
  const filteredBuildings = buildings.filter((building) => {
    return building.building_name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Hostel Management</h1>
            <p className="text-muted-foreground text-sm mt-2">Manage hostel rooms and student accommodation</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRefresh} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={() => setShowAddBuildingDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Building
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
        ) : statistics && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Home className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">Total Rooms</p>
                    <p className="text-2xl font-bold">{statistics.totalRooms}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">Occupied</p>
                    <p className="text-2xl font-bold">{statistics.occupiedRooms}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Bed className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">Vacant</p>
                    <p className="text-2xl font-bold">{statistics.vacantRooms}</p>
                  </div>
              </div>
            </CardContent>
          </Card>
          <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">Occupancy</p>
                    <p className="text-2xl font-bold">{statistics.occupancyRate}%</p>
                  </div>
              </div>
            </CardContent>
          </Card>
          <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-indigo-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">Students</p>
                    <p className="text-2xl font-bold">{statistics.totalStudents}</p>
                  </div>
              </div>
            </CardContent>
          </Card>
          <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">Revenue</p>
                    <p className="text-2xl font-bold">₹{statistics.totalRevenue.toLocaleString()}</p>
                  </div>
              </div>
            </CardContent>
          </Card>
        </div>
        )}

        {/* Main Content */}
        <Card>
          <CardContent className="p-0">
            <Tabs defaultValue="allocations" className="w-full">
              <TabsList className="grid w-full grid-cols-3 m-6 mb-0">
                <TabsTrigger value="allocations">Room Allocations</TabsTrigger>
                <TabsTrigger value="rooms">Room Management</TabsTrigger>
                <TabsTrigger value="buildings">Buildings</TabsTrigger>
              </TabsList>

              {/* Room Allocations Tab */}
              <TabsContent value="allocations" className="p-6 pt-4">
                <div className="flex justify-between items-center mb-4">
                  <CardTitle className="text-lg">Hostel Allocations</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowAllocateRoomDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Allocate Room
                    </Button>
                    <select
                      value={allocationFilter}
                      onChange={(e) => setAllocationFilter(e.target.value as any)}
                      className="border rounded-md px-3 py-2 text-sm"
                    >
                      <option value="active">Active Only</option>
                      <option value="vacated">Vacated</option>
                      <option value="all">All</option>
                    </select>
              <div className="relative w-64">
                <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                      <Input
                        placeholder="Search by room or student..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
              </div>
            </div>

                {loading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room No.</TableHead>
                        <TableHead>Floor</TableHead>
                  <TableHead>Block</TableHead>
                        <TableHead>Building</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Class</TableHead>
                        <TableHead>Monthly Fee</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAllocations.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                            No allocations found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredAllocations.map((allocation) => (
                          <TableRow key={allocation.id}>
                            <TableCell className="font-medium text-xs">{allocation.room_number || "-"}</TableCell>
                            <TableCell className="text-xs">{allocation.floor || "-"}</TableCell>
                            <TableCell className="text-xs">{allocation.block_wing || "-"}</TableCell>
                            <TableCell className="text-xs">{allocation.building_name || "-"}</TableCell>
                            <TableCell className="text-xs">{allocation.student_name}</TableCell>
                            <TableCell className="text-xs">{allocation.class}</TableCell>
                            <TableCell className="text-xs">₹{allocation.monthly_fee}</TableCell>
                            <TableCell className="text-xs">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                allocation.status === 'active'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {allocation.status.charAt(0).toUpperCase() + allocation.status.slice(1)}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>

              {/* Room Management Tab */}
              <TabsContent value="rooms" className="p-6 pt-4">
                <div className="flex justify-between items-center mb-4">
                  <CardTitle className="text-lg">Room Management</CardTitle>
                  <div className="flex gap-2">
                    <Button onClick={() => setShowAddRoomDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Room
                    </Button>
                    <div className="relative w-64">
                      <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                      <Input
                        placeholder="Search rooms..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {loading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Room No.</TableHead>
                        <TableHead>Floor</TableHead>
                        <TableHead>Block/Wing</TableHead>
                        <TableHead>Building</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Capacity</TableHead>
                        <TableHead>Occupied</TableHead>
                        <TableHead>Monthly Fee</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRooms.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                            No rooms found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredRooms.map((room) => (
                          <TableRow key={room.id}>
                            <TableCell className="font-medium text-xs">{room.room_number}</TableCell>
                            <TableCell className="text-xs">{room.floor || "-"}</TableCell>
                            <TableCell className="text-xs">{room.block_wing || "-"}</TableCell>
                            <TableCell className="text-xs">{room.hostel_building?.building_name || "-"}</TableCell>
                            <TableCell className="text-xs">{room.room_type || "-"}</TableCell>
                            <TableCell className="text-xs">{room.capacity}</TableCell>
                            <TableCell className="text-xs">
                              {room.active_allocations_count || 0}/{room.capacity}
                            </TableCell>
                            <TableCell className="text-xs">₹{room.monthly_fee}</TableCell>
                            <TableCell className="text-xs">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                room.status === 'available'
                                  ? 'bg-green-100 text-green-800'
                                  : room.status === 'full'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-orange-100 text-orange-800'
                              }`}>
                                {room.status.charAt(0).toUpperCase() + room.status.slice(1).replace('_', ' ')}
                              </span>
                            </TableCell>
                            <TableCell className="text-xs">
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditRoom(room)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteRoom(room.id)}
                                  className="h-8 w-8 p-0 text-red-600"
                                  disabled={room.active_allocations_count > 0}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>

              {/* Buildings Tab */}
              <TabsContent value="buildings" className="p-6 pt-4">
                <div className="flex justify-between items-center mb-4">
                  <CardTitle className="text-lg">Buildings</CardTitle>
                  <div className="relative w-64">
                    <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                    <Input
                      placeholder="Search buildings..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {loading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Building Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Warden</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Rooms</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBuildings.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                            No buildings found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredBuildings.map((building) => (
                          <TableRow key={building.id}>
                            <TableCell className="font-medium text-xs">{building.building_name}</TableCell>
                            <TableCell className="text-xs">{building.building_type || "-"}</TableCell>
                            <TableCell className="text-xs">{building.warden_name || "-"}</TableCell>
                            <TableCell className="text-xs">{building.warden_contact || "-"}</TableCell>
                            <TableCell className="text-xs font-medium">{building.rooms_count ?? 0}</TableCell>
                            <TableCell className="text-xs">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                building.status === 'active'
                                  ? 'bg-green-100 text-green-800'
                                  : building.status === 'inactive'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-orange-100 text-orange-800'
                              }`}>
                                {building.status.charAt(0).toUpperCase() + building.status.slice(1).replace('_', ' ')}
                              </span>
                            </TableCell>
                            <TableCell className="text-xs">
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditBuilding(building)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteBuilding(building.id)}
                                  className="h-8 w-8 p-0 text-red-600"
                                  disabled={building.rooms_count > 0}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
              </TableBody>
            </Table>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Dialogs */}
        {authUser?.school_id && (
          <>
            <AddBuildingDialog
              open={showAddBuildingDialog}
              onOpenChange={setShowAddBuildingDialog}
              onSuccess={handleRefresh}
              schoolId={Number(authUser.school_id)}
            />
            <AddRoomDialog
              open={showAddRoomDialog}
              onOpenChange={setShowAddRoomDialog}
              onSuccess={handleRefresh}
              schoolId={Number(authUser.school_id)}
            />
            <EditRoomDialog
              open={showEditRoomDialog}
              onOpenChange={setShowEditRoomDialog}
              onSuccess={handleRefresh}
              room={editingRoom}
            />
            <EditBuildingDialog
              open={showEditBuildingDialog}
              onOpenChange={setShowEditBuildingDialog}
              onSuccess={handleRefresh}
              building={editingBuilding}
            />
            <AllocateRoomDialog
              open={showAllocateRoomDialog}
              onOpenChange={setShowAllocateRoomDialog}
              onSuccess={() => {
                handleRefresh();
                fetchStudents();
              }}
              schoolId={Number(authUser.school_id)}
              students={students}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Hostel;
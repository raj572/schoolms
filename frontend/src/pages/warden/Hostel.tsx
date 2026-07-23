import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Building2, Bed, Users } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import Heading from "@/components/common/Heading";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

interface Room {
  id: number;
  room_number: string;
  floor: number | null;
  block_wing: string | null;
  capacity: number;
  occupied_beds: number;
  monthly_fee: number;
  status: string;
}

interface Allocation {
  id: number;
  room_number?: string;
  floor?: number;
  block_wing?: string;
  student_name: string;
  class: string;
  allocation_date: string;
  status: string;
}

const Hostel = () => {
  const authUser = useAuthStore((state) => state.authUser);
  const [building, setBuilding] = useState<{
    id: number;
    building_name: string;
    building_type: string | null;
    status: string;
    total_rooms: number;
  } | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');

      // Fetch building
      const buildingRes = await fetch(`${API_BASE_URL}/warden/hostel/building`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const buildingData = await buildingRes.json();
      if (buildingData.status) {
        setBuilding(buildingData.data);
      }

      // Fetch rooms
      const roomsRes = await fetch(`${API_BASE_URL}/warden/hostel/rooms/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const roomsData = await roomsRes.json();
      if (roomsData.status) {
        setRooms(roomsData.data || []);
      }

      // Fetch allocations
      const allocRes = await fetch(`${API_BASE_URL}/warden/hostel/allocations/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const allocData = await allocRes.json();
      if (allocData.status) {
        const formatted = allocData.data.map((alloc: {
          id: number;
          hostel_room?: { room_number?: string; floor?: number; block_wing?: string };
          student_details?: { candidate_name?: string; class?: string };
          allocation_date: string;
          status: string;
        }) => ({
          id: alloc.id,
          room_number: alloc.hostel_room?.room_number,
          floor: alloc.hostel_room?.floor,
          block_wing: alloc.hostel_room?.block_wing,
          student_name: alloc.student_details?.candidate_name || "Unknown",
          class: alloc.student_details?.class || "",
          allocation_date: alloc.allocation_date,
          status: alloc.status,
        }));
        setAllocations(formatted);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRooms = rooms.filter((room) =>
    room.room_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAllocations = allocations.filter((alloc) =>
    alloc.room_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    alloc.student_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!building) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <Heading title="Hostel Management" description="Manage your assigned building" />
          <Card className="mt-8">
            <CardContent className="p-8 text-center">
              <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Building Assigned</h3>
              <p className="text-muted-foreground">Please contact the principal to get assigned to a building.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
          <Heading title="Hostel Management" description={`Managing ${building.building_name}`} />

        {/* Building Info */}
        <Card className="mt-8 mb-8">
          <CardHeader>
            <CardTitle>Building Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Building Name</p>
                <p className="font-medium text-lg">{building.building_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Building Type</p>
                <p className="font-medium">{building.building_type || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Rooms</p>
                <p className="font-medium">{rooms.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rooms Table */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Rooms</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search rooms..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
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
                    <TableHead>Capacity</TableHead>
                    <TableHead>Occupied</TableHead>
                    <TableHead>Monthly Fee</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRooms.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        No rooms found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRooms.map((room) => (
                      <TableRow key={room.id}>
                        <TableCell className="font-medium">{room.room_number}</TableCell>
                        <TableCell>{room.floor || "-"}</TableCell>
                        <TableCell>{room.block_wing || "-"}</TableCell>
                        <TableCell>{room.capacity}</TableCell>
                        <TableCell>
                          {room.occupied_beds}/{room.capacity}
                        </TableCell>
                        <TableCell>₹{room.monthly_fee}</TableCell>
                        <TableCell>
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
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Allocations Table */}
        <Card>
          <CardHeader>
            <CardTitle>Room Allocations</CardTitle>
          </CardHeader>
          <CardContent>
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
                    <TableHead>Student Name</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Allocation Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAllocations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        No allocations found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAllocations.map((allocation) => (
                      <TableRow key={allocation.id}>
                        <TableCell className="font-medium">{allocation.room_number || "-"}</TableCell>
                        <TableCell>{allocation.floor || "-"}</TableCell>
                        <TableCell>{allocation.block_wing || "-"}</TableCell>
                        <TableCell>{allocation.student_name}</TableCell>
                        <TableCell>{allocation.class}</TableCell>
                        <TableCell>{new Date(allocation.allocation_date).toLocaleDateString()}</TableCell>
                        <TableCell>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Hostel;


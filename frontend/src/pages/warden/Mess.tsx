import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Utensils, Calendar, Edit, Trash2, CheckCircle, XCircle } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import Heading from "@/components/common/Heading";
import { getMenus, createMenu, updateMenu, deleteMenu, getBookings, createBooking, updateBookingStatus } from "@/services/messApiService";
import { useToast } from "@/hooks/use-toast";

interface Menu {
  id: number;
  date: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner';
  items: string[];
  description: string | null;
}

interface Booking {
  id: number;
  student_name: string;
  booking_date: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner';
  status: 'pending' | 'confirmed' | 'cancelled' | 'consumed';
  menu?: Menu;
}

const Mess = () => {
  const authUser = useAuthStore((state) => state.authUser);
  const { toast } = useToast();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMenuDialog, setShowMenuDialog] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [menuFormData, setMenuFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    meal_type: 'breakfast' as 'breakfast' | 'lunch' | 'dinner',
    items: [''],
    description: '',
  });

  useEffect(() => {
    if (authUser?.school_id) {
      fetchData();
    }
  }, [authUser?.school_id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchData = async () => {
    if (!authUser?.school_id) return;
    setLoading(true);
    try {
      const [menusRes, bookingsRes] = await Promise.all([
        getMenus(Number(authUser.school_id)),
        getBookings(Number(authUser.school_id))
      ]);

      if (menusRes.status) {
        setMenus(menusRes.data || []);
      }
      if (bookingsRes.status) {
        const formatted = bookingsRes.data.map((b: {
          id: number;
          student?: { candidate_name?: string };
          booking_date: string;
          meal_type: 'breakfast' | 'lunch' | 'dinner';
          status: 'pending' | 'confirmed' | 'cancelled' | 'consumed';
        }) => ({
          ...b,
          student_name: b.student?.candidate_name || 'Unknown',
        }));
        setBookings(formatted);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const menuItems = menuFormData.items.filter(item => item.trim() !== '');
      if (menuItems.length === 0) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Please add at least one menu item',
        });
        return;
      }

      let result;
      if (editingMenu) {
        result = await updateMenu(editingMenu.id, {
          ...menuFormData,
          items: menuItems,
        });
      } else {
        result = await createMenu({
          ...menuFormData,
          items: menuItems,
        });
      }

      if (result.status) {
        toast({
          title: 'Success',
          description: editingMenu ? 'Menu updated successfully' : 'Menu created successfully',
        });
        setShowMenuDialog(false);
        setEditingMenu(null);
        setMenuFormData({
          date: new Date().toISOString().split('T')[0],
          meal_type: 'breakfast',
          items: [''],
          description: '',
        });
        fetchData();
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save menu';
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
    }
  };

  const handleDeleteMenu = async (id: number) => {
    if (!confirm('Are you sure you want to delete this menu?')) return;
    try {
      const result = await deleteMenu(id);
      if (result.status) {
        toast({
          title: 'Success',
          description: 'Menu deleted successfully',
        });
        fetchData();
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete menu';
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
    }
  };

  const handleEditMenu = (menu: Menu) => {
    setEditingMenu(menu);
    setMenuFormData({
      date: menu.date,
      meal_type: menu.meal_type,
      items: menu.items.length > 0 ? menu.items : [''],
      description: menu.description || '',
    });
    setShowMenuDialog(true);
  };

  const handleAddMenuItem = () => {
    setMenuFormData({
      ...menuFormData,
      items: [...menuFormData.items, ''],
    });
  };

  const handleMenuItemChange = (index: number, value: string) => {
    const newItems = [...menuFormData.items];
    newItems[index] = value;
    setMenuFormData({ ...menuFormData, items: newItems });
  };

  const handleRemoveMenuItem = (index: number) => {
    const newItems = menuFormData.items.filter((_, i) => i !== index);
    setMenuFormData({ ...menuFormData, items: newItems.length > 0 ? newItems : [''] });
  };

  const filteredMenus = menus.filter(menu =>
    menu.items.some(item => item.toLowerCase().includes(searchQuery.toLowerCase())) ||
    menu.meal_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Heading title="Mess Management" description="Manage daily menus and meal bookings" />
          <Button onClick={() => {
            setEditingMenu(null);
            setMenuFormData({
              date: new Date().toISOString().split('T')[0],
              meal_type: 'breakfast',
              items: [''],
              description: '',
            });
            setShowMenuDialog(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Create Menu
          </Button>
        </div>

        {/* Menus Table */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Daily Menus</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search menus..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : filteredMenus.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No menus found</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Meal Type</TableHead>
                    <TableHead>Menu Items</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMenus.map((menu) => (
                    <TableRow key={menu.id}>
                      <TableCell>{new Date(menu.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{menu.meal_type}</Badge>
                      </TableCell>
                      <TableCell>
                        <ul className="list-disc list-inside text-sm">
                          {menu.items.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </TableCell>
                      <TableCell>{menu.description || '-'}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEditMenu(menu)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteMenu(menu.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Bookings Table */}
        <Card>
          <CardHeader>
            <CardTitle>Meal Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No bookings found</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Meal Type</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>{new Date(booking.booking_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{booking.meal_type}</Badge>
                      </TableCell>
                      <TableCell>{booking.student_name}</TableCell>
                      <TableCell>
                        <Badge variant={
                          booking.status === 'confirmed' ? 'default' :
                          booking.status === 'consumed' ? 'secondary' :
                          booking.status === 'cancelled' ? 'destructive' : 'outline'
                        }>
                          {booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {booking.status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              try {
                                const result = await updateBookingStatus(booking.id, 'confirmed');
                                if (result.status) {
                                  fetchData();
                                }
                              } catch (error) {
                                console.error('Error updating booking:', error);
                              }
                            }}
                          >
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Menu Dialog */}
        <Dialog open={showMenuDialog} onOpenChange={setShowMenuDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingMenu ? 'Edit Menu' : 'Create Menu'}</DialogTitle>
              <DialogDescription>
                {editingMenu ? 'Update menu details' : 'Create a new daily menu'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleMenuSubmit}>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={menuFormData.date}
                      onChange={(e) => setMenuFormData({ ...menuFormData, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="meal_type">Meal Type *</Label>
                    <Select
                      value={menuFormData.meal_type}
                      onValueChange={(value: 'breakfast' | 'lunch' | 'dinner') =>
                        setMenuFormData({ ...menuFormData, meal_type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="breakfast">Breakfast</SelectItem>
                        <SelectItem value="lunch">Lunch</SelectItem>
                        <SelectItem value="dinner">Dinner</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Menu Items *</Label>
                  {menuFormData.items.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={item}
                        onChange={(e) => handleMenuItemChange(index, e.target.value)}
                        placeholder={`Menu item ${index + 1}`}
                        required={index === 0}
                      />
                      {menuFormData.items.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMenuItem(index)}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={handleAddMenuItem}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={menuFormData.description}
                    onChange={(e) => setMenuFormData({ ...menuFormData, description: e.target.value })}
                    placeholder="Optional description..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowMenuDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">{editingMenu ? 'Update' : 'Create'} Menu</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Mess;


import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Settings as SettingsIcon, Save, User, Bell, Shield, Database, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import * as schoolInfoService from "@/services/schoolInfoService";
import { useToast } from "@/hooks/use-toast";

const Roles = () => {
  const authUser = useAuthStore((state) => state.authUser);
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [schoolData, setSchoolData] = useState({
    name: '',
    school_code: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    principal_name: '',
    principal_email: '',
    principal_phone: '',
    designation: 'Principal'
  });

  // Fetch school data
  useEffect(() => {
    const fetchSchoolData = async () => {
      if (!authUser?.school_id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await schoolInfoService.getCompleteSchoolInfo(authUser.school_id);
        
        if (response.status && response.data) {
          const school = response.data;
          setSchoolData({
            name: school.name || '',
            school_code: school.school_code || '',
            address: school.address || '',
            phone: school.phone || '',
            email: school.email || '',
            website: school.website || '',
            principal_name: school.principal_name || '',
            principal_email: school.principal_email || '',
            principal_phone: school.principal_phone || '',
            designation: 'Principal'
          });
        }
      } catch (error) {
        console.error('Error fetching school data:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load school data",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSchoolData();
  }, [authUser, toast]);

  // Handle save
  const handleSave = async () => {
    if (!authUser?.school_id) return;

    try {
      setSaving(true);
      await schoolInfoService.updateSchoolBasicInfo(authUser.school_id, schoolData);
      toast({
        title: "Success",
        description: "Settings saved successfully",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save settings",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background ">
      <div className="">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-lg font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground mt-2 text-xs">Manage your school management system settings</p>
          </div>
          <div className="flex gap-2">
            <Link to="/admin/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* School Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <SettingsIcon className="h-5 w-5" />
                <span className="text-lg">School Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="schoolName">School Name</Label>
                  <Input 
                    id="schoolName" 
                    value={schoolData.name}
                    onChange={(e) => setSchoolData({...schoolData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schoolCode">School Code</Label>
                  <Input 
                    id="schoolCode" 
                    value={schoolData.school_code}
                    onChange={(e) => setSchoolData({...schoolData, school_code: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input 
                    id="address" 
                    value={schoolData.address}
                    onChange={(e) => setSchoolData({...schoolData, address: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    value={schoolData.phone}
                    onChange={(e) => setSchoolData({...schoolData, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={schoolData.email}
                    onChange={(e) => setSchoolData({...schoolData, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input 
                    id="website" 
                    value={schoolData.website}
                    onChange={(e) => setSchoolData({...schoolData, website: e.target.value})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Admin Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span className="text-lg">Admin Profile</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="adminName">Full Name</Label>
                  <Input 
                    id="adminName" 
                    value={schoolData.principal_name}
                    onChange={(e) => setSchoolData({...schoolData, principal_name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Email</Label>
                  <Input 
                    id="adminEmail" 
                    type="email" 
                    value={schoolData.principal_email}
                    onChange={(e) => setSchoolData({...schoolData, principal_email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminPhone">Phone</Label>
                  <Input 
                    id="adminPhone" 
                    value={schoolData.principal_phone}
                    onChange={(e) => setSchoolData({...schoolData, principal_phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="designation">Designation</Label>
                  <Input 
                    id="designation" 
                    value={schoolData.designation}
                    readOnly
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span className="text-lg">Notification Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm">Email Notifications</Label>
                  <p className="text-xs text-muted-foreground">Receive notifications via email</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm">Fee Payment Alerts</Label>
                  <p className="text-xs text-muted-foreground">Get notified when fees are paid or overdue</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm">Attendance Alerts</Label>
                  <p className="text-xs text-muted-foreground">Daily attendance summary notifications</p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm">Library Reminders</Label>
                  <p className="text-xs text-muted-foreground">Book return reminders and overdue notices</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span className="text-lg">Security Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" type="password" placeholder="Enter current password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" placeholder="Enter new password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" type="password" placeholder="Confirm new password" />
              </div>
              <div className="flex items-center justify-between pt-4">
                <div className="space-y-0.5">
                  <Label className="text-sm">Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          {/* System Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span className="text-lg">System Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm">Automatic Backup</Label>
                  <p className="text-sm text-muted-foreground">Enable daily automatic database backup</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm">Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">Put the system in maintenance mode</p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm">Debug Mode</Label>
                  <p className="text-sm text-muted-foreground">Enable system debugging (for development only)</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Roles
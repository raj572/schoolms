import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  School,
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  Users,
  Award,
  Building,
  Clock,
  Edit,
  Save,
  Camera,
  Plus,
  Trash2,
  Loader2
} from "lucide-react";
import * as schoolInfoService from "@/services/schoolInfoService";

// TypeScript interfaces
interface SchoolFacility {
  id?: number;
  name: string;
  count: number;
  description: string;
  status: string;
  _isNew?: boolean;
}

interface SchoolAchievement {
  id?: number;
  title: string;
  description: string;
  year: string;
  category: string;
  _isNew?: boolean;
}

interface SchoolTiming {
  id?: number;
  day: string;
  morning: string;
  office: string;
  order?: number;
}

export const SchoolInfo = () => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Get school ID from localStorage or context
  const schoolId = parseInt(localStorage.getItem('school_id') || '1');

  const [schoolData, setSchoolData] = useState({
    id: 0,
    name: "",
    email: "",
    phone: "",
    school_code: "",
    address: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
    principal_name: "",
    principal_email: "",
    principal_phone: "",
    principal_sign_path: "",
    affiliation_number: "",
    board: "",
    website: "",
    description: "",
    established_date: "",
    logo_path: "",
    status: "active",
  });

  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalStaff: 0,
  });

  const [facilities, setFacilities] = useState<SchoolFacility[]>([]);
  const [achievements, setAchievements] = useState<SchoolAchievement[]>([]);
  const [timings, setTimings] = useState<SchoolTiming[]>([]);
  
  // File uploads
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);

  // Fetch all school data on component mount
  const fetchSchoolData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch complete school info
      const response = await schoolInfoService.getCompleteSchoolInfo(schoolId);
      
      if (response.status && response.data) {
        const school = response.data;
        setSchoolData({
          id: school.id,
          name: school.name || "",
          email: school.email || "",
          phone: school.phone || "",
          school_code: school.school_code || "",
          address: school.address || "",
          city: school.city || "",
          state: school.state || "",
          country: school.country || "",
          pincode: school.pincode || "",
          principal_name: school.principal_name || "",
          principal_email: school.principal_email || "",
          principal_phone: school.principal_phone || "",
          principal_sign_path: school.principal_sign_path || "",
          affiliation_number: school.affiliation_number || "",
          board: school.board || "",
          website: school.website || "",
          description: school.description || "",
          established_date: school.established_date || "",
          logo_path: school.logo_path || "",
          status: school.status || "active",
        });

        setFacilities(school.facilities || []);
        setAchievements(school.achievements || []);
        setTimings(school.timings || []);
      }

      // Fetch stats separately
      const statsResponse = await schoolInfoService.getSchoolStats(schoolId);
      if (statsResponse.status && statsResponse.data) {
        setStats({
          totalStudents: statsResponse.data.totalStudents || 0,
          totalTeachers: statsResponse.data.totalUsers || 0,
          totalStaff: statsResponse.data.classCount || 0,
        });
      }

      toast({
        title: "Success",
        description: "School data loaded successfully",
      });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      console.error("Error fetching school data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: err?.response?.data?.message || "Failed to load school data",
      });
    } finally {
      setIsLoading(false);
    }
  }, [schoolId, toast]);

  useEffect(() => {
    fetchSchoolData();
  }, [fetchSchoolData]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // 1. Update basic school info
      await schoolInfoService.updateSchoolBasicInfo(schoolData.id, schoolData);

      // 2. Upload logo if changed
      if (logoFile) {
        await schoolInfoService.uploadSchoolLogo(schoolData.id, logoFile);
        setLogoFile(null);
      }

      // 3. Upload signature if changed
      if (signatureFile) {
        await schoolInfoService.uploadPrincipalSignature(schoolData.id, signatureFile);
        setSignatureFile(null);
      }

      // 4. Update facilities - save all with IDs, create new ones without IDs
      for (const facility of facilities) {
        if (facility.id && !facility._isNew) {
          await schoolInfoService.updateFacility(facility.id, {
            name: facility.name,
            count: facility.count,
            description: facility.description,
            status: facility.status || 'active',
          });
        } else if (facility._isNew && facility.name) {
          await schoolInfoService.createFacility(schoolId, {
            name: facility.name,
            count: facility.count || 1,
            description: facility.description,
            status: 'active',
          });
        }
      }

      // 5. Update achievements
      for (const achievement of achievements) {
        if (achievement.id && !achievement._isNew) {
          await schoolInfoService.updateAchievement(achievement.id, {
            title: achievement.title,
            description: achievement.description,
            year: achievement.year,
            category: achievement.category,
          });
        } else if (achievement._isNew && achievement.title) {
          await schoolInfoService.createAchievement(schoolId, {
            title: achievement.title,
            description: achievement.description,
            year: achievement.year,
            category: achievement.category || 'general',
          });
        }
      }

      // 6. Bulk update timings
      const timingsData = timings
        .filter(t => t.day && t.morning && t.office)
        .map((t, index) => ({
          day: t.day,
          morning: t.morning,
          office: t.office,
          order: index,
        }));
      
      if (timingsData.length > 0) {
        await schoolInfoService.bulkUpdateTimings(schoolId, timingsData);
      }

      toast({
        title: "Success",
        description: "School information saved successfully",
      });

    setIsEditing(false);
      
      // Refresh data
      await fetchSchoolData();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      console.error("Error saving school data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: err?.response?.data?.message || "Failed to save school data",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const addFacility = () => {
    setFacilities([...facilities, { name: "", count: 1, description: "", status: "active", _isNew: true }]);
  };

  const removeFacility = async (index: number) => {
    const facility = facilities[index];
    
    if (facility.id && !facility._isNew) {
      try {
        await schoolInfoService.deleteFacility(facility.id);
        toast({
          title: "Success",
          description: "Facility deleted successfully",
        });
    setFacilities(facilities.filter((_, i) => i !== index));
      } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } } };
        toast({
          variant: "destructive",
          title: "Error",
          description: err?.response?.data?.message || "Failed to delete facility",
        });
      }
    } else {
      setFacilities(facilities.filter((_, i) => i !== index));
    }
  };

  const updateFacility = (index: number, field: string, value: string | number) => {
    const updated = [...facilities];
    updated[index] = { ...updated[index], [field]: value };
    setFacilities(updated);
  };

  const addAchievement = () => {
    setAchievements([...achievements, { title: "", description: "", year: new Date().getFullYear().toString(), category: "academic", _isNew: true }]);
  };

  const removeAchievement = async (index: number) => {
    const achievement = achievements[index];
    
    if (achievement.id && !achievement._isNew) {
      try {
        await schoolInfoService.deleteAchievement(achievement.id);
        toast({
          title: "Success",
          description: "Achievement deleted successfully",
        });
    setAchievements(achievements.filter((_, i) => i !== index));
      } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } } };
        toast({
          variant: "destructive",
          title: "Error",
          description: err?.response?.data?.message || "Failed to delete achievement",
        });
      }
    } else {
      setAchievements(achievements.filter((_, i) => i !== index));
    }
  };

  const updateAchievement = (index: number, field: string, value: string) => {
    const updated = [...achievements];
    updated[index] = { ...updated[index], [field]: value };
    setAchievements(updated);
  };

  const updateTiming = (index: number, field: string, value: string) => {
    const updated = [...timings];
    updated[index] = { ...updated[index], [field]: value };
    setTimings(updated);
  };

  const updateSchoolData = (field: string, value: string | number) => {
    setSchoolData({ ...schoolData, [field]: value });
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setSchoolData({ ...schoolData, logo_path: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignatureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSignatureFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setSchoolData({ ...schoolData, principal_sign_path: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-gray-500">Loading school information...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">School Information</h2>
          <p className="text-gray-500 text-sm">Complete school profile and institutional details</p>
        </div>
        <Button 
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          variant={isEditing ? "default" : "default"}
          size="lg"
          disabled={isSaving}
          className={isEditing 
            ? "bg-green-600 hover:bg-green-700 text-white shadow-lg" 
            : "bg-primary hover:bg-primary/90 text-white shadow-lg"
          }
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Saving...
            </>
          ) : isEditing ? (
            <>
              <Save className="mr-2 h-5 w-5" />
              Save Changes
            </>
          ) : (
            <>
              <Edit className="mr-2 h-5 w-5" />
              Edit Info
            </>
          )}
        </Button>
      </div>

      {/* Edit Mode Indicator */}
      {isEditing && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Edit className="h-5 w-5 text-primary" />
            <p className="text-sm font-medium text-primary">
              Edit Mode Active - Make your changes and click "Save Changes" when done
            </p>
          </div>
        </div>
      )}

      {/* School Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-full">
        <Card className="bg-gradient-card shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500">Total Students</p>
                <p className="text-lg font-bold ">{stats.totalStudents}</p>
              </div>
              <Users className="h-6 w-6 " />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500">Teaching Staff</p>
                <p className="text-lg font-bold text-success">{stats.totalTeachers}</p>
              </div>
              <School className="h-6 w-6 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500">Classes</p>
                <p className="text-lg font-bold text-warning">{stats.totalStaff}</p>
              </div>
              <Building className="h-6 w-6 text-warning" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500">Established</p>
                <p className="text-lg font-bold">{schoolData.established_date ? new Date(schoolData.established_date).getFullYear() : 'N/A'}</p>
              </div>
              <Calendar className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="principal">Principal</TabsTrigger>
          <TabsTrigger value="facilities">Facilities</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="timings">Timings</TabsTrigger>
        </TabsList>

        {/* Basic Info Tab */}
        <TabsContent value="basic" className="space-y-4">
          <Card className="bg-gradient-card shadow-soft">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-primary/10 rounded-lg flex items-center justify-center relative">
                  {schoolData.logo_path ? (
                    <img src={schoolData.logo_path} alt="School Logo" className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <School className="h-10 w-10 text-primary" />
                  )}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{schoolData.name || "School Name"}</CardTitle>
                  <CardDescription className="text-xs">{schoolData.description?.substring(0, 100)}</CardDescription>
                </div>
                {isEditing && (
                  <>
                    <input
                      type="file"
                      id="logo-upload"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoUpload}
                      aria-label="Upload school logo"
                    />
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => document.getElementById('logo-upload')?.click()}
                    >
                    <Camera className="h-4 w-4 mr-2" />
                    Upload Logo
                  </Button>
                  </>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500">School Name *</label>
                    {isEditing ? (
                      <Input 
                        value={schoolData.name} 
                        onChange={(e) => updateSchoolData('name', e.target.value)}
                        className="mt-1" 
                        required
                      />
                    ) : (
                      <p className="text-sm font-medium mt-1">{schoolData.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">School Code</label>
                    {isEditing ? (
                      <Input 
                        value={schoolData.school_code} 
                        onChange={(e) => updateSchoolData('school_code', e.target.value)}
                        className="mt-1" 
                      />
                    ) : (
                      <p className="text-sm mt-1">{schoolData.school_code}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Board</label>
                    {isEditing ? (
                      <Input 
                        value={schoolData.board} 
                        onChange={(e) => updateSchoolData('board', e.target.value)}
                        className="mt-1" 
                        placeholder="CBSE, ICSE, State Board, etc."
                      />
                    ) : (
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="default">{schoolData.board}</Badge>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Affiliation Number</label>
                    {isEditing ? (
                      <Input 
                        value={schoolData.affiliation_number} 
                        onChange={(e) => updateSchoolData('affiliation_number', e.target.value)}
                        className="mt-1" 
                      />
                    ) : (
                      <p className="text-sm mt-1">{schoolData.affiliation_number}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500">Established Date</label>
                    {isEditing ? (
                      <Input 
                        type="date"
                        value={schoolData.established_date} 
                        onChange={(e) => updateSchoolData('established_date', e.target.value)}
                        className="mt-1" 
                      />
                    ) : (
                      <p className="text-sm mt-1">{new Date(schoolData.established_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Website</label>
                    {isEditing ? (
                      <Input 
                        value={schoolData.website} 
                        onChange={(e) => updateSchoolData('website', e.target.value)}
                        className="mt-1" 
                        placeholder="www.schoolname.edu"
                      />
                    ) : (
                      <p className="text-sm mt-1">{schoolData.website}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Status</label>
                    {isEditing ? (
                      <Select
                        value={schoolData.status}
                        onValueChange={(value) => updateSchoolData('status', value)}
                      >
                        <SelectTrigger className="mt-1 w-full">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={schoolData.status === 'active' ? 'default' : 'secondary'}>
                          {schoolData.status.charAt(0).toUpperCase() + schoolData.status.slice(1)}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Description / About School</label>
                {isEditing ? (
                  <Textarea 
                    value={schoolData.description} 
                    onChange={(e) => updateSchoolData('description', e.target.value)}
                    className="mt-1" 
                    rows={4}
                    placeholder="Write about your school, motto, vision, mission..."
                  />
                ) : (
                  <p className="text-sm mt-1 text-gray-600">{schoolData.description}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact" className="space-y-4">
          <Card className="bg-gradient-card shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
              <CardDescription className="text-xs text-gray-500">School's official contact details and address</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-1" />
                  <div className="flex-1 space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-500">Address</label>
                      {isEditing ? (
                        <Input 
                          value={schoolData.address} 
                          onChange={(e) => updateSchoolData('address', e.target.value)}
                          className="mt-1" 
                          placeholder="Street address"
                        />
                      ) : (
                        <p className="text-sm mt-1">{schoolData.address}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-gray-500">City</label>
                        {isEditing ? (
                          <Input 
                            value={schoolData.city} 
                            onChange={(e) => updateSchoolData('city', e.target.value)}
                            className="mt-1" 
                          />
                        ) : (
                          <p className="text-sm mt-1">{schoolData.city}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500">State</label>
                        {isEditing ? (
                          <Input 
                            value={schoolData.state} 
                            onChange={(e) => updateSchoolData('state', e.target.value)}
                            className="mt-1" 
                          />
                        ) : (
                          <p className="text-sm mt-1">{schoolData.state}</p>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-gray-500">Country</label>
                        {isEditing ? (
                          <Input 
                            value={schoolData.country} 
                            onChange={(e) => updateSchoolData('country', e.target.value)}
                            className="mt-1" 
                          />
                        ) : (
                          <p className="text-sm mt-1">{schoolData.country}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500">Pincode</label>
                        {isEditing ? (
                          <Input 
                            value={schoolData.pincode} 
                            onChange={(e) => updateSchoolData('pincode', e.target.value)}
                            className="mt-1" 
                          />
                        ) : (
                          <p className="text-sm mt-1">{schoolData.pincode}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <label className="text-xs font-medium text-gray-500">Phone</label>
                    {isEditing ? (
                      <Input 
                        value={schoolData.phone} 
                        onChange={(e) => updateSchoolData('phone', e.target.value)}
                        className="mt-1" 
                        placeholder="+1 (555) 123-4567"
                      />
                    ) : (
                      <p className="text-sm mt-1">{schoolData.phone}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <label className="text-xs font-medium text-gray-500">Email</label>
                    {isEditing ? (
                      <Input 
                        type="email"
                        value={schoolData.email} 
                        onChange={(e) => updateSchoolData('email', e.target.value)}
                        className="mt-1" 
                        placeholder="info@school.edu"
                      />
                    ) : (
                      <p className="text-sm mt-1">{schoolData.email}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <label className="text-xs font-medium text-gray-500">Website</label>
                    {isEditing ? (
                      <Input 
                        value={schoolData.website} 
                        onChange={(e) => updateSchoolData('website', e.target.value)}
                        className="mt-1" 
                        placeholder="www.school.edu"
                      />
                    ) : (
                      <p className="text-sm mt-1">{schoolData.website}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Principal Tab */}
        <TabsContent value="principal" className="space-y-4">
          <Card className="bg-gradient-card shadow-soft">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Principal Information</CardTitle>
                  <CardDescription className="text-xs text-gray-500">Principal's details and contact information</CardDescription>
                </div>
                {isEditing && (
                  <>
                    <input
                      type="file"
                      id="signature-upload"
                      accept="image/*"
                      className="hidden"
                      onChange={handleSignatureUpload}
                      aria-label="Upload principal signature"
                    />
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => document.getElementById('signature-upload')?.click()}
                    >
                    <Camera className="h-4 w-4 mr-2" />
                    Upload Signature
                  </Button>
                  </>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500">Principal Name</label>
                    {isEditing ? (
                      <Input 
                        value={schoolData.principal_name} 
                        onChange={(e) => updateSchoolData('principal_name', e.target.value)}
                        className="mt-1" 
                        placeholder="Dr. John Doe"
                      />
                    ) : (
                      <p className="text-sm mt-1">{schoolData.principal_name}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Principal Email</label>
                    {isEditing ? (
                      <Input 
                        type="email"
                        value={schoolData.principal_email} 
                        onChange={(e) => updateSchoolData('principal_email', e.target.value)}
                        className="mt-1" 
                        placeholder="principal@school.edu"
                      />
                    ) : (
                      <p className="text-sm mt-1">{schoolData.principal_email}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500">Principal Phone</label>
                    {isEditing ? (
                      <Input 
                        value={schoolData.principal_phone} 
                        onChange={(e) => updateSchoolData('principal_phone', e.target.value)}
                        className="mt-1" 
                        placeholder="+1 (555) 123-4568"
                      />
                    ) : (
                      <p className="text-sm mt-1">{schoolData.principal_phone}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Digital Signature</label>
                    {schoolData.principal_sign_path ? (
                      <div className="mt-1 border rounded-md p-3 bg-gray-50">
                        <img src={schoolData.principal_sign_path} alt="Principal Signature" className="h-16 object-contain" />
                      </div>
                    ) : (
                      <p className="text-sm mt-1 text-gray-400 italic">No signature uploaded</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Facilities Tab */}
        <TabsContent value="facilities" className="space-y-4">
          <Card className="bg-gradient-card shadow-soft">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">School Facilities</CardTitle>
                  <CardDescription className="text-xs text-gray-500">Infrastructure and amenities available</CardDescription>
                </div>
                {isEditing && (
                  <Button onClick={addFacility} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Facility
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {facilities.map((facility, index) => (
                  <Card key={index} className="border">
                    <CardContent className="pt-4">
                      {isEditing ? (
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <Input
                              value={facility.name}
                              onChange={(e) => updateFacility(index, 'name', e.target.value)}
                              placeholder="Facility name"
                              className="flex-1"
                            />
                            <Input
                              type="number"
                              value={facility.count}
                              onChange={(e) => updateFacility(index, 'count', parseInt(e.target.value) || 0)}
                              placeholder="Count"
                              className="w-20"
                            />
                            <Button
                              onClick={() => removeFacility(index)}
                              size="sm"
                              variant="ghost"
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <Textarea
                            value={facility.description}
                            onChange={(e) => updateFacility(index, 'description', e.target.value)}
                            placeholder="Description"
                            rows={2}
                          />
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-xs text-gray-500">{facility.name}</h4>
                            <Badge variant="outline">{facility.count}</Badge>
                          </div>
                          <p className="text-xs text-gray-500">{facility.description}</p>
                        </>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-4">
          <Card className="bg-gradient-card shadow-soft">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">School Achievements</CardTitle>
                  <CardDescription className="text-xs text-gray-500">Awards and recognitions received</CardDescription>
                </div>
                {isEditing && (
                  <Button onClick={addAchievement} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Achievement
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {achievements.map((achievement, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-accent/30">
                    <Award className="h-6 w-6 text-warning mt-1" />
                    <div className="flex-1">
                      {isEditing ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Input
                              value={achievement.title}
                              onChange={(e) => updateAchievement(index, 'title', e.target.value)}
                              placeholder="Achievement title"
                              className="flex-1"
                            />
                            <Input
                              value={achievement.year}
                              onChange={(e) => updateAchievement(index, 'year', e.target.value)}
                              placeholder="Year"
                              className="w-24"
                            />
                            <Button
                              onClick={() => removeAchievement(index)}
                              size="sm"
                              variant="ghost"
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <Input
                            value={achievement.description}
                            onChange={(e) => updateAchievement(index, 'description', e.target.value)}
                            placeholder="Description"
                          />
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-xs text-gray-500">{achievement.title}</h4>
                            <Badge variant="secondary">{achievement.year}</Badge>
                          </div>
                          <p className="text-xs text-gray-500">{achievement.description}</p>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timings Tab */}
        <TabsContent value="timings" className="space-y-4">
          <Card className="bg-gradient-card shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg">School Timings</CardTitle>
              <CardDescription className="text-xs text-gray-500">Operating hours and schedules</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timings.map((timing, index) => (
                  <div key={index} className="p-4 rounded-lg bg-accent/20">
                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Clock className="h-5 w-5 text-primary" />
                          <Input
                            value={timing.day}
                            onChange={(e) => updateTiming(index, 'day', e.target.value)}
                            placeholder="Day(s)"
                            className="flex-1"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3 ml-8">
                          <div>
                            <label className="text-xs font-medium text-gray-500 block mb-1">Classes</label>
                            <Input
                              value={timing.morning}
                              onChange={(e) => updateTiming(index, 'morning', e.target.value)}
                              placeholder="Classes time"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 block mb-1">Office</label>
                            <Input
                              value={timing.office}
                              onChange={(e) => updateTiming(index, 'office', e.target.value)}
                              placeholder="Office time"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Clock className="h-5 w-5 text-primary" />
                          <span className="font-medium text-xs">{timing.day}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-xs">Classes: {timing.morning}</p>
                          <p className="text-xs text-gray-500">Office: {timing.office}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SchoolInfo;
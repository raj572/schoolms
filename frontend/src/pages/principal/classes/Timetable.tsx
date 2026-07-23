import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {  Calendar, Clock, Plus, Save, X, Trash2, RotateCcw, AlertCircle, Settings, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/useAuthStore';
import { ClassForm, useClassStore } from '@/store/useClassStore';
import { TeacherForm, useUsersStore } from '@/store/useUsersStore';
import { useTimetableStore, TimetableEntry, Subject } from '@/store/useTimetableStore';
import { TimeSlot } from '@/store/useTimeSlotStore';
import Heading from '@/components/common/Heading';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Default number of periods per day (can be customized)
const DEFAULT_PERIODS_PER_DAY = 8;

// Period configuration type
interface PeriodConfig {
  [day: string]: number; // day -> number of periods
}

interface LocalEntry {
  id?: number;
  day: string;
  start_time: string;
  end_time: string;
  subject_id: number | null;
  teacher_id: number | null;
  isModified?: boolean;
  isNew?: boolean;
  isDeleted?: boolean;
}

const Timetable = () => {
  const { authUser } = useAuthStore();
  const { toast } = useToast();
  const { getClasses } = useClassStore();
  const { getAllTeachers } = useUsersStore();
  const { getTimetable, createTimetable, deleteTimetableEntry, getSubjects } = useTimetableStore();

  const [classes, setClasses] = useState<ClassForm[]>([]);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [teachers, setTeachers] = useState<TeacherForm[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [originalData, setOriginalData] = useState<TimetableEntry[]>([]);
  const [localEntries, setLocalEntries] = useState<Map<string, LocalEntry>>(new Map());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Periods configuration
  const [periodsPerDay, setPeriodsPerDay] = useState<PeriodConfig>(() => {
    const config: PeriodConfig = {};
    DAYS.forEach(day => {
      config[day] = DEFAULT_PERIODS_PER_DAY;
    });
    return config;
  });
  const [periodsDialogOpen, setPeriodsDialogOpen] = useState(false);
  const [localPeriodsConfig, setLocalPeriodsConfig] = useState<PeriodConfig>({});

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentCellKey, setCurrentCellKey] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    subject_id: number | null;
    teacher_id: number | null;
    start_time: string;
    end_time: string;
  }>({
    subject_id: null,
    teacher_id: null,
    start_time: '',
    end_time: '',
  });

  // Conflict detection
  const [conflicts, setConflicts] = useState<Array<{
    class: string;
    day: string;
    time: string;
    subject: string;
  }>>([]);
  const [checkingConflicts, setCheckingConflicts] = useState(false);

  // Normalize time format to HH:MM (remove seconds if present)
  const normalizeTime = (time: string) => {
    if (!time) return '';
    // If time has seconds (HH:MM:SS), remove them
    return time.substring(0, 5);
  };

  // Generate unique key for cell based on day and period number
  const getCellKey = (day: string, periodNumber: number) => {
    return `${day}-period-${periodNumber}`;
  };
  
  // Generate key from day, start_time, end_time (for backend data)
  const getTimeBasedKey = (day: string, startTime: string, endTime: string) => {
    return `${day}-${normalizeTime(startTime)}-${normalizeTime(endTime)}`;
  };

  // Convert start time to period number (assumes periods start at 8:00 AM, 1 hour each)
  const timeToPeriod = (startTime: string): number => {
    const time = normalizeTime(startTime);
    const [hours] = time.split(':').map(Number);
    // Period 1 starts at 8:00 (hour 8), Period 2 at 9:00, etc.
    return hours - 7; // 8:00 -> 1, 9:00 -> 2, etc.
  };

  // Fetch initial data
  useEffect(() => {
    const schoolId = authUser?.school_id;
    if (!schoolId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [classesData, teachersData, subjectsData] = await Promise.all([
          getClasses(schoolId),
          getAllTeachers(schoolId),
          getSubjects(Number(schoolId)),
        ]);

        if (classesData) setClasses(classesData);
        if (teachersData) setTeachers(teachersData);
        if (subjectsData) setSubjects(subjectsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load required data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser?.school_id]);

  // Fetch timetable when class is selected
  useEffect(() => {
    if (!selectedClass || !authUser?.school_id) return;

    const fetchTimetable = async () => {
      setLoading(true);
      try {
        const data = await getTimetable(Number(authUser.school_id), selectedClass);
        setOriginalData(data);
        
        // Initialize local entries from fetched data
        // Map time-based data to period numbers
        const entriesMap = new Map<string, LocalEntry>();
        console.log('📅 Initial timetable data:', data);
        
        // Build period mapping from time ranges
        let maxPeriodNeeded = DEFAULT_PERIODS_PER_DAY;
        
        data.forEach((entry) => {
          // Convert start time to period number
          const periodNumber = timeToPeriod(entry.start_time || '08:00');
          const periodKey = getCellKey(entry.day_of_week || '', periodNumber);
          
          // Track the maximum period number needed
          if (periodNumber > maxPeriodNeeded) {
            maxPeriodNeeded = periodNumber;
          }
          
          console.log(`Mapping ${entry.day_of_week} ${entry.start_time}-${entry.end_time} to Period ${periodNumber}`);
          
          entriesMap.set(periodKey, {
            id: entry.id,
            day: entry.day_of_week || '',
            start_time: normalizeTime(entry.start_time || ''),
            end_time: normalizeTime(entry.end_time || ''),
            subject_id: entry.subject_id || null,
            teacher_id: entry.teacher_id || null,
          });
        });
        
        // Auto-adjust periods configuration if data requires more periods
        if (maxPeriodNeeded > DEFAULT_PERIODS_PER_DAY) {
          console.log(`📊 Auto-adjusting periods from ${DEFAULT_PERIODS_PER_DAY} to ${maxPeriodNeeded}`);
          const newConfig: PeriodConfig = {};
          DAYS.forEach(day => {
            newConfig[day] = maxPeriodNeeded;
          });
          setPeriodsPerDay(newConfig);
        }
        
        console.log('📊 Initial entries in map:', entriesMap.size);
        setLocalEntries(entriesMap);
      } catch (error) {
        console.error('Error fetching timetable:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTimetable();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClass, authUser?.school_id]);

  // Get entry for a specific cell
  const getLocalEntry = (day: string, periodNumber: number): LocalEntry | undefined => {
    const key = getCellKey(day, periodNumber);
    return localEntries.get(key);
  };

  // Handle cell click
  const handleCellClick = (day: string, periodNumber: number) => {
    if (!selectedClass) {
      toast({
        title: 'No Class Selected',
        description: 'Please select a class first',
        variant: 'destructive',
      });
      return;
    }

    const key = getCellKey(day, periodNumber);
    const entry = localEntries.get(key);

    setCurrentCellKey(key);
    
    // Clear previous conflicts
    setConflicts([]);
    
    // Generate default times for period (each period is 1 hour, starting from 8:00 AM)
    const startHour = 7 + periodNumber; // Start from 8:00 AM (period 1 = 8:00-9:00)
    const endHour = startHour + 1;
    const defaultStartTime = `${startHour.toString().padStart(2, '0')}:00`;
    const defaultEndTime = `${endHour.toString().padStart(2, '0')}:00`;
    
    if (entry && !entry.isDeleted) {
      setFormData({
        subject_id: entry.subject_id,
        teacher_id: entry.teacher_id,
        start_time: entry.start_time || defaultStartTime,
        end_time: entry.end_time || defaultEndTime,
      });
    } else {
      setFormData({
        subject_id: null,
        teacher_id: null,
        start_time: defaultStartTime,
        end_time: defaultEndTime,
      });
    }
    setDialogOpen(true);
  };

  // Check for teacher conflicts
  const checkTeacherConflicts = async (teacherId: number, day: string, startTime: string, endTime: string, currentEntryId?: number) => {
    if (!authUser?.school_id) return [];

    setCheckingConflicts(true);
    try {
      // Get all timetable entries for this teacher across all classes
      const response = await getTimetable(Number(authUser.school_id));
      
      const conflictingEntries = response.filter((entry: TimetableEntry) => {
        // Skip the current entry being edited
        if (currentEntryId && entry.id === currentEntryId) return false;
        
        // Check if same teacher, same day
        if (entry.teacher_id !== teacherId || entry.day_of_week !== day) return false;
        
        // Check for time overlap
        const entryStart = normalizeTime(entry.start_time || '');
        const entryEnd = normalizeTime(entry.end_time || '');
        const newStart = normalizeTime(startTime);
        const newEnd = normalizeTime(endTime);
        
        // Time overlap logic: Check if times overlap
        return (newStart < entryEnd && newEnd > entryStart);
      });

      const conflictDetails = conflictingEntries.map((entry: TimetableEntry) => ({
        class: `${entry.class?.class || 'Unknown'}${entry.class?.section ? ` ${entry.class.section}` : ''}`,
        day: entry.day_of_week || '',
        time: `${normalizeTime(entry.start_time || '')} - ${normalizeTime(entry.end_time || '')}`,
        subject: entry.subject?.subject_name || 'Unknown Subject',
      }));

      setConflicts(conflictDetails);
      return conflictDetails;
    } catch (error) {
      console.error('Error checking conflicts:', error);
      return [];
    } finally {
      setCheckingConflicts(false);
    }
  };

  // Handle save entry locally (not to server yet)
  const handleSaveEntryLocally = async () => {
    if (!currentCellKey) return;
    
    // Validate subject and teacher
    if (!formData.subject_id || !formData.teacher_id) {
      toast({
        title: 'Missing Information',
        description: 'Please select both subject and teacher',
        variant: 'destructive',
      });
      return;
    }

    // Validate times
    if (!formData.start_time || !formData.end_time) {
      toast({
        title: 'Missing Time',
        description: 'Please specify start and end time',
        variant: 'destructive',
      });
      return;
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(formData.start_time) || !timeRegex.test(formData.end_time)) {
      toast({
        title: 'Invalid Time Format',
        description: 'Please enter time in HH:MM format',
        variant: 'destructive',
      });
      return;
    }

    // Validate end time is after start time
    if (formData.start_time >= formData.end_time) {
      toast({
        title: 'Invalid Time Range',
        description: 'End time must be after start time',
        variant: 'destructive',
      });
      return;
    }

    const existingEntry = localEntries.get(currentCellKey);
    
    // Extract day from currentCellKey
    const [day] = currentCellKey.split('-');
    
    // Check for teacher conflicts
    const conflictList = await checkTeacherConflicts(
      formData.teacher_id,
      day,
      formData.start_time,
      formData.end_time,
      existingEntry?.id
    );

    // If conflicts exist, show warning and don't proceed
    if (conflictList.length > 0) {
      toast({
        title: 'Teacher Conflict Detected',
        description: `This teacher is already assigned to ${conflictList[0].class} at this time. Please check the conflicts section below.`,
        variant: 'destructive',
      });
      return;
    }

    const existingEntry2 = localEntries.get(currentCellKey);
    
    console.log('💾 Saving entry:', {
      currentKey: currentCellKey,
      existingEntry,
      formData
    });

    // Determine if this is new or modified
    // If existingEntry has an id, it came from the database - so it's modified
    // If existingEntry.isNew, it's a new entry we're updating
    // If no existingEntry, it's a brand new entry
    const hasId = existingEntry2?.id;

    // Extract day and period from currentCellKey
    const [day2, , periodStr] = currentCellKey.split('-');
    
    const newEntry: LocalEntry = {
      id: hasId,
      day: day2,
      start_time: formData.start_time,
      end_time: formData.end_time,
      subject_id: formData.subject_id,
      teacher_id: formData.teacher_id,
      isModified: hasId ? true : undefined, // Has DB id = modifying existing
      isNew: !hasId ? true : undefined,      // No DB id = new entry
    };

    const updatedEntries = new Map(localEntries);
    updatedEntries.set(currentCellKey, newEntry);
    setLocalEntries(updatedEntries);

    // Clear conflicts
    setConflicts([]);

    toast({
      title: 'Entry Updated',
      description: 'Changes saved locally. Click "Save All" to apply changes.',
    });

    setDialogOpen(false);
    setCurrentCellKey(null);
  };

  // Handle delete entry locally
  const handleDeleteEntryLocally = () => {
    if (!currentCellKey) return;

    const entry = localEntries.get(currentCellKey);
    if (!entry) return;

    const updatedEntries = new Map(localEntries);
    
    if (entry.id) {
      // Mark for deletion if it exists in DB
      updatedEntries.set(currentCellKey, { ...entry, isDeleted: true });
    } else {
      // Just remove if it's a new entry
      updatedEntries.delete(currentCellKey);
    }
    
    setLocalEntries(updatedEntries);

    toast({
      title: 'Entry Marked for Deletion',
      description: 'Click "Save All" to apply changes.',
    });

    setDialogOpen(false);
    setCurrentCellKey(null);
  };

  // Calculate pending changes
  const getPendingChanges = () => {
    let newCount = 0;
    let modifiedCount = 0;
    let deletedCount = 0;

    localEntries.forEach((entry) => {
      if (entry.isDeleted) deletedCount++;
      else if (entry.isNew) newCount++;
      else if (entry.isModified) modifiedCount++;
    });

    return { newCount, modifiedCount, deletedCount, total: newCount + modifiedCount + deletedCount };
  };

  // Handle save all to server
  const handleSaveAll = async () => {
    if (!selectedClass || !authUser?.school_id) return;

    const changes = getPendingChanges();
    if (changes.total === 0) {
      toast({
        title: 'No Changes',
        description: 'No pending changes to save',
      });
      return;
    }

    setSaving(true);
    try {
      // Collect entries to delete and create
      const entriesToDelete: number[] = [];
      const entriesToCreate: Array<{
        school_id: number;
        class_id: number;
        subject_id: number | null;
        teacher_id: number | null;
        day_of_week: string;
        start_time: string;
        end_time: string;
      }> = [];

      localEntries.forEach((entry) => {
        if (entry.isDeleted && entry.id) {
          // Entry marked for deletion
          entriesToDelete.push(entry.id);
        } else if (!entry.isDeleted) {
          if (entry.isModified && entry.id) {
            // Modified entry: delete old, create new
            console.log('🔄 Modified entry detected, will delete old ID:', entry.id);
            entriesToDelete.push(entry.id);
            entriesToCreate.push({
              school_id: Number(authUser.school_id),
              class_id: selectedClass,
              subject_id: entry.subject_id,
              teacher_id: entry.teacher_id,
              day_of_week: entry.day,
              start_time: entry.start_time,
              end_time: entry.end_time,
            });
          } else if (entry.isNew) {
            // New entry: just create
            console.log('➕ New entry detected');
            entriesToCreate.push({
              school_id: Number(authUser.school_id),
              class_id: selectedClass,
              subject_id: entry.subject_id,
              teacher_id: entry.teacher_id,
              day_of_week: entry.day,
              start_time: entry.start_time,
              end_time: entry.end_time,
            });
          }
        }
      });

      console.log('💾 Save summary:', {
        toDelete: entriesToDelete.length,
        toCreate: entriesToCreate.length,
      });

      // Delete old entries if any
      if (entriesToDelete.length > 0) {
        console.log('🗑️ Deleting entries:', entriesToDelete);
        for (const id of entriesToDelete) {
          await deleteTimetableEntry(id);
        }
      }

      // Create/update entries
      if (entriesToCreate.length > 0) {
        console.log('➕ Creating entries:', entriesToCreate);
        await createTimetable({
          school_id: Number(authUser.school_id),
          timetable: entriesToCreate,
        });
      }

      // Refresh timetable
      const updatedData = await getTimetable(Number(authUser.school_id), selectedClass);
      console.log('📅 Timetable data received from server:', updatedData);
      setOriginalData(updatedData);
      
      // Reset local entries
      const entriesMap = new Map<string, LocalEntry>();
      updatedData.forEach((entry) => {
        // Convert start time to period number
        const periodNumber = timeToPeriod(entry.start_time || '08:00');
        const key = getCellKey(entry.day_of_week || '', periodNumber);
        
        console.log('🔑 Generated period key:', key, 'for entry:', entry);
        console.log('   - Day:', entry.day_of_week);
        console.log('   - Start time:', entry.start_time, '→ Period', periodNumber);
        console.log('   - Subject ID:', entry.subject_id);
        console.log('   - Teacher ID:', entry.teacher_id);
        
        entriesMap.set(key, {
          id: entry.id,
          day: entry.day_of_week || '',
          start_time: normalizeTime(entry.start_time || ''),
          end_time: normalizeTime(entry.end_time || ''),
          subject_id: entry.subject_id || null,
          teacher_id: entry.teacher_id || null,
        });
      });
      console.log('📊 Total entries in map:', entriesMap.size);
      console.log('📋 All keys in map:', Array.from(entriesMap.keys()));
      setLocalEntries(entriesMap);

      toast({
        title: 'Success',
        description: `Saved ${changes.total} change(s) successfully`,
      });
    } catch (error) {
      console.error('Error saving timetable:', error);
      toast({
        title: 'Error',
        description: 'Failed to save changes',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle reset (discard changes)
  const handleReset = () => {
    if (!window.confirm('Discard all unsaved changes?')) return;

    // Reset to original data
    const entriesMap = new Map<string, LocalEntry>();
    originalData.forEach((entry) => {
      // Convert start time to period number
      const periodNumber = timeToPeriod(entry.start_time || '08:00');
      const key = getCellKey(entry.day_of_week || '', periodNumber);
      
      entriesMap.set(key, {
        id: entry.id,
        day: entry.day_of_week || '',
        start_time: normalizeTime(entry.start_time || ''),
        end_time: normalizeTime(entry.end_time || ''),
        subject_id: entry.subject_id || null,
        teacher_id: entry.teacher_id || null,
      });
    });
    setLocalEntries(entriesMap);

    toast({
      title: 'Changes Discarded',
      description: 'All unsaved changes have been reset',
    });
  };

  // Handle open time slots dialog
  const handleOpenTimeSlotsDialog = () => {
    setLocalPeriodsConfig({...periodsPerDay});
    setPeriodsDialogOpen(true);
  };

  // Handle update period count for a day
  const handleUpdateDayPeriods = (day: string, count: number) => {
    setLocalPeriodsConfig({
      ...localPeriodsConfig,
      [day]: Math.max(1, Math.min(12, count)) // Min 1, Max 12 periods
    });
  };

  // Handle save periods configuration
  const handleSavePeriodsConfig = () => {
    setPeriodsPerDay(localPeriodsConfig);
    setPeriodsDialogOpen(false);
    toast({
      title: 'Success',
      description: 'Periods configuration updated successfully',
    });
  };

  const selectedClassDetails = classes.find((c) => c.id === selectedClass);
  const pendingChanges = getPendingChanges();
  const hasChanges = pendingChanges.total > 0;

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 md:gap-0 md:justify-between md:items-center">
        <Heading title="Class Timetable" description="Manage weekly class schedule with custom timings" />
        
        <div className="flex items-center gap-3">
          {hasChanges && (
            <Badge variant="secondary" className="animate-pulse">
              {pendingChanges.total} Unsaved Changes
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenTimeSlotsDialog}
            className="gap-2"
          >
            <Settings className="h-4 w-4" />
            Manage Periods
          </Button>
          <Calendar className="h-5 w-5 text-primary" />
          <Clock className="h-5 w-5 text-primary" />
        </div>
      </div>

      {/* Pending Changes Alert */}
      {hasChanges && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You have {pendingChanges.newCount} new, {pendingChanges.modifiedCount} modified, and{' '}
            {pendingChanges.deletedCount} deleted entries. Click "Save All" to apply changes.
          </AlertDescription>
        </Alert>
      )}

      {/* Class Selector and Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <CardTitle className="text-lg">Select Class</CardTitle>
              <CardDescription>Choose a class to view or manage its timetable</CardDescription>
            </div>
            
            <div className="flex gap-2">
              {hasChanges && (
                <Button
                  variant="outline"
                  onClick={handleReset}
                  disabled={saving}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              )}
              <Button
                onClick={handleSaveAll}
                disabled={!hasChanges || saving}
                className="min-w-[120px]"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : `Save All${hasChanges ? ` (${pendingChanges.total})` : ''}`}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Class</Label>
              <Select
                value={selectedClass?.toString() || ''}
                onValueChange={(value) => setSelectedClass(Number(value))}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loading ? 'Loading classes...' : 'Select a class'} />
                </SelectTrigger>
                <SelectContent>
                  {classes.length === 0 ? (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      No classes available
                    </div>
                  ) : (
                    classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id?.toString() || ''}>
                        Class {cls.class} {cls.section && `- ${cls.section}`}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {selectedClassDetails && (
              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm font-medium">Teacher In Charge</p>
                  <p className="text-sm text-muted-foreground">{selectedClassDetails.teacher_in_charge || 'Not assigned'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Room</p>
                  <p className="text-sm text-muted-foreground">{selectedClassDetails.room_no || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Capacity</p>
                  <p className="text-sm text-muted-foreground">{selectedClassDetails.capacity || 0} students</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Timetable Grid */}
      {selectedClass && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Weekly Timetable {selectedClassDetails && `- Class ${selectedClassDetails.class}${selectedClassDetails.section ? ` ${selectedClassDetails.section}` : ''}`}
            </CardTitle>
            <CardDescription>Click on any cell to add or edit schedule with custom timings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[1000px]">
                <thead>
                  <tr>
                    <th className="border border-border bg-muted p-3 text-left font-medium text-sm min-w-[120px]">
                      Period
                    </th>
                    {DAYS.map((day) => (
                      <th
                        key={day}
                        className="border border-border bg-muted p-3 text-center font-medium text-sm min-w-[140px]"
                      >
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Render rows for maximum periods across all days */}
                  {Array.from({ length: Math.max(...Object.values(periodsPerDay)) }, (_, index) => {
                    const periodNumber = index + 1;
                    
                    return (
                      <tr key={`period-${periodNumber}`}>
                        <td className="border border-border p-3 font-medium text-sm bg-muted/30">
                          <div className="flex flex-col">
                            <span className="font-semibold text-primary">
                              Period {periodNumber}
                            </span>
                          </div>
                        </td>
                      {DAYS.map((day) => {
                        // Check if this day has this many periods
                        const dayPeriods = periodsPerDay[day] || DEFAULT_PERIODS_PER_DAY;
                        if (periodNumber > dayPeriods) {
                          return (
                            <td
                              key={day}
                              className="border border-border p-3 text-center bg-gray-100 dark:bg-gray-900/20"
                            >
                              <div className="text-xs text-muted-foreground">
                                -
                              </div>
                            </td>
                          );
                        }

                        const entry = getLocalEntry(day, periodNumber);
                        const isDeleted = entry?.isDeleted;
                        const isModified = entry?.isModified || entry?.isNew;

                        return (
                          <td
                            key={day}
                            className={`border border-border p-2 cursor-pointer transition-colors ${
                              isDeleted
                                ? 'bg-red-50 dark:bg-red-950/20 opacity-50'
                                : isModified
                                ? 'bg-green-50 dark:bg-green-950/20 hover:bg-green-100 dark:hover:bg-green-950/30'
                                : 'hover:bg-muted/50'
                            }`}
                            onClick={() => handleCellClick(day, periodNumber)}
                          >
                            {entry && !isDeleted ? (
                              <div className={`p-3 rounded-lg min-h-[80px] ${
                                isModified 
                                  ? 'bg-green-100 dark:bg-green-900/30 border-2 border-green-500' 
                                  : 'bg-primary/10 hover:bg-primary/20'
                              }`}>
                                <div className="font-medium text-xs text-primary mb-1">
                                  {subjects.find((s) => s.id === entry.subject_id)?.subject_name || 'Unknown'}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {teachers.find((t) => t.id?.toString() === entry.teacher_id?.toString())?.name || 'No Teacher'}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {entry.start_time} - {entry.end_time}
                                </div>
                                {isModified && (
                                  <Badge variant="outline" className="mt-1 text-xs">
                                    {entry.isNew ? 'New' : 'Modified'}
                                  </Badge>
                                )}
                              </div>
                            ) : isDeleted ? (
                              <div className="h-[80px] flex items-center justify-center">
                                <Badge variant="destructive" className="text-xs">
                                  Deleted
                                </Badge>
                              </div>
                            ) : (
                              <div className="h-[80px] flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
                                <Plus className="h-4 w-4" />
                              </div>
                            )}
                          </td>
                        );
                      })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg">
              {currentCellKey && localEntries.get(currentCellKey) && !localEntries.get(currentCellKey)?.isDeleted
                ? 'Edit Schedule'
                : 'Add Schedule'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {currentCellKey && (
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm font-medium">
                  {currentCellKey.split('-')[0]}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_time">Start Time</Label>
                <Input
                  id="start_time"
                  type="time"
                  step="60"
                  value={formData.start_time}
                  onChange={async (e) => {
                    console.log('⏰ Start time changed:', e.target.value);
                    setFormData((prev) => ({ ...prev, start_time: e.target.value }));
                    // Re-check conflicts when time changes
                    if (formData.teacher_id && formData.end_time && currentCellKey) {
                      const [day] = currentCellKey.split('-');
                      const existingEntry = localEntries.get(currentCellKey);
                      await checkTeacherConflicts(
                        formData.teacher_id,
                        day,
                        e.target.value,
                        formData.end_time,
                        existingEntry?.id
                      );
                    }
                  }}
                  className="cursor-pointer"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_time">End Time</Label>
                <Input
                  id="end_time"
                  type="time"
                  step="60"
                  value={formData.end_time}
                  onChange={async (e) => {
                    console.log('⏰ End time changed:', e.target.value);
                    setFormData((prev) => ({ ...prev, end_time: e.target.value }));
                    // Re-check conflicts when time changes
                    if (formData.teacher_id && formData.start_time && currentCellKey) {
                      const [day] = currentCellKey.split('-');
                      const existingEntry = localEntries.get(currentCellKey);
                      await checkTeacherConflicts(
                        formData.teacher_id,
                        day,
                        formData.start_time,
                        e.target.value,
                        existingEntry?.id
                      );
                    }
                  }}
                  className="cursor-pointer"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Subject</Label>
              <Select
                value={formData.subject_id?.toString() || ''}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, subject_id: Number(value) }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.length === 0 ? (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      No subjects available
                    </div>
                  ) : (
                    subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id.toString()}>
                        {subject.subject_name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Teacher</Label>
              <Select
                value={formData.teacher_id?.toString() || ''}
                onValueChange={async (value) => {
                  setFormData((prev) => ({ ...prev, teacher_id: Number(value) }));
                  // Check for conflicts when teacher is selected
                  if (currentCellKey && formData.start_time && formData.end_time) {
                    const [day] = currentCellKey.split('-');
                    const existingEntry = localEntries.get(currentCellKey);
                    await checkTeacherConflicts(
                      Number(value),
                      day,
                      formData.start_time,
                      formData.end_time,
                      existingEntry?.id
                    );
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.length === 0 ? (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      No teachers available
                    </div>
                  ) : (
                    teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id?.toString() || ''}>
                        {teacher.name}
                        {teacher.employee_code && (
                          <span className="text-muted-foreground ml-2">
                            ({teacher.employee_code})
                          </span>
                        )}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Conflicts Warning */}
            {checkingConflicts && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Checking for teacher conflicts...
                </AlertDescription>
              </Alert>
            )}

            {conflicts.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-semibold mb-2">⚠️ Teacher Conflict Detected!</div>
                  <div className="text-sm space-y-2">
                    {conflicts.map((conflict, index) => (
                      <div key={index} className="bg-destructive/10 p-2 rounded border border-destructive/20">
                        <div className="font-medium">Class: {conflict.class}</div>
                        <div>Subject: {conflict.subject}</div>
                        <div>Time: {conflict.time}</div>
                        <div className="text-xs mt-1 opacity-75">
                          This teacher is already assigned to another class at this time.
                        </div>
                      </div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-between pt-4">
              {currentCellKey && localEntries.get(currentCellKey) && !localEntries.get(currentCellKey)?.isDeleted && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDeleteEntryLocally}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
              <div className="flex gap-2 ml-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveEntryLocally}>
                  <Save className="h-4 w-4 mr-2" />
                  Update
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Periods Configuration Dialog */}
      <Dialog open={periodsDialogOpen} onOpenChange={setPeriodsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configure Periods Per Day
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Set the number of periods for each day. Different days can have different number of periods.
            </p>

            <div className="space-y-3">
              {DAYS.map((day) => (
                <div key={day} className="flex items-center justify-between gap-4 p-3 border rounded-lg">
                  <Label className="font-medium min-w-[100px]">{day}</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateDayPeriods(day, (localPeriodsConfig[day] || DEFAULT_PERIODS_PER_DAY) - 1)}
                      disabled={(localPeriodsConfig[day] || DEFAULT_PERIODS_PER_DAY) <= 1}
                    >
                      -
                    </Button>
                    <Input
                      type="number"
                      min="1"
                      max="12"
                      value={localPeriodsConfig[day] || DEFAULT_PERIODS_PER_DAY}
                      onChange={(e) => handleUpdateDayPeriods(day, parseInt(e.target.value) || 1)}
                      className="w-20 text-center"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateDayPeriods(day, (localPeriodsConfig[day] || DEFAULT_PERIODS_PER_DAY) + 1)}
                      disabled={(localPeriodsConfig[day] || DEFAULT_PERIODS_PER_DAY) >= 12}
                    >
                      +
                    </Button>
                    <span className="text-sm text-muted-foreground min-w-[60px]">
                      {localPeriodsConfig[day] || DEFAULT_PERIODS_PER_DAY} period{(localPeriodsConfig[day] || DEFAULT_PERIODS_PER_DAY) !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setPeriodsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSavePeriodsConfig}>
                <Save className="h-4 w-4 mr-2" />
                Save Configuration
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Instructions */}
      {!selectedClass && (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Class Selected</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Select a class from the dropdown above to view or manage its timetable
            </p>
            <Badge variant="outline">Click cells to edit • Custom timings • Batch save</Badge>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Timetable;

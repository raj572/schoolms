import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  createQRSession,
  getQRSessionStatus,
  getSchoolClasses,
  getSchoolSubjects,
} from '@/services/attendanceService';
import { QrCode, Users, CheckCircle, Clock, PlayCircle, StopCircle } from 'lucide-react';
import { format } from 'date-fns';
import { QRCodeSVG } from 'qrcode.react';

interface QRSession {
  id: number;
  session_code: string;
  expires_at: string;
  total_students: number;
  checked_in_count: number;
  status: 'active' | 'completed' | 'expired';
}

interface CheckedInStudent {
  id: number;
  name: string;
  roll_no: string;
  check_in_time: string;
}

const QRCheckIn: React.FC = () => {
  const { toast } = useToast();
  
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedClass, setSelectedClass] = useState<number>();
  const [selectedPeriod, setSelectedPeriod] = useState<number>();
  const [selectedSubject, setSelectedSubject] = useState<number>();
  const [duration, setDuration] = useState(30);
  const [classes, setClasses] = useState<Array<{ id: number; class: string; section: string }>>([]);
  const [subjects, setSubjects] = useState<Array<{ id: number; subject_name: string }>>([]);
  const [session, setSession] = useState<QRSession | null>(null);
  const [checkedInStudents, setCheckedInStudents] = useState<CheckedInStudent[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClassesAndSubjects();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (session && session.status === 'active') {
      // Poll for updates every 3 seconds
      interval = setInterval(() => {
        fetchSessionStatus();
      }, 3000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [session]);

  const fetchClassesAndSubjects = async () => {
    const schoolId = Number(localStorage.getItem('school_id'));
    if (!schoolId) return;
    
    try {
      // Fetch classes and subjects in parallel
      const [classesRes, subjectsRes] = await Promise.all([
        getSchoolClasses(schoolId),
        getSchoolSubjects(schoolId),
      ]);
      
      if (classesRes.status && classesRes.data) {
        const classList = Array.isArray(classesRes.data) ? classesRes.data : [];
        setClasses(classList);
        if (classList.length > 0) setSelectedClass(classList[0].id);
      }
      
      if (subjectsRes.status && subjectsRes.data) {
        const subjectList = Array.isArray(subjectsRes.data) ? subjectsRes.data : [];
        setSubjects(subjectList);
        if (subjectList.length > 0) setSelectedSubject(subjectList[0].id);
      }
      
      setSelectedPeriod(1);
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  const fetchSessionStatus = async () => {
    if (!session) return;

    try {
      const response = await getQRSessionStatus(session.id);
      if (response.status) {
        setSession(response.data.session);
        setCheckedInStudents(response.data.checked_in_students || []);
      }
    } catch (error) {
      console.error('Fetch session status error:', error);
    }
  };

  const handleStartSession = async () => {
    if (!selectedClass) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please select a class',
      });
      return;
    }

    try {
      setLoading(true);
      
      const response = await createQRSession({
        class_id: selectedClass,
        subject_id: selectedPeriod ? selectedSubject : undefined,
        period_number: selectedPeriod,
        session_date: selectedDate,
        duration_minutes: duration,
      });

      if (response.status) {
        setSession(response.data.session);
        toast({
          title: 'Session Started',
          description: 'Students can now scan the QR code to check in',
        });
      }
    } catch (error) {
      console.error('Start session error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEndSession = () => {
    if (session) {
      setSession({ ...session, status: 'completed' });
      toast({
        title: 'Session Ended',
        description: `${session.checked_in_count} students checked in`,
      });
    }
  };

  const completionPercentage = session 
    ? Math.round((session.checked_in_count / session.total_students) * 100)
    : 0;

  const remainingTime = session?.expires_at
    ? Math.max(0, Math.floor((new Date(session.expires_at).getTime() - Date.now()) / 1000))
    : 0;

  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;

  return (
    <div className="space-y-6">
      {!session ? (
        /* Setup Form */
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              Create QR Attendance Session
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="class">Class</Label>
                <Select
                  value={selectedClass?.toString() || ''}
                  onValueChange={(value) => setSelectedClass(Number(value))}
                >
                  <SelectTrigger id="class">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id.toString()}>
                        {cls.class} - {cls.section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="period">Period (Optional)</Label>
                <Select
                  value={selectedPeriod?.toString() || 'none'}
                  onValueChange={(value) => setSelectedPeriod(value === 'none' ? undefined : Number(value))}
                >
                  <SelectTrigger id="period">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((p) => (
                      <SelectItem key={p} value={p.toString()}>
                        Period {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject (Optional)</Label>
                <Select
                  value={selectedSubject?.toString() || 'none'}
                  onValueChange={(value) => setSelectedSubject(value === 'none' ? undefined : Number(value))}
                >
                  <SelectTrigger id="subject">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {subjects.map((sub) => (
                      <SelectItem key={sub.id} value={sub.id.toString()}>
                        {sub.subject_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Session Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min={5}
                  max={120}
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                />
              </div>
            </div>

            <Button
              onClick={handleStartSession}
              disabled={loading || !selectedClass}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <PlayCircle className="w-4 h-4 mr-2" />
              {loading ? 'Starting...' : 'Start QR Session'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Active Session */
        <>
          {/* QR Code Display */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>QR Code</span>
                  <Badge variant={session.status === 'active' ? 'default' : 'secondary'}>
                    {session.status}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                {session.status === 'active' ? (
                  <>
                    <div className="p-6 bg-white rounded-lg">
                      <QRCodeSVG value={session.session_code} size={200} />
                    </div>
                    <p className="mt-4 text-sm text-muted-foreground">
                      Session Code: <span className="font-mono font-bold text-foreground">{session.session_code}</span>
                    </p>
                    <div className="mt-4 text-center">
                      <div className="text-3xl font-bold text-primary">
                        {minutes}:{seconds.toString().padStart(2, '0')}
                      </div>
                      <p className="text-xs text-muted-foreground">Time Remaining</p>
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground py-8">Session has ended</p>
                )}
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Check-in Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Progress</span>
                    <span className="text-sm font-medium">{completionPercentage}%</span>
                  </div>
                  <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-primary/10 rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-primary">{session.checked_in_count}</p>
                    <p className="text-sm text-muted-foreground">Checked In</p>
                  </div>
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-foreground">{session.total_students}</p>
                    <p className="text-sm text-muted-foreground">Total Students</p>
                  </div>
                </div>

                {session.status === 'active' && (
                  <Button
                    onClick={handleEndSession}
                    variant="outline"
                    className="w-full"
                  >
                    <StopCircle className="w-4 h-4 mr-2" />
                    End Session
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Live Check-in List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Live Check-ins ({checkedInStudents.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {checkedInStudents.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {checkedInStudents.map((student, index) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg border border-emerald-200 dark:border-emerald-800 animate-in fade-in slide-in-from-right"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{student.name}</p>
                          <p className="text-sm text-muted-foreground">Roll: {student.roll_no}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="text-emerald-700 border-emerald-300">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(student.check_in_time).toLocaleTimeString()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <QrCode className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Waiting for students to check in...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default QRCheckIn;


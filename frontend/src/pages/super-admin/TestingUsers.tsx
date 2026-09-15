import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Shield, KeyRound, Copy, Check, Search, ExternalLink, UserCheck, AlertTriangle, Monitor, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TestAccount {
  role: string;
  roleDisplayName: string;
  email: string;
  username: string;
  schoolId: string;
  table: string;
  password: string;
  description: string;
  badgeColor: string;
  loginPath: string;
  targetPath: string;
}

export default function SuperAdminTestingUsers() {
  const { toast } = useToast();
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [copiedPassword, setCopiedPassword] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected account for dialog prompt
  const [selectedAccount, setSelectedAccount] = useState<TestAccount | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const universalPassword = 'password';

  const testAccounts: TestAccount[] = [
    {
      role: 'super_admin',
      roleDisplayName: 'Super Admin',
      email: 'superadmin@school.com',
      username: 'superadmin_test',
      schoolId: 'N/A (Global)',
      table: 'super_admins',
      password: universalPassword,
      description: 'Platform owner with full system access and plan management.',
      badgeColor: 'bg-purple-500/10 text-purple-600 border-purple-500/30',
      loginPath: '/super-admin/login',
      targetPath: '/super-admin/dashboard',
    },
    {
      role: 'administrator',
      roleDisplayName: 'Administrator',
      email: 'admin@school.com',
      username: 'admin_test',
      schoolId: '1',
      table: 'users',
      password: universalPassword,
      description: 'School owner who sets up schools, staff, and subscription plans.',
      badgeColor: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
      loginPath: '/login?email=admin@school.com&role=administrator&school_id=1',
      targetPath: '/administrator/dashboard',
    },
    {
      role: 'principal',
      roleDisplayName: 'Principal',
      email: 'principal@school.com',
      username: 'principal_test',
      schoolId: '1',
      table: 'users',
      password: universalPassword,
      description: 'Head of institution overseeing classes, timetables & reports.',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
      loginPath: '/login?email=principal@school.com&role=principal&school_id=1',
      targetPath: '/principal/dashboard',
    },
    {
      role: 'teacher',
      roleDisplayName: 'Teacher',
      email: 'teacher@school.com',
      username: 'EMP001',
      schoolId: '1',
      table: 'teachers',
      password: universalPassword,
      description: 'Faculty member marking attendance, exams & syllabus.',
      badgeColor: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/30',
      loginPath: '/login?email=teacher@school.com&role=teacher&school_id=1',
      targetPath: '/teacher/dashboard',
    },
    {
      role: 'accountant',
      roleDisplayName: 'Accountant',
      email: 'accountant@school.com',
      username: 'accountant_test',
      schoolId: '1',
      table: 'users',
      password: universalPassword,
      description: 'Finance manager handling student fee collections & invoices.',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/30',
      loginPath: '/login?email=accountant@school.com&role=accountant&school_id=1',
      targetPath: '/accountant/dashboard',
    },
    {
      role: 'student',
      roleDisplayName: 'Student',
      email: 'student@school.com',
      username: 'student_test',
      schoolId: '1',
      table: 'students',
      password: universalPassword,
      description: 'Class 10A student accessing results, attendance & dues.',
      badgeColor: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
      loginPath: '/login?email=student@school.com&role=student&school_id=1',
      targetPath: '/student/dashboard',
    },
    {
      role: 'parent',
      roleDisplayName: 'Parent',
      email: 'parent@school.com',
      username: 'father_test',
      schoolId: '1',
      table: 'parents',
      password: universalPassword,
      description: 'Parent viewing child academic progress & paying online fees.',
      badgeColor: 'bg-rose-500/10 text-rose-600 border-rose-500/30',
      loginPath: '/login?email=parent@school.com&role=parent&school_id=1',
      targetPath: '/parent/dashboard',
    },
    {
      role: 'librarian',
      roleDisplayName: 'Librarian',
      email: 'librarian@school.com',
      username: 'librarian_test',
      schoolId: '1',
      table: 'users',
      password: universalPassword,
      description: 'Library manager controlling book catalog & issue logs.',
      badgeColor: 'bg-teal-500/10 text-teal-600 border-teal-500/30',
      loginPath: '/login?email=librarian@school.com&role=librarian&school_id=1',
      targetPath: '/librarian/dashboard',
    },
    {
      role: 'warden',
      roleDisplayName: 'Warden',
      email: 'warden@school.com',
      username: 'warden_test',
      schoolId: '1',
      table: 'users',
      password: universalPassword,
      description: 'Hostel & mess warden managing room allocations.',
      badgeColor: 'bg-orange-500/10 text-orange-600 border-orange-500/30',
      loginPath: '/login?email=warden@school.com&role=warden&school_id=1',
      targetPath: '/warden/dashboard',
    },
  ];

  const handleCopy = (text: string, type: 'email' | 'password') => {
    navigator.clipboard.writeText(text);
    if (type === 'email') {
      setCopiedEmail(text);
      setTimeout(() => setCopiedEmail(null), 2000);
    } else {
      setCopiedPassword(text);
      setTimeout(() => setCopiedPassword(null), 2000);
    }
    toast({
      title: 'Copied to Clipboard',
      description: `${type === 'email' ? 'Email' : 'Password'} (${text}) copied!`,
    });
  };

  const handleOpenPanelPrompt = (account: TestAccount) => {
    setSelectedAccount(account);
    setIsModalOpen(true);
  };

  const getFullLoginUrl = (path: string) => {
    return `${window.location.origin}${path}`;
  };

  const handleCopyFullUrl = () => {
    if (selectedAccount) {
      const url = getFullLoginUrl(selectedAccount.loginPath);
      navigator.clipboard.writeText(url);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
      toast({
        title: 'URL Copied!',
        description: 'Login URL copied to clipboard. Paste it in an Incognito or secondary browser window.',
      });
    }
  };

  const filteredAccounts = testAccounts.filter(acc =>
    acc.roleDisplayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    acc.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    acc.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
            <UserCheck className="w-8 h-8 text-primary" />
            Testing Accounts & Credentials
          </h1>
          <p className="text-muted-foreground mt-1">
            Pre-seeded test accounts for testing feature access across all system roles.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-2 rounded-xl text-sm font-semibold text-primary">
          <KeyRound className="w-4 h-4 text-primary" />
          <span>Universal Test Password: </span>
          <code className="bg-background px-2 py-0.5 rounded border border-border text-foreground font-mono">
            {universalPassword}
          </code>
        </div>
      </div>

      {/* Info Card */}
      <Card className="border border-amber-500/30 bg-amber-500/5">
        <CardContent className="pt-6 flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-sm space-y-1">
            <p className="font-medium text-foreground">Multi-Session Testing Tip:</p>
            <p className="text-muted-foreground">
              To test different roles simultaneously alongside Super Admin, open the role login link in an <strong>Incognito Window</strong> or another browser profile (Chrome/Edge/Firefox).
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Filter and Search */}
      <div className="flex justify-between items-center gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search role, email, or feature..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Showing {filteredAccounts.length} of {testAccounts.length} testing roles
        </p>
      </div>

      {/* Accounts Table */}
      <Card className="border border-border/60 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[180px]">Role</TableHead>
              <TableHead className="w-[240px]">Testing Email</TableHead>
              <TableHead className="w-[150px]">School ID</TableHead>
              <TableHead className="w-[140px]">Password</TableHead>
              <TableHead>Scope & Capabilities</TableHead>
              <TableHead className="text-right w-[180px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAccounts.map((account, idx) => (
              <TableRow key={idx} className="hover:bg-muted/40 transition-colors">
                <TableCell>
                  <div className="space-y-1">
                    <Badge variant="outline" className={`font-semibold ${account.badgeColor}`}>
                      {account.roleDisplayName}
                    </Badge>
                    <p className="text-[11px] text-muted-foreground font-mono">Table: {account.table}</p>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-foreground">{account.email}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      onClick={() => handleCopy(account.email, 'email')}
                      title="Copy Email"
                    >
                      {copiedEmail === account.email ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </TableCell>

                <TableCell>
                  <span className="text-xs font-semibold px-2 py-1 bg-muted rounded border border-border">
                    {account.schoolId}
                  </span>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-2">
                    <code className="text-xs font-mono bg-muted/80 px-2 py-1 rounded text-foreground">
                      {account.password}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      onClick={() => handleCopy(account.password, 'password')}
                      title="Copy Password"
                    >
                      {copiedPassword === account.password ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </TableCell>

                <TableCell>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {account.description}
                  </p>
                </TableCell>

                <TableCell className="text-right">
                  <Button
                    variant="default"
                    size="sm"
                    className="gap-1.5 text-xs font-medium"
                    onClick={() => handleOpenPanelPrompt(account)}
                  >
                    Open Panel
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Modal Dialog for Opening in Incognito / Different Browser */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Monitor className="w-5 h-5 text-primary" />
              Open {selectedAccount?.roleDisplayName} Panel
            </DialogTitle>
            <DialogDescription>
              To keep your Super Admin session active in this window, open this role test link in an <strong>Incognito Window</strong> or another browser profile.
            </DialogDescription>
          </DialogHeader>

          {selectedAccount && (
            <div className="space-y-4 py-3 text-sm">
              <div className="bg-muted p-3 rounded-lg space-y-2 border border-border">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Account Role:</span>
                  <Badge variant="outline" className={selectedAccount.badgeColor}>
                    {selectedAccount.roleDisplayName}
                  </Badge>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Login Email:</span>
                  <span className="font-mono text-foreground">{selectedAccount.email}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Password:</span>
                  <span className="font-mono text-foreground">{selectedAccount.password}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Direct Auto-Fill Login Link:</label>
                <div className="flex items-center gap-2">
                  <Input
                    readOnly
                    value={getFullLoginUrl(selectedAccount.loginPath)}
                    className="font-mono text-xs text-foreground bg-muted"
                  />
                  <Button size="icon" variant="outline" onClick={handleCopyFullUrl} title="Copy URL">
                    {copiedUrl ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="w-full sm:w-auto text-xs"
              onClick={handleCopyFullUrl}
            >
              <Copy className="w-3.5 h-3.5 mr-1.5" />
              Copy Incognito URL
            </Button>

            <Button
              variant="default"
              className="w-full sm:w-auto text-xs gap-1"
              onClick={() => {
                if (selectedAccount) {
                  window.open(selectedAccount.loginPath, '_blank');
                  setIsModalOpen(false);
                }
              }}
            >
              Open in New Tab
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


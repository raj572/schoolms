import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  MessageSquare,
  Send,
  Bell,
  Mail,
  Phone,
  Plus,
  Search,
  Eye,
  Settings,
  Trash2,
  Edit,
  UserCheck
} from "lucide-react";
import { useCommunicationStore } from "@/store/useCommunicationStore";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";

export const Communication = () => {
  const { authUser } = useAuthStore();
  const {
    loadConversations,
    loadNotices,
    loadStats,
    loadPermissions,
    loadContactableUsers,
    createNotice,
    sendPersonalMessage,
    toggleNoticeActive,
    deleteNotice,
    updatePermissions,
    conversations,
    notices,
    stats,
    permissions,
    contactableUsers,
    isLoading,
    isSendingMessage,
    isCreatingNotice,
  } = useCommunicationStore();

  const [newMessage, setNewMessage] = useState({
    recipient: "",
    recipientRole: "",
    recipientId: "",
    subject: "",
    message: "",
    priority: "medium"
  });

  const [newNotice, setNewNotice] = useState({
    title: "",
    content: "",
    type: "notice",
    priority: "medium",
    target_roles: ["all"],
    publish_date: "",
    expiry_date: "",
  });

  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false);
  const [isComposeDialogOpen, setIsComposeDialogOpen] = useState(false);
  const [isNoticeDialogOpen, setIsNoticeDialogOpen] = useState(false);
  const [tempPermissions, setTempPermissions] = useState(permissions);

  const principalId = authUser ? parseInt(authUser.id) : null;
  const schoolId = authUser?.school_id ? parseInt(authUser.school_id) : null;

  useEffect(() => {
    if (principalId && schoolId) {
      loadConversations(principalId);
      loadStats(principalId);
      loadPermissions(principalId);
      loadContactableUsers(principalId);
      loadNotices(schoolId);
    }
  }, [principalId, schoolId]);

  useEffect(() => {
    setTempPermissions(permissions);
  }, [permissions]);

  const handleSendMessage = async () => {
    if (!newMessage.recipientId || !newMessage.message) {
      toast.error("Please fill all required fields");
      return;
    }

    const success = await sendPersonalMessage({
      sender_role: "principal",
      sender_id: principalId!,
      receiver_role: newMessage.recipientRole,
      receiver_id: parseInt(newMessage.recipientId),
      message: newMessage.message,
      subject: newMessage.subject,
    });

    if (success) {
      setIsComposeDialogOpen(false);
      setNewMessage({ recipient: "", recipientRole: "", recipientId: "", subject: "", message: "", priority: "medium" });
      loadConversations(principalId!);
    }
  };

  const handleCreateNotice = async () => {
    if (!newNotice.title || !newNotice.content) {
      toast.error("Please fill all required fields");
      return;
    }

    const success = await createNotice({
      school_id: schoolId!,
      title: newNotice.title,
      content: newNotice.content,
      type: newNotice.type as any,
      priority: newNotice.priority as any,
      target_roles: newNotice.target_roles,
      publish_date: newNotice.publish_date || undefined,
      expiry_date: newNotice.expiry_date || undefined,
      created_by: principalId!,
      created_by_role: "principal",
    });

    if (success) {
      setIsNoticeDialogOpen(false);
      setNewNotice({ title: "", content: "", type: "notice", priority: "medium", target_roles: ["all"], publish_date: "", expiry_date: "" });
      loadNotices(schoolId!);
    }
  };

  const handleUpdatePermissions = async () => {
    if (tempPermissions) {
      const success = await updatePermissions(principalId!, {
        allow_from_teachers: tempPermissions.allow_from_teachers,
        allow_from_parents: tempPermissions.allow_from_parents,
        allow_from_students: tempPermissions.allow_from_students,
        allow_from_administrator: tempPermissions.allow_from_administrator,
      });

      if (success) {
        setIsPermissionsDialogOpen(false);
      }
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": case "urgent":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-bold">Communication</h2>
          <p className="text-gray-500 text-xs">Manage messages, notices, and announcements</p>
        </div>
        <div className="flex gap-3">
          <Dialog open={isPermissionsDialogOpen} onOpenChange={setIsPermissionsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="hover:bg-navbar hover:text-accent">
                <Settings className="mr-2 h-4 w-4" />
                Message Settings
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Message Permissions</DialogTitle>
                <DialogDescription>
                  Control who can send you messages
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="teachers">Allow messages from Teachers</Label>
                  <Switch
                    id="teachers"
                    checked={tempPermissions?.allow_from_teachers ?? true}
                    onCheckedChange={(checked) =>
                      setTempPermissions({ ...tempPermissions!, allow_from_teachers: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="parents">Allow messages from Parents</Label>
                  <Switch
                    id="parents"
                    checked={tempPermissions?.allow_from_parents ?? true}
                    onCheckedChange={(checked) =>
                      setTempPermissions({ ...tempPermissions!, allow_from_parents: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="students">Allow messages from Students</Label>
                  <Switch
                    id="students"
                    checked={tempPermissions?.allow_from_students ?? true}
                    onCheckedChange={(checked) =>
                      setTempPermissions({ ...tempPermissions!, allow_from_students: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="admin">Allow messages from Administrator</Label>
                  <Switch
                    id="admin"
                    checked={tempPermissions?.allow_from_administrator ?? true}
                    onCheckedChange={(checked) =>
                      setTempPermissions({ ...tempPermissions!, allow_from_administrator: checked })
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsPermissionsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdatePermissions}>
                  Save Changes
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button onClick={() => setIsComposeDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Message
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-card shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-500 text-xs">Total Messages</p>
                <p className="text-lg font-bold">{stats?.total_messages || 0}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-500 text-xs">Active Notices</p>
                <p className="text-lg font-bold">{stats?.active_notices || 0}</p>
              </div>
              <Bell className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-500 text-xs">Unread Messages</p>
                <p className="text-lg font-bold">{stats?.unread_messages || 0}</p>
              </div>
              <Mail className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-500 text-xs">Conversations</p>
                <p className="text-lg font-bold">{conversations?.length || 0}</p>
              </div>
              <Phone className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="messages" className="w-full">
        <div className="overflow-x-auto pb-2">
          <TabsList className="flex min-w-max w-full grid-cols-4 bg-muted/60 p-1">
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="notices">Notices</TabsTrigger>
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
            <TabsTrigger value="compose">Compose</TabsTrigger>
          </TabsList>
        </div>

        {/* Messages Tab */}
        <TabsContent value="messages" className="space-y-4">
          <Card className="bg-gradient-card shadow-soft">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-lg">Recent Conversations</CardTitle>
                  <CardDescription className="text-xs text-gray-500">Your recent communications</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading conversations...</div>
              ) : conversations && conversations.length > 0 ? (
                <div className="space-y-3">
                  {conversations.map((conversation, index) => (
                    <div key={index} className="flex items-start justify-between p-4 rounded-lg border bg-background/50 hover:bg-accent/20 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm">Conversation</h4>
                          <Badge variant="outline" className="text-xs">
                            {conversation.participant_type}
                          </Badge>
                        </div>
                        {conversation.last_message && (
                          <>
                            <p className="text-gray-500 text-xs">{conversation.last_message.message}</p>
                            <p className="text-gray-500 text-xs mt-1">
                              {new Date(conversation.last_message.created_at).toLocaleString()}
                            </p>
                          </>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">No conversations yet</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notices Tab */}
        <TabsContent value="notices" className="space-y-4">
          <Card className="bg-gradient-card shadow-soft">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-lg">School Notices</CardTitle>
                  <CardDescription className="text-xs text-gray-500">Official notices and circular announcements</CardDescription>
                </div>
                <Button onClick={() => setIsNoticeDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Notice
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading notices...</div>
              ) : notices && notices.length > 0 ? (
                <div className="space-y-4">
                  {notices.map((notice) => (
                    <Card key={notice.id} className="border-l-4 border-l-primary">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-sm">{notice.title}</CardTitle>
                          <div className="flex gap-2">
                            <Badge variant={getPriorityColor(notice.priority)}>
                              {notice.priority}
                            </Badge>
                            <Badge variant={notice.is_active ? "default" : "secondary"}>
                              {notice.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-gray-500 text-xs mb-3">{notice.content}</p>
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex gap-4 text-gray-500 text-xs">
                            {notice.publish_date && <span>Published: {formatDate(notice.publish_date)}</span>}
                            {notice.expiry_date && <span>Expires: {formatDate(notice.expiry_date)}</span>}
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => toggleNoticeActive(notice.id)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => deleteNotice(notice.id)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">No notices yet</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Announcements Tab */}
        <TabsContent value="announcements" className="space-y-4">
          <Card className="bg-gradient-card shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg">Recent Announcements</CardTitle>
              <CardDescription className="text-xs text-gray-500">School-wide announcements and updates</CardDescription>
            </CardHeader>
            <CardContent>
              {notices && notices.filter(n => n.type === "announcement").length > 0 ? (
                <div className="space-y-3">
                  {notices
                    .filter(n => n.type === "announcement")
                    .map((notice) => (
                      <div key={notice.id} className="flex items-center justify-between p-4 rounded-lg bg-accent/30">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm mb-1">{notice.title}</h4>
                          <p className="text-gray-500 text-xs mb-2">{notice.content}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 text-xs">{formatDate(notice.created_at)}</span>
                            <Badge variant="outline" className="text-xs">
                              {notice.type}
                            </Badge>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">No announcements yet</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compose Tab */}
        <TabsContent value="compose" className="space-y-4">
          <Card className="bg-gradient-card shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg">Compose New Message</CardTitle>
              <CardDescription className="text-xs text-gray-500">Send messages to students, parents, or staff</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Recipient Role</label>
                  <Select onValueChange={(value) => setNewMessage({ ...newMessage, recipientRole: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select recipient role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="teacher">Teacher</SelectItem>
                      <SelectItem value="parent">Parent</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="administrator">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Subject</label>
                  <Input 
                    placeholder="Enter subject line"
                    value={newMessage.subject}
                    onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Message</label>
                <Textarea 
                  placeholder="Type your message here..."
                  value={newMessage.message}
                  onChange={(e) => setNewMessage({ ...newMessage, message: e.target.value })}
                  rows={6}
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline">Save Draft</Button>
                <Button onClick={handleSendMessage} disabled={isSendingMessage}>
                  <Send className="mr-2 h-4 w-4" />
                  {isSendingMessage ? "Sending..." : "Send Message"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Compose Message Dialog */}
      <Dialog open={isComposeDialogOpen} onOpenChange={setIsComposeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Compose New Message</DialogTitle>
            <DialogDescription>Send a message to a specific recipient</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Recipient</Label>
              <Input
                placeholder="Select recipient"
                value={newMessage.recipient}
                onChange={(e) => setNewMessage({ ...newMessage, recipient: e.target.value })}
              />
            </div>
            <div>
              <Label>Subject</Label>
              <Input
                placeholder="Enter subject"
                value={newMessage.subject}
                onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
              />
            </div>
            <div>
              <Label>Message</Label>
              <Textarea
                placeholder="Type your message..."
                value={newMessage.message}
                onChange={(e) => setNewMessage({ ...newMessage, message: e.target.value })}
                rows={5}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsComposeDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendMessage} disabled={isSendingMessage}>
              {isSendingMessage ? "Sending..." : "Send"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Notice Dialog */}
      <Dialog open={isNoticeDialogOpen} onOpenChange={setIsNoticeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Notice</DialogTitle>
            <DialogDescription>Create a school-wide notice or announcement</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Title</Label>
              <Input
                placeholder="Enter notice title"
                value={newNotice.title}
                onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
              />
            </div>
            <div>
              <Label>Content</Label>
              <Textarea
                placeholder="Enter notice content"
                value={newNotice.content}
                onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                rows={5}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <Select onValueChange={(value) => setNewNotice({ ...newNotice, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="notice">Notice</SelectItem>
                    <SelectItem value="announcement">Announcement</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="holiday">Holiday</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priority</Label>
                <Select onValueChange={(value) => setNewNotice({ ...newNotice, priority: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsNoticeDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateNotice} disabled={isCreatingNotice}>
              {isCreatingNotice ? "Creating..." : "Create Notice"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

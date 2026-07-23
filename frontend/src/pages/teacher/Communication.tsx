import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send, MessageCircle, Users, Bell, Plus, Reply, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  from: string;
  to: string;
  subject: string;
  content: string;
  timestamp: string;
  priority: "low" | "medium" | "high";
  read: boolean;
  type: "announcement" | "personal" | "group";
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  timestamp: string;
  priority: "low" | "medium" | "high";
  targetAudience: string;
}

const mockMessages: Message[] = [
  {
    id: "1",
    from: "Principal Johnson",
    to: "All Teachers",
    subject: "Staff Meeting Tomorrow",
    content: "Please attend the mandatory staff meeting tomorrow at 3 PM in the conference room.",
    timestamp: "2024-01-20 10:30",
    priority: "high",
    read: false,
    type: "announcement"
  },
  {
    id: "2",
    from: "Sarah Williams",
    to: "Mathematics Department",
    subject: "New Curriculum Materials",
    content: "The new mathematics curriculum materials have arrived. Please collect them from the resource center.",
    timestamp: "2024-01-19 14:15",
    priority: "medium",
    read: true,
    type: "group"
  },
  {
    id: "3",
    from: "Mike Chen",
    to: "You",
    subject: "Class Schedule Query",
    content: "Hi, I need to discuss the upcoming exam schedule for grade 10 mathematics.",
    timestamp: "2024-01-19 09:45",
    priority: "low",
    read: false,
    type: "personal"
  }
];

const mockAnnouncements: Announcement[] = [
  {
    id: "1",
    title: "Holiday Schedule Update",
    content: "Please note the updated holiday schedule for the upcoming semester. Classes will resume on January 15th.",
    author: "Administration",
    timestamp: "2024-01-18 16:00",
    priority: "high",
    targetAudience: "All Staff"
  },
  {
    id: "2",
    title: "Professional Development Workshop",
    content: "A professional development workshop on modern teaching methods will be held next Friday.",
    author: "HR Department",
    timestamp: "2024-01-17 11:30",
    priority: "medium",
    targetAudience: "Teaching Staff"
  }
];

const TeacherCommunication = () => {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [announcements, setAnnouncements] = useState<Announcement[]>(mockAnnouncements);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(false);
  const [newMessage, setNewMessage] = useState({
    to: "",
    subject: "",
    content: "",
    priority: "medium" as "low" | "medium" | "high",
    type: "personal" as const
  });
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    priority: "medium" as "low" | "medium" | "high",
    targetAudience: ""
  });
  const { toast } = useToast();

  const handleSendMessage = () => {
    if (!newMessage.to || !newMessage.subject || !newMessage.content) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const message: Message = {
      id: Math.random().toString(36).substr(2, 9),
      from: "You",
      ...newMessage,
      timestamp: new Date().toLocaleString(),
      read: false
    };

    setMessages([message, ...messages]);
    setNewMessage({
      to: "",
      subject: "",
      content: "",
      priority: "medium",
      type: "personal"
    });
    setIsComposeOpen(false);
    
    toast({
      title: "Success",
      description: "Message sent successfully"
    });
  };

  const handleCreateAnnouncement = () => {
    if (!newAnnouncement.title || !newAnnouncement.content || !newAnnouncement.targetAudience) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const announcement: Announcement = {
      id: Math.random().toString(36).substr(2, 9),
      ...newAnnouncement,
      author: "You",
      timestamp: new Date().toLocaleString()
    };

    setAnnouncements([announcement, ...announcements]);
    setNewAnnouncement({
      title: "",
      content: "",
      priority: "medium",
      targetAudience: ""
    });
    setIsAnnouncementOpen(false);
    
    toast({
      title: "Success",
      description: "Announcement created successfully"
    });
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      high: "destructive",
      medium: "default",
      low: "secondary"
    } as const;
    
    return (
      <Badge variant={variants[priority as keyof typeof variants]} className="capitalize">
        {priority}
      </Badge>
    );
  };

  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <div className="p-8 space-y-8 bg-gradient-subtle min-h-screen ml-9">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold ">
            Teacher Communication
          </h1>
          <p className="text-gray-500 text-xs mt-2">
            Stay connected with your colleagues and administration
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
            <DialogTrigger asChild>
              <Button >
                <Send className="mr-2 h-4 w-4" />
                Compose Message
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="text-center text-md">Compose New Message</DialogTitle>
                
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4 ">
                  <Label htmlFor="to" className="text-right">
                    To
                  </Label>
                  <Select onValueChange={(value) => setNewMessage({...newMessage, to: value})}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select recipient" />
                    </SelectTrigger>
                    <SelectContent className="text-gray-500">
                      <SelectItem value="All Teachers">All Teachers</SelectItem>
                      <SelectItem value="Mathematics Department">Mathematics Department</SelectItem>
                      <SelectItem value="Science Department">Science Department</SelectItem>
                      <SelectItem value="Principal Johnson">Principal Johnson</SelectItem>
                      <SelectItem value="Sarah Williams">Sarah Williams</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="subject" className="text-right">
                    Subject
                  </Label>
                  <Input
                    id="subject"
                    value={newMessage.subject}
                    onChange={(e) => setNewMessage({...newMessage, subject: e.target.value})}
                    className="col-span-3"
                    placeholder="Message subject"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="priority" className="text-right">
                    Priority
                  </Label>
                  <Select onValueChange={(value: "low" | "medium" | "high") => setNewMessage({...newMessage, priority: value})}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="content" className="text-right mt-2">
                    Message
                  </Label>
                  <Textarea
                    id="content"
                    value={newMessage.content}
                    onChange={(e) => setNewMessage({...newMessage, content: e.target.value})}
                    className="col-span-3"
                    placeholder="Type your message here..."
                    rows={4}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" className="hover:bg-destructive hover:text-accent" onClick={() => setIsComposeOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSendMessage}>
                  Send Message
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isAnnouncementOpen} onOpenChange={setIsAnnouncementOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Bell className="mr-2 h-4 w-4" />
                New Announcement
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create Announcement</DialogTitle>
                <DialogDescription>
                  Create a new announcement for staff
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">
                    Title
                  </Label>
                  <Input
                    id="title"
                    value={newAnnouncement.title}
                    onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                    className="col-span-3"
                    placeholder="Announcement title"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="audience" className="text-right">
                    Audience
                  </Label>
                  <Select onValueChange={(value) => setNewAnnouncement({...newAnnouncement, targetAudience: value})}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select target audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All Staff">All Staff</SelectItem>
                      <SelectItem value="Teaching Staff">Teaching Staff</SelectItem>
                      <SelectItem value="Administrative Staff">Administrative Staff</SelectItem>
                      <SelectItem value="Department Heads">Department Heads</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="ann-priority" className="text-right">
                    Priority
                  </Label>
                  <Select onValueChange={(value: "low" | "medium" | "high") => setNewAnnouncement({...newAnnouncement, priority: value})}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="ann-content" className="text-right mt-2">
                    Content
                  </Label>
                  <Textarea
                    id="ann-content"
                    value={newAnnouncement.content}
                    onChange={(e) => setNewAnnouncement({...newAnnouncement, content: e.target.value})}
                    className="col-span-3"
                    placeholder="Announcement content..."
                    rows={4}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" className="hover:bg-destructive hover:text-white" onClick={() => setIsAnnouncementOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateAnnouncement}>
                  Create Announcement
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
            <MessageCircle className="h-4 w-4 text-gray-500 text-xs" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadCount}</div>
            <p className=" text-gray-500 text-xs">
              Require attention
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <Send className="h-4 w-4 text-gray-500 text-xs" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{messages.length}</div>
            <p className=" text-gray-500 text-xs">
              All conversations
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Announcements</CardTitle>
            <Bell className="h-4 w-4 text-gray-500 text-xs" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{announcements.length}</div>
            <p className=" text-gray-500 text-xs">
              Official notices
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <Star className="h-4 w-4 text-gray-500 text-xs" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {messages.filter(m => m.priority === "high").length}
            </div>
            <p className=" text-gray-500 text-xs">
              Urgent items
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="messages" className="space-y-4">
        <TabsList>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
        </TabsList>
        
        <TabsContent value="messages">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Recent Messages</CardTitle>
              <CardDescription>
                Your latest communications and conversations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-4 rounded-lg border transition-colors ${
                      !message.read ? "bg-primary/5 border-primary/20" : "bg-background"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium">{message.from}</span>
                          <Badge variant="outline" className="text-xs">
                            {message.type}
                          </Badge>
                          {getPriorityBadge(message.priority)}
                          {!message.read && (
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                          )}
                        </div>
                        <h4 className="font-medium text-sm mb-1">{message.subject}</h4>
                        <p className=" text-gray-500 text-xs mb-2 line-clamp-2">
                          {message.content}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className=" text-gray-500 text-xs">
                            {message.timestamp}
                          </span>
                          <Button variant="outline" size="sm">
                            <Reply className="h-3 w-3 mr-1" />
                            Reply
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="announcements">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Official Announcements</CardTitle>
              <CardDescription>
                Important notices and updates from administration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="p-4 rounded-lg border bg-background"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium">{announcement.title}</h4>
                      {getPriorityBadge(announcement.priority)}
                    </div>
                    <p className=" text-gray-500 text-xs mb-3">
                      {announcement.content}
                    </p>
                    <div className="flex items-center justify-between text-gray-500 text-xs">
                      <span>By {announcement.author} • {announcement.targetAudience}</span>
                      <span>{announcement.timestamp}</span>
                    </div>
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

export default TeacherCommunication;